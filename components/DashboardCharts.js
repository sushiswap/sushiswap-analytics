import DashboardChart from "./DashboardChart";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { uniswapDayDatasQuery } from "../operations";
import { useQuery } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function DashboardCharts() {
  const classes = useStyles();

  const { data } = useQuery(uniswapDayDatasQuery, {
    pollInterval: 60000,
  });

  const [liquidity, volume] = data.dayDatas.reduce(
    (previousValue, currentValue) => {
      const time = new Date(currentValue.date * 1e3).toISOString().slice(0, 10);
      previousValue[0].push({
        time,
        value: parseFloat(currentValue.liquidityUSD),
      });
      previousValue[1].push({
        time,
        value: parseFloat(currentValue.volumeUSD),
      });
      return previousValue;
    },
    [[], []]
  );

  // console.log({ liquidity, volume });

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper} variant="outlined">
            <DashboardChart data={liquidity} type="area" title="Liquidity" />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper} variant="outlined">
            <DashboardChart data={volume} type="histogram" title="Volume" />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
