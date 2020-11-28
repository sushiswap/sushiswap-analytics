import React, { useMemo, useState } from "react";
import { extent, max } from "d3-array";
import { scaleLinear, scaleTime } from "@visx/scale";

import AreaChart from "./Area";
import { Brush } from "@visx/brush";
import { LinearGradient } from "@visx/gradient";
import { PatternLines } from "@visx/pattern";
import { Text } from "@visx/text";
import { deepPurple } from "@material-ui/core/colors";
import { withParentSize } from "@visx/responsive";

const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";
// export const accentColor = "#f6acc8";
export const accentColor = deepPurple[400];
export const background = "#584153";
export const background2 = "#af8baf";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "currentColor",
};

// accessors
const getDate = (d) => new Date(d.time);
const getStockValue = (d) => d.value;

function BrushChart({
  title,
  compact = false,
  data,
  width,
  height,
  margin = {
    top: 20,
    left: 50,
    bottom: 0,
    right: 20,
  },
}) {
  const [filteredStock, setFilteredStock] = useState(
    data.slice(data.length - 30, data.length - 1)
  );

  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const stockCopy = data.filter((s) => {
      const x = getDate(s).getTime();
      const y = getStockValue(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredStock(stockCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0
  );

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: extent(filteredStock, getDate),
      }),
    [xMax, filteredStock]
  );
  const stockScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [0, max(filteredStock, getStockValue) || 0],
        nice: true,
      }),
    [yMax, filteredStock]
  );
  const brushDateScale = useMemo(
    () =>
      scaleTime({
        range: [0, xBrushMax],
        domain: extent(data, getDate),
      }),
    [xBrushMax]
  );
  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data, getStockValue) || 0],
        nice: true,
      }),
    [yBrushMax]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: {
        x: brushDateScale(
          getDate(data[data.length >= 30 ? data.length - 30 : 0])
        ),
      },
      end: { x: brushDateScale(getDate(data[data.length - 1])) },
    }),
    [brushDateScale]
  );

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient
          id={GRADIENT_ID}
          from={background}
          to={background2}
          rotate={45}
        />
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          // fill={`url(#${GRADIENT_ID})`}
          rx={14}
        />
        <AreaChart
          hideBottomAxis={compact}
          data={filteredStock}
          width={width}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          xScale={dateScale}
          yScale={stockScale}
          gradientColor={background2}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={data}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
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
            onClick={() => setFilteredStock(data)}
            selectedBoxStyle={selectedBrushStyle}
          />
        </AreaChart>
        {title && (
          <Text
            y={margin.top / 2}
            x={width / 2}
            width={width}
            verticalAnchor="start"
            textAnchor="middle"
            fill="currentColor"
          >
            {title}
          </Text>
        )}
      </svg>
    </div>
  );
}

export default withParentSize(BrushChart);
