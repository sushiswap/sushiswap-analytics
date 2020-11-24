import { AxisBottom, AxisLeft } from "@visx/axis";
import {
  LegendItem,
  LegendLabel,
  LegendOrdinal,
  LegendThreshold,
} from "@visx/legend";
import { extent, max } from "d3-array";
import { green, red } from "@material-ui/core/colors";
import { scaleLinear, scaleTime } from "@visx/scale";
import { scaleOrdinal, scaleUtc } from "@visx/scale";
import { timeFormat, timeParse } from "d3-time-format";

import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import React from "react";
import { Text } from "@visx/text";
import generateDateValue from "@visx/mock-data/lib/generators/genDateValue";
import millify from "millify";
import { withParentSize } from "@visx/responsive";

const purple3 = "#a44afe";

const parseDate = timeParse("%Y-%m-%d");
const format = timeFormat("%b %d");
const formatDate = (date) => format(parseDate(date));

const legendGlyphSize = 15;

// data accessors
// const getX = (d) => new Date(d.time);
const getX = (d) => new Date(d.time);
const getY = (d) => d.value;

const ordinalColorScale = scaleOrdinal({
  domain: ["xSushi Age", "xSushi Age Destroyed"],
  range: [green[500], red[500]],
});

const Lines = withParentSize(
  ({ parentWidth, parentHeight, lines, strokes, margin, title }) => {
    const lineCount = 2;
    const allData = lines.reduce(
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
          <Group left={margin.left} right={margin.right}>
            {parentWidth > 8 &&
              lines.map((lineData, i) => (
                <Group
                  key={`lines-${i}`}
                  top={margin.top}
                  // left={margin.left}
                  // right={margin.right}
                >
                  <LinePath
                    data={lineData}
                    x={(d) => xScale(getX(d)) ?? 0}
                    y={(d) => yScale(getY(d)) ?? 0}
                    stroke={strokes[i]}
                    strokeWidth={2}
                    shapeRendering="geometricPrecision"
                  />
                </Group>
              ))}

            {/* scale: scaleUtc({
          domain: getMinMax(timeValues),
          range: [0, width],
        }),
        values: timeValues,
        tickFormat: (v: Date, i: number) =>
          i === 3 ? '🎉' : width > 400 || i % 2 === 0 ? timeFormat('%b %d')(v) : '',
        label: 'time', */}

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
        {/* <LegendOrdinal
          scale={ordinalColorScale}
          labelFormat={(label) => `${label.toUpperCase()}`}
        >
          {(labels) => (
            <div style={{ display: "flex", flexDirection: "row" }}>
              {labels.map((label, i) => (
                <LegendItem
                  key={`legend-quantile-${i}`}
                  margin="0 5px"
                  onClick={() => {
                    if (events) alert(`clicked: ${JSON.stringify(label)}`);
                  }}
                >
                  <svg width={legendGlyphSize} height={legendGlyphSize}>
                    <rect
                      fill={label.value}
                      width={legendGlyphSize}
                      height={legendGlyphSize}
                    />
                  </svg>
                  <LegendLabel align="left" margin="0 0 0 4px">
                    {label.text}
                  </LegendLabel>
                </LegendItem>
              ))}
            </div>
          )}
        </LegendOrdinal> */}

        <style jsx>{`
          .legends {
            font-family: arial;
            font-weight: 900;
            background-color: black;
            border-radius: 14px;
            padding: 24px 24px 24px 32px;
            overflow-y: auto;
            flex-grow: 1;
          }
          .chart h2 {
            margin-left: 10px;
          }
        `}</style>
      </div>
    );
  }
);

export default Lines;
