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

const Areas = withParentSize(({ parentWidth, parentHeight, margin, data }) => {
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
        <LinearGradient id="positive" from="#43e97b" to="#43e97b" rotate="0" />
        <LinearGradient id="negative" from="#ff0844" to="#ffb199" rotate="0" />

        <Group left={margin.left} right={margin.right}>
          {parentWidth > 8 &&
            data.map((areaData, i) => {
              const even = i % 2 === 0;
              let markerStart = even ? "url(#marker-cross)" : "url(#marker-x)";
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
                  <AreaClosed
                    data={areaData}
                    x={(d) => xScale(getX(d)) || 0}
                    y={(d) => yScale(getY(d)) || 0}
                    yScale={yScale}
                    strokeWidth={2}
                    stroke={`url(#${i % 2 === 0 ? "positive" : "negative"})`}
                    fill={`url(#${i % 2 === 0 ? "positive" : "negative"})`}
                    curve={curveMonotoneX}
                  />
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
      </svg>
    </div>
  );
});

export default Areas;
