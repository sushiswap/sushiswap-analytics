import Percent from "./Percent";
import { makeStyles, Grid, Typography, Box } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { currencyFormatter } from "../intl";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
}));

export default function Avatar({ header, data, percentage }) {
  const classes = useStyles();

  return (
    <Grid item>
      <Paper variant="outlined" className={classes.paper}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {header}
        </Typography>

        <Box display="flex">
          <Typography variant="body2">
            {typeof data === "string"
              ? data
              : currencyFormatter.format(data || 0)}
          </Typography>
          <Percent marginLeft={1} percent={percentage} />
        </Box>
      </Paper>
    </Grid>
  );
}
