import {
  Box,
  Button,
  Typography,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { timeFormat, timeParse } from "d3-time-format";

import { useTheme } from "@material-ui/core/styles";

const formatDate = timeFormat("%b %d, '%y");
const useStyles = makeStyles((theme) => ({
  filter: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
    },
  },
  title: {
    fontWeight: 700,
  },
}));
export default function ChartOverlay({ overlay, onTimespanChange }) {
  const { title, value, date } = overlay;
  const theme = useTheme();
  const classes = useStyles();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  return (
    <>
      <div style={{ position: "absolute", top: 14, left: 14 }}>
        <Typography variant="h5" color="textPrimary" className={classes.title}>
          {title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {value}
        </Typography>
      </div>
      <div style={{ position: "absolute", top: 14, right: 14 }}>
        <Typography variant="subtitle1" color="textSecondary">
          {formatDate(date * 1e3)}
        </Typography>
      </div>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div className={classes.filter}>
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
        </div>
      </div>
    </>
  );
}
