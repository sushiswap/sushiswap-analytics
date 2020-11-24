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
import { green, red } from "@material-ui/core/colors";
import { scaleLinear, scaleTime, scaleUtc } from "@visx/scale";
import { timeFormat, timeParse } from "d3-time-format";

import { Group } from "@visx/group";
import React from "react";
import { Text } from "@visx/text";
import { curveMonotoneX } from "@visx/curve";
import { curveNatural } from "@visx/curve";
import millify from "millify";
import { scaleOrdinal } from "@visx/scale";
import { useMemo } from "react";
import { withParentSize } from "@visx/responsive";

const parseDate = timeParse("%Y-%m-%d");
const format = timeFormat("%b %d");
const formatDate = (date) => format(parseDate(date));

// data accessors
// const getX = (d) => new Date(d.time);
const getX = (d) => new Date(d.time);
const getY = (d) => d.value;

const ordinalColorScale = scaleOrdinal({
  domain: ["xSushi Age", "xSushi Age Destroyed"],
  range: [green[500], red[500]],
});

const Curves = withParentSize(
  ({ parentWidth, parentHeight, margin, data, title }) => {
    const allData = data.reduce(
      (previousValue, currentValue) => previousValue.concat(currentValue),
      []
    );

    const xMax = parentWidth - margin.left - margin.right;

    const yMax = parentHeight - margin.top - margin.bottom;

    // scales
    const xScale = scaleUtc({
      range: [0, xMax],
      // domain: extent(allData, getX),
      // domain: extent(data, getDate),
      domain: [Math.min(...allData.map(getX)), Math.max(...allData.map(getX))],
    });

    const yScale = scaleLinear({
      range: [yMax, 0],
      // domain: [0, max(allData, getY)],
      domain: [
        Math.min(...allData.map((d) => getY(d))),
        Math.max(...allData.map((d) => getY(d))),
      ],
      nice: true,
    });

    return (
      <div style={{ position: "relative" }}>
        <svg width={parentWidth} height={parentHeight}>
          <GradientTealBlue id="gradient" />
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

          <Group left={margin.left} right={margin.right}>
            {parentWidth > 8 &&
              data.map((areaData, i) => {
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
                    top={margin.top}
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
                    <LinePath
                      curve={curveNatural}
                      data={areaData}
                      x={(d) => xScale(getX(d)) ?? 0}
                      y={(d) => yScale(getY(d)) ?? 0}
                      stroke={even ? green[500] : red[500]}
                      strokeWidth={even ? 2 : 1}
                      strokeOpacity={even ? 0.8 : 1}
                      shapeRendering="geometricPrecision"
                      markerMid="url(#marker-circle)"
                      markerStart={markerStart}
                      markerEnd={markerEnd}
                    />
                    {/* <AreaClosed
                  data={areaData}
                  x={(d) => xScale(getX(d)) || 0}
                  y={(d) => yScale(getY(d)) || 0}
                  yScale={yScale}
                  strokeWidth={2}
                  // stroke="url(#gradient)"
                  fill={`url(#${i % 2 === 0 ? "positive" : "negative"})`}
                  curve={curveMonotoneX}
                /> */}

                    {/* <LinePath
                  data={lineData}
                  x={(d) => xScale(getX(d)) ?? 0}
                  y={(d) => yScale(getY(d)) ?? 0}
                  stroke={green[500]}
                  strokeWidth={2}
                  shapeRendering="geometricPrecision"
                /> */}
                  </Group>
                );
              })}
            <AxisBottom
              top={yMax + margin.top}
              scale={xScale}
              stroke="currentColor"
              tickStroke="currentColor"
              tickFormat={(v, i) =>
                parentWidth > 800 || i % 2 === 0 ? timeFormat("%b %d")(v) : ""
              }
              tickLabelProps={() => ({
                fill: "currentColor",
                fontSize: 11,
                textAnchor: "middle",
              })}
            />
            <AxisLeft
              scale={yScale}
              top={margin.top}
              // left={margin.left}
              tickFormat={millify}
              stroke="currentColor"
              tickStroke="currentColor"
              tickLabelProps={() => ({
                fill: "currentColor",
                fontSize: 11,
                textAnchor: "end",
                verticalAnchor: "middle",
              })}
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
