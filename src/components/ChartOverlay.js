import { Box, Button, Typography, useMediaQuery } from "@material-ui/core";
import { timeFormat, timeParse } from "d3-time-format";

import { useTheme } from "@material-ui/core/styles";

const formatDate = timeFormat("%b %d, '%y");

export default function ChartOverlay({ overlay, onTimespanChange }) {
  const { title, value, date } = overlay;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  return (
    <>
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5" color="textPrimary">
          {value}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {formatDate(date * 1e3)}
        </Typography>
      </div>
      <div style={{ position: "absolute", top: 24, right: 24 }}>
        <Box display="flex" flexDirection={matches ? "row" : "column"}>
          <Button
            type="button"
            value="1W"
            aria-label="1 week timespan"
            variant="text"
            size="small"
            color="primary"
            onClick={onTimespanChange}
          >
            1W
          </Button>
          <Button
            type="button"
            value="1M"
            aria-label="1 month timespan"
            variant="text"
            size="small"
            color="primary"
            onClick={onTimespanChange}
          >
            1M
          </Button>
          <Button
            type="button"
            value="ALL"
            aria-label="ALL timespan"
            variant="text"
            size="small"
            color="primary"
            onClick={onTimespanChange}
          >
            ALL
          </Button>
        </Box>
      </div>
    </>
  );
}
