import Box from "@material-ui/core/Box";
import React from "react";
import { useTheme } from "@material-ui/core/styles";

export default function Percent({ percent, ...props }) {
  const theme = useTheme();

  const value =
    !Number.isNaN(percent) && isFinite(percent)
      ? Number(percent).toFixed(2)
      : 0;

  let color = "inherit";

  if (value > 0) {
    color = theme.palette.positive.main;
  } else if (value < 0) {
    color = theme.palette.negative.main;
  }

  return (
    <Box style={{ color }} {...props}>
      {value}%
    </Box>
  );
}
