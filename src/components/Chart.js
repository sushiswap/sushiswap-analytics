import { Grid, GridColumns, GridRows } from "@visx/grid";
import { Paper, Typography } from "@material-ui/core";
import {
  Tooltip,
  defaultStyles,
  useTooltip,
  useTooltipInPortal,
} from "@visx/tooltip";
import { bisectDate, formatDate, getX, getY } from "app/core";
import { extent, max } from "d3-array";
import { scaleLinear, scaleTime } from "@visx/scale";
import { useCallback, useMemo, useState } from "react";

import Area from "./Area";
import Bar from "./Bar";
import { Brush } from "@visx/brush";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { PatternLines } from "@visx/pattern";
import { Text } from "@visx/text";
import { localPoint } from "@visx/event";
import millify from "millify";

const tooltipStyles = {
  ...defaultStyles,
  // background: "inherit",
  border: "1px solid initial",
  color: "initial",
  zIndex: 1702,
};

const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
export const accentColor = "#B93CF6";
export const background = "#584153";
export const background2 = "#af8baf";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "currentColor",
};

export default function ChartContainer(props) {
  return (
    <Paper
      variant="outlined"
      style={{
        display: "flex",
        position: "relative",
        height: props.height,
        flex: 1,
      }}
    >
      <ParentSize>
        {({ width, height }) => (
          <Chart {...props} width={width} height={height} />
        )}
      </ParentSize>
    </Paper>
  );
}

export function Chart({
  width,
  height,
  data,
  title = "Chart",
  margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  tooptip = false,
  brush = false,
  compact = false,
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
  // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

  const [filteredData, setFilteredData] = useState(
    data.slice(data.length - 30, data.length - 1)
  );

  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const dataCopy = data.filter((s) => {
      const x = getX(s).getTime();
      const y = getY(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredData(dataCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;

  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;

  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;

  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // Max
  const xMax = Math.max(width - margin.left - margin.right, 0);
  // const yMax = Math.max(height - margin.top - margin.bottom, 0);
  const yMax = Math.max(topChartHeight, 0);

  // Scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        // domain: [Math.min(...data.map(getX)), Math.max(...data.map(getX))],
        domain: extent(filteredData, getX),
      }),
    [xMax, filteredData]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.min(...filteredData.map((d) => getY(d))),
          Math.max(...filteredData.map((d) => getY(d))),
        ],
        nice: true,
      }),
    [yMax, filteredData]
  );
  // tooltip handler
  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getX(d1)) {
        d =
          x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(getY(d)) + margin.top,
      });
    },
    [showTooltip, yScale, xScale]
  );

  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0
  );

  const brushDateScale = useMemo(
    () =>
      scaleTime({
        range: [0, xBrushMax],
        domain: extent(data, getX),
      }),
    [xBrushMax]
  );

  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data, getY) || 0],
        nice: true,
      }),
    [yBrushMax]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: {
        x: brushDateScale(getX(data[data.length >= 30 ? data.length - 30 : 0])),
      },
      end: { x: brushDateScale(getX(data[data.length - 1])) },
    }),
    [brushDateScale]
  );

  if (width < 10) {
    return null;
  }

  return (
    // Set `ref={containerRef}` on the element corresponding to the coordinate system that
    // `left/top` (passed to `TooltipInPortal`) are relative to.
    <div>
      <svg ref={containerRef} width={width} height={height}>
        {/* <rect x={0} y={0} width={width} height={height} fill="transparent" /> */}
        {title && (
          <Text
            y={24}
            x={width / 2}
            width={width}
            height={16}
            verticalAnchor="start"
            textAnchor="middle"
            fill="currentColor"
          >
            {title}
          </Text>
        )}
        <GridRows
          top={margin.top}
          left={margin.left}
          scale={yScale}
          width={xMax}
          height={yMax}
          strokeDasharray="1,3"
          stroke="currentColor"
          strokeOpacity={0.2}
          pointerEvents="none"
        />
        <GridColumns
          top={margin.top}
          left={margin.left}
          scale={xScale}
          height={yMax}
          strokeDasharray="1,3"
          stroke="currentColor"
          strokeOpacity={0.2}
          pointerEvents="none"
        />
        <Area
          hideBottomAxis={compact}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={hideTooltip}
          data={filteredData}
          width={width}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          fill="url(#teal)"
          yMax={yMax}
          xScale={xScale}
          yScale={yScale}
        />

        {brush && (
          <Area
            hideBottomAxis
            hideLeftAxis
            data={data}
            width={width}
            yMax={yBrushMax}
            xScale={brushDateScale}
            yScale={brushStockScale}
            margin={brushMargin}
            top={topChartHeight + topChartBottomMargin + margin.top}
          >
            <PatternLines
              id={PATTERN_ID}
              height={8}
              width={8}
              stroke={accentColor}
              strokeWidth={1}
              orientation={["diagonal"]}
            />
            <Brush
              xScale={brushDateScale}
              yScale={brushStockScale}
              width={xBrushMax}
              height={yBrushMax}
              margin={brushMargin}
              handleSize={8}
              resizeTriggerAreas={["left", "right"]}
              brushDirection="horizontal"
              initialBrushPosition={initialBrushPosition}
              onChange={onBrushChange}
              onClick={() => setFilteredData(data)}
              selectedBoxStyle={selectedBrushStyle}
            />
          </Area>
        )}

        {tooltipData && (
          <Group>
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill="black"
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </Group>
        )}
      </svg>

      {tooptip && tooltipOpen && (
        <div>
          <TooltipInPortal
            key={Math.random()}
            top={tooltipTop - 12}
            left={tooltipLeft + 12}
            style={tooltipStyles}
          >
            <Typography variant="subtitle2">
              {millify(getY(tooltipData))}
            </Typography>
            <Typography variant="body2">
              {formatDate(getX(tooltipData))}
            </Typography>
          </TooltipInPortal>
          {/* <Tooltip
            top={innerHeight + margin.top - 14}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: "center",
              transform: "translateX(-50%)",
            }}
          >
            {formatDate(getX(tooltipData))}
          </Tooltip> */}
        </div>
      )}
    </div>
  );
}
