import { AxisBottom, AxisLeft } from "@visx/axis";
import {
  axisBottomTickLabelProps,
  axisColor,
  axisLeftTickLabelProps,
  getX,
  getY,
} from "app/core";
import { scaleLinear, scaleTime } from "@visx/scale";

import { AreaClosed } from "@visx/shape";
import { GradientTealBlue } from "@visx/gradient";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import millify from "millify";
import { useMemo } from "react";

export default function AreaChart({
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
  xScale,
  yScale,
  yMax,
}) {
  if (width < 10) return null;
  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <GradientTealBlue id="gradient" />
      <AreaClosed
        data={data}
        x={(d) => xScale(getX(d)) || 0}
        y={(d) => yScale(getY(d)) || 0}
        yScale={yScale}
        xScale={xScale}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveMonotoneX}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
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
