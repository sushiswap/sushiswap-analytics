import Box from "@material-ui/core/Box";
import React from "react";
import { useTheme } from "@material-ui/core/styles";

export default function Percent({ percent, ...props }) {
  const theme = useTheme();

  const value =
    !Number.isNaN(percent) && isFinite(percent)
      ? Number(percent).toFixed(2)
      : "0.00";

  const color =
    value === "0.00"
      ? "inherit"
      : value > 0
      ? theme.palette.positive.main
      : theme.palette.negative.main;

  return (
    <Box style={{ color }} {...props}>
      {value}%
    </Box>
  );
}
