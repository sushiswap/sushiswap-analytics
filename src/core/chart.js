import { bisector } from "d3-array";

// accessors
export const getX = (data) => new Date(data.date);
export const getY = (data) => data.value;

// bisector
export const bisectDate = bisector((d) => new Date(d.date)).left;

// Initialize some variables
export const axisColor = "currentColor";

export const axisBottomTickLabelProps = {
  textAnchor: "middle",
  fontFamily: "inherit",
  fontSize: 10,
  fill: axisColor,
};
export const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "inherit",
  fontSize: 10,
  textAnchor: "end",
  fill: axisColor,
};
