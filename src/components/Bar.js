import { AxisBottom, AxisLeft } from "@visx/axis";
import {
  axisBottomTickLabelProps,
  axisColor,
  axisLeftTickLabelProps,
  getX,
  getY,
} from "app/core";
import { scaleBand, scaleLinear } from "@visx/scale";

import { Bar } from "@visx/shape";
import { GradientTealBlue } from "@visx/gradient";
import { Group } from "@visx/group";
import millify from "millify";
import { useMemo } from "react";

export default function BarChart({
  data,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  top,
  left,
  hideBottomAxis = false,
  hideLeftAxis = false,
  children,
  onTouchStart,
  onTouchMove,
  onMouseMove,
  onMouseLeave,
}) {
  // Max
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, xMax],
        domain: data.map(getX),
      }),
    [xMax, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [Math.min(...data.map(getY)), Math.max(...data.map(getY))],
        nice: true,
      }),
    [yMax, data]
  );

  if (width < 10) return null;
  return (
    <Group left={left} top={top}>
      <GradientTealBlue id="gradient" />
      {data.map((d) => {
        const date = getX(d);
        const barWidth = xScale.bandwidth();
        const barHeight = yMax - (yScale(getY(d)) ?? 0);
        const barX = xScale(date);
        const barY = yMax - barHeight;
        return (
          <Bar
            key={`bar-${date}`}
            x={barX}
            y={barY}
            width={barWidth}
            height={barHeight}
            stroke="url(#gradient)"
            fill="url(#gradient)"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          />
        );
      })}

      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={5}
          tickFormat={millify}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisLeftTickLabelProps}
        />
      )}
      {children}
    </Group>
  );
}
