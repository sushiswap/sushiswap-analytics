import { Bar, Line } from "@visx/shape";
import {
  GradientDarkgreenGreen,
  GradientLightgreenGreen,
  GradientPinkBlue,
  GradientPurpleTeal,
  GradientSteelPurple,
  GradientTealBlue,
  LinearGradient,
} from "@visx/gradient";
import { Grid, GridColumns, GridRows } from "@visx/grid";
import React, { useMemo, useState } from "react";
import {
  Tooltip,
  defaultStyles,
  useTooltip,
  useTooltipInPortal,
} from "@visx/tooltip";
import { bisector, extent, max } from "d3-array";
import letterFrequency, {
  LetterFrequency,
} from "@visx/mock-data/lib/mocks/letterFrequency";
import { scaleBand, scaleLinear } from "@visx/scale";
import { timeFormat, timeParse } from "d3-time-format";

import ChartOverlay from "./ChartOverlay";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { Typography } from "@material-ui/core";
import { currencyFormatter } from "app/core";
import { deepPurple } from "@material-ui/core/colors";
import millify from "millify";
import { withParentSize } from "@visx/responsive";

export const accentColor = "#a18cd1";
export const accentColor2 = "#fbc2eb";

// const data = letterFrequency.slice(5);
const verticalMargin = 120;

// accessors
const getDate = (d) => new Date(d.time);
const getValue = (d) => Number(d.value);

const formatDate = timeFormat("%b %d, '%y");

let tooltipTimeout;

const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  background: "white",
  border: "1px solid white",
  color: "inherit",
  zIndex: 1702,
};

export default withParentSize(function BarChart({
  parentWidth,
  parentHeight,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  data,
  events = false,
  tooltipDisabled = false,
  overlayEnabled = false,
  title = "",
}) {
  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal();

  // bounds
  const xMax = parentWidth - margin.left - margin.right;
  const yMax = parentHeight - margin.top - margin.bottom;

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, xMax],
        domain: data.map(getDate),
      }),
    [xMax, data]
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [
          Math.min(...data.map((d) => getValue(d))),
          Math.max(...data.map((d) => getValue(d))),
        ],
        nice: true,
      }),
    [yMax, data]
  );

  if (parentWidth < 10) {
    return null;
  }

  // console.log("tooltip data", tooltipData);

  const [overlay, setOverlay] = useState({
    title,
    value: currencyFormatter.format(data[data.length - 1].value),
    time: data[data.length - 1].time,
  });

  return (
    <div style={{ position: "relative" }}>
      {overlayEnabled && <ChartOverlay overlay={overlay} />}

      <svg ref={containerRef} width={parentWidth} height={parentHeight}>
        <GradientTealBlue id="bar-gradient" />
        {/* <LinearGradient
          id="bar-gradient"
          from="#37ecba"
          to="#72afd3"
          // fromOffset={0.5}
          // from={accentColor}
          // to={accentColor}
          // toOpacity={0.1}
        /> */}
        <rect
          width={parentWidth}
          height={parentHeight}
          fill="transparent"
          // fill="url(#teal)"
          // rx={14}
        />

        <Group top={margin.top}>
          {data.map((d) => {
            const date = getDate(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(getValue(d)) ?? 0);
            const barX = xScale(date);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${date}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                // fill="#7c4dff"
                fill="url(#bar-gradient)"
                onClick={() => {
                  if (events)
                    alert(`clicked: ${JSON.stringify(Object.values(d))}`);
                }}
                // onClick={() => {
                //   if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                // }}
                onMouseLeave={() => {
                  tooltipTimeout = window.setTimeout(() => {
                    hideTooltip();

                    setOverlay({
                      ...overlay,
                      value: currencyFormatter.format(
                        data[data.length - 1].value
                      ),
                      time: data[data.length - 1].time,
                    });
                  }, 300);
                }}
                onMouseMove={(event) => {
                  if (tooltipTimeout) clearTimeout(tooltipTimeout);
                  const top = event.clientY - margin.top - barHeight;
                  const left = barX + barWidth / 2;
                  setOverlay({
                    ...overlay,
                    value: currencyFormatter.format(d.value),
                    time: d.time,
                  });
                  showTooltip({
                    tooltipData: d,
                    tooltipTop: yScale(getValue(d)),
                    tooltipLeft: left,
                  });
                }}
              />
            );
          })}
        </Group>

        {tooltipData && (
          <Group top={margin.top} left={margin.left}>
            {/* <Line
              from={{ x: tooltipLeft, y: -margin.top }}
              to={{ x: tooltipLeft, y: yMax }}
              stroke={deepPurple[400]}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            /> */}
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
              fill={deepPurple[400]}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </Group>
        )}
      </svg>
      {!tooltipDisabled && tooltipData && (
        <div>
          <Tooltip
            top={margin.top + tooltipTop - 12}
            left={tooltipLeft + 12}
            style={tooltipStyles}
          >
            {`$${millify(getValue(tooltipData))}`}
          </Tooltip>
          <Tooltip
            top={yMax + margin.top - 14}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 90,
              textAlign: "center",
              transform: "translateX(-50%)",
            }}
          >
            {formatDate(getDate(tooltipData))}
          </Tooltip>
        </div>
      )}
      {/* {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()} // update tooltip bounds each render
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div
          // style={{ color: colorScale(tooltipData.key) }}
          >
            <strong>{tooltipData.value}</strong>
          </div>
          <div>{tooltipData.value}</div>
          <div>
            <small>{formatDate(getDate(tooltipData))}</small>
          </div>
        </TooltipInPortal>
      )} */}
    </div>
  );
});
