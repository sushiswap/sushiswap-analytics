import { scaleLinear, scaleTime } from "@visx/scale";

import { AreaStack } from "@visx/shape";
import { GradientOrangeRed } from "@visx/gradient";
import React from "react";
import browserUsage from "@visx/mock-data/lib/mocks/browserUsage";
import { timeParse } from "d3-time-format";
import { withParentSize } from "@visx/responsive";

const data = browserUsage;
const keys = Object.keys(data[0]).filter((k) => k !== "date");
const parseDate = timeParse("%Y %b %d");
export const background = "#f38181";

const getDate = (d) => parseDate(d.date).valueOf();
const getY0 = (d) => d[0] / 100;
const getY1 = (d) => d[1] / 100;

export default withParentSize(function Example({
  parentHeight,
  parentWidth,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  events = false,
}) {
  // bounds
  const yMax = parentHeight - margin.top - margin.bottom;
  const xMax = parentWidth - margin.left - margin.right;

  // scales
  const xScale = scaleTime({
    range: [0, xMax],
    domain: [Math.min(...data.map(getDate)), Math.max(...data.map(getDate))],
  });
  const yScale = scaleLinear({
    range: [yMax, 0],
  });

  return parentWidth < 10 ? null : (
    <svg width={parentWidth} height={parentHeight}>
      <GradientOrangeRed id="stacked-area-orangered" />
      <rect
        x={0}
        y={0}
        width={parentWidth}
        height={parentHeight}
        fill={background}
        rx={14}
      />
      <AreaStack
        top={margin.top}
        left={margin.left}
        keys={keys}
        data={data}
        x={(d) => xScale(getDate(d.data)) ?? 0}
        y0={(d) => yScale(getY0(d)) ?? 0}
        y1={(d) => yScale(getY1(d)) ?? 0}
      >
        {({ stacks, path }) =>
          stacks.map((stack) => (
            <path
              key={`stack-${stack.key}`}
              d={path(stack) || ""}
              stroke="transparent"
              fill="url(#stacked-area-orangered)"
              onClick={() => {
                if (events) alert(`${stack.key}`);
              }}
            />
          ))
        }
      </AreaStack>
    </svg>
  );
});
