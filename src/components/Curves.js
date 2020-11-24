import { AreaClosed, LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GradientTealBlue, LinearGradient } from "@visx/gradient";
import {
  MarkerArrow,
  MarkerCircle,
  MarkerCross,
  MarkerLine,
  MarkerX,
} from "@visx/marker";
import { bisector, extent, max } from "d3-array";
import { curveMonotoneX, curveNatural } from "@visx/curve";
import { deepPurple, green, red } from "@material-ui/core/colors";
import { scaleLinear, scaleTime, scaleUtc } from "@visx/scale";
import { timeFormat, timeParse } from "d3-time-format";
import { useMemo, useState } from "react";

import { Brush } from "@visx/brush";
import Curve from "./Curve";
import { Group } from "@visx/group";
import { PatternLines } from "@visx/pattern";
import React from "react";
import { Text } from "@visx/text";
import millify from "millify";
import { withParentSize } from "@visx/responsive";

const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";
export const accentColor = deepPurple[400];
export const background = "#584153";
export const background2 = "#af8baf";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "currentColor",
};

const parseDate = timeParse("%Y-%m-%d");
const format = timeFormat("%b %d");
const formatDate = (date) => format(parseDate(date));

// data accessors
const getX = (d) => new Date(d.time);
const getY = (d) => d.value;

const axisColor = "currentColor";
const axisBottomTickLabelProps = {
  textAnchor: "middle",
  fontFamily: "Arial",
  fontSize: 10,
  fill: axisColor,
};
const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "Arial",
  fontSize: 10,
  textAnchor: "end",
  fill: axisColor,
};

