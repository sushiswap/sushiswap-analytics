import { Box, Typography } from "@material-ui/core";

export default function ChartOverlay({ overlay }) {
  const { title, value, time } = overlay;
  return (
    <div style={{ position: "absolute", top: 32, left: 32 }}>
      <Typography variant="subtitle2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h5" color="textPrimary">
        {value}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        {time}
      </Typography>
    </div>
  );
}