const Curves = withParentSize(
  ({
    compact = false,
    parentWidth,
    parentHeight,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    data,
    title,
  }) => {
    const allData = data.reduce(
      (previousValue, currentValue) => previousValue.concat(currentValue),
      []
    );

    const [filteredData, setFilteredData] = useState(
      data.map((curve) => curve.slice(curve.length - 30, curve.length - 1))
    );

    const onBrushChange = (domain) => {
      if (!domain) return;
      const { x0, x1, y0, y1 } = domain;
      const stockCopy = data.map((d) =>
        d.filter((s) => {
          const x = getX(s).getTime();
          const y = getY(s);
          return x > x0 && x < x1 && y > y0 && y < y1;
        })
      );
      setFilteredData(stockCopy);
    };

    const innerHeight = parentHeight - margin.top - margin.bottom;
    const topChartBottomMargin = compact
      ? chartSeparation / 2
      : chartSeparation + 10;
    const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
    const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

    // bounds
    const xMax = Math.max(parentWidth - margin.left - margin.right, 0);
    const yMax = Math.max(topChartHeight, 0);
    const xBrushMax = Math.max(
      parentWidth - brushMargin.left - brushMargin.right,
      0
    );
    const yBrushMax = Math.max(
      bottomChartHeight - brushMargin.top - brushMargin.bottom,
      0
    );

    // scales
    const xScale = useMemo(
      () =>
        scaleTime({
          range: [0, xMax],
          domain: extent(
            filteredData.reduce(
              (previousValue, currentValue) =>
                previousValue.concat(currentValue),
              []
            ),
            getX
          ),
        }),
      [xMax, filteredData]
    );

    const yScale = useMemo(
      () =>
        scaleLinear({
          range: [yMax, 0],
          domain: [
            Math.min(
              ...filteredData
                .reduce(
                  (previousValue, currentValue) =>
                    previousValue.concat(currentValue),
                  []
                )
                .map((d) => getY(d))
            ),
            Math.max(
              ...filteredData
                .reduce(
                  (previousValue, currentValue) =>
                    previousValue.concat(currentValue),
                  []
                )
                .map((d) => getY(d))
            ),
          ],
          nice: true,
        }),
      [yMax, filteredData]
    );

    const brushXScale = useMemo(
      () =>
        scaleTime({
          range: [0, xBrushMax],
          domain: extent(allData, getX),
        }),
      [xBrushMax]
    );
    const brushYScale = useMemo(
      () =>
        scaleLinear({
          range: [yBrushMax, 0],
          // domain: [
          //   Math.min(...allData.map((d) => getY(d))),
          //   Math.max(...allData.map((d) => getY(d))),
          // ],
          domain: [
            Math.min(...allData.map((d) => getY(d))),
            Math.max(...allData.map((d) => getY(d))),
          ],
          // nice: true,
          nice: true,
        }),
      [yBrushMax]
    );

    const initialBrushPosition = useMemo(
      () => ({
        start: {
          x: brushXScale(
            getX(data[0][data[0].length >= 30 ? data[0].length - 30 : 0])
          ),
        },
        end: { x: brushXScale(getX(data[0][data[0].length - 1])) },
      }),
      [brushXScale]
    );

    // const xMax = parentWidth - margin.left - margin.right;

    // const yMax = parentHeight - margin.top - margin.bottom;

    // // scales
    // const xScale = scaleUtc({
    //   range: [0, xMax],
    //   // domain: extent(allData, getX),
    //   // domain: extent(data, getDate),
    //   domain: [Math.min(...allData.map(getX)), Math.max(...allData.map(getX))],
    // });

    // const yScale = scaleLinear({
    //   range: [yMax, 0],
    //   // domain: [0, max(allData, getY)],
    //   domain: [
    //     Math.min(...allData.map((d) => getY(d))),
    //     Math.max(...allData.map((d) => getY(d))),
    //   ],
    //   nice: true,
    // });

    return (
      <div>
        <svg width={parentWidth} height={parentHeight}>
          <LinearGradient
            id="positive"
            from="#43e97b"
            to="#43e97b"
            rotate="0"
          />
          <LinearGradient
            id="negative"
            from="#ff0844"
            to="#ffb199"
            rotate="0"
          />
          <Group
            top={margin.top}
            left={margin.left}
            bottom={topChartBottomMargin}
          >
            {parentWidth > 8 &&
              filteredData.map((curve, i) => {
                const even = i % 2 === 0;
                let markerStart = even
                  ? "url(#marker-cross)"
                  : "url(#marker-x)";
                if (i === 1) markerStart = "url(#marker-line)";
                const markerEnd = even
                  ? "url(#marker-arrow)"
                  : "url(#marker-arrow-odd)";
                return (
                  <Group
                    key={`chart-${i}`}
                    // top={margin.top}
                    // left={margin.left}
                    // right={margin.right}
                  >
                    <MarkerX
                      id="marker-x"
                      stroke={even ? green[600] : red[600]}
                      size={22}
                      strokeWidth={4}
                      markerUnits="userSpaceOnUse"
                    />
                    <MarkerCross
                      id="marker-cross"
                      stroke={even ? green[600] : red[600]}
                      size={22}
                      strokeWidth={4}
                      strokeOpacity={0.6}
                      markerUnits="userSpaceOnUse"
                    />
                    <MarkerCircle
                      id="marker-circle"
                      fill={even ? green[600] : red[600]}
                      size={2}
                      refX={2}
                    />
                    <MarkerArrow
                      id="marker-arrow-odd"
                      stroke={even ? green[600] : red[600]}
                      size={8}
                      strokeWidth={1}
                    />
                    <MarkerLine
                      id="marker-line"
                      fill={even ? green[600] : red[600]}
                      size={16}
                      strokeWidth={1}
                    />
                    <MarkerArrow
                      id="marker-arrow"
                      fill={even ? green[600] : red[600]}
                      refX={2}
                      size={6}
                    />
                    <Curve
                      hideBottomAxis
                      hideLeftAxis
                      curve={curveNatural}
                      data={curve}
                      width={parentWidth}
                      xScale={xScale}
                      yScale={yScale}
                      stroke={even ? green[500] : red[500]}
                      strokeWidth={even ? 2 : 1}
                      strokeOpacity={even ? 0.8 : 1}
                      shapeRendering="geometricPrecision"
                      markerMid="url(#marker-circle)"
                      markerStart={markerStart}
                      markerEnd={markerEnd}
                    />
                  </Group>
                );
              })}
            <AxisBottom
              top={yMax}
              scale={xScale}
              numTicks={parentWidth > 520 ? 10 : 5}
              stroke={axisColor}
              tickStroke={axisColor}
              tickLabelProps={() => axisBottomTickLabelProps}
            />
            <AxisLeft
              scale={yScale}
              numTicks={5}
              tickFormat={millify}
              stroke={axisColor}
              tickStroke={axisColor}
              tickLabelProps={() => axisLeftTickLabelProps}
            />
          </Group>

          <Group
            top={topChartHeight + topChartBottomMargin + margin.top}
            left={brushMargin.left}
          >
            {data.map((brushData, i) => {
              const even = i % 2 === 0;
              let markerStart = even ? "url(#marker-cross)" : "url(#marker-x)";
              if (i === 1) markerStart = "url(#marker-line)";
              const markerEnd = even
                ? "url(#marker-arrow)"
                : "url(#marker-arrow-odd)";
              return (
                <Curve
                  curve={curveNatural}
                  stroke={even ? green[500] : red[500]}
                  strokeWidth={even ? 2 : 1}
                  strokeOpacity={even ? 0.8 : 1}
                  shapeRendering="geometricPrecision"
                  markerMid="url(#marker-circle)"
                  markerStart={markerStart}
                  markerEnd={markerEnd}
                  hideBottomAxis
                  hideLeftAxis
                  data={brushData}
                  width={parentWidth}
                  yMax={yBrushMax}
                  xScale={brushXScale}
                  yScale={brushYScale}
                />
              );
            })}
            <PatternLines
              id={PATTERN_ID}
              height={8}
              width={8}
              stroke={accentColor}
              strokeWidth={1}
              orientation={["diagonal"]}
            />
            <Brush
              xScale={brushXScale}
              yScale={brushYScale}
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
          </Group>
          {title && (
            <Text
              y={margin.top / 2}
              x={parentWidth / 2}
              width={parentWidth}
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
);

export default Curves;
