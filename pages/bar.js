import Chart, { defaultOptions } from "../components/Chart";
import { Grid, Paper, Typography } from "@material-ui/core";
import { barHistoriesQuery, barQuery } from "../operations";
import { getBar, getBarHistories } from "../api";

import DashboardChart from "../components/DashboardChart";
import Head from "next/head";
import Layout from "../components/Layout";
import React from "react";
import { currencyFormatter } from "../intl";
import { getApollo } from "../apollo";
import { makeStyles } from "@material-ui/core/styles";
import useInterval from "../hooks/useInterval";
import { useQuery } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  charts: {
    flexGrow: 1,
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function PoolsPage() {
  const classes = useStyles();

  const {
    data: { bar },
    error,
  } = useQuery(barQuery, {
    context: {
      clientName: "bar",
    },
  });
  console.log("Bar", bar);

  const {
    data: { histories },
    error: historiesError,
  } = useQuery(barHistoriesQuery, {
    context: {
      clientName: "bar",
    },
  });

  useInterval(async () => {
    await Promise.all([getBar, getBarHistories]);
  }, 60000);

  const [
    sushiStakedUSD,
    sushiHarvestedUSD,
    ratio,
    sushiXsushi,
  ] = histories.reduce(
    (previousValue, currentValue) => {
      const time = new Date(currentValue.date * 1e3).toISOString().slice(0, 10);
      previousValue[0].push({
        time,
        value: parseFloat(currentValue.sushiStakedUSD),
      });
      previousValue[1].push({
        time,
        value: parseFloat(currentValue.sushiHarvestedUSD),
      });
      previousValue[2].push({
        time,
        value: parseFloat(currentValue.ratio),
      });
      previousValue[3].push({
        time,
        value: 2 - parseFloat(currentValue.ratio),
      });
      return previousValue;
    },
    [[], [], [], []]
  );

  return (
    <Layout>
      <Head>
        <title>Sushi Bar | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h5" component="h1" gutterBottom>
        Sushi Bar
      </Typography>

      {/* <Typography>xSushi: {parseFloat(bar.totalSupply).toFixed(2)}</Typography>

      <Typography>
        Sushi Staked: {parseFloat(bar.sushiStaked).toFixed(2)} (
        {currencyFormatter.format(bar.sushiStakedUSD)})
      </Typography>

      <Typography>
        Sushi Harvested: {parseFloat(bar.sushiHarvested).toFixed(2)} (
        {currencyFormatter.format(bar.sushiHarvestedUSD)})
      </Typography>

      <Typography>
        xSushi:Sushi Ratio {parseFloat(bar.ratio).toFixed(4)}
      </Typography> */}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper} variant="outlined">
            xSushi: {parseFloat(bar.totalSupply).toLocaleString()}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper} variant="outlined">
            Sushi: {parseFloat(bar.sushiStaked).toLocaleString()}{" "}
            {currencyFormatter.format(bar.sushiStakedUSD)})
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper} variant="outlined">
            xSushi:Sushi {parseFloat(bar.ratio).toLocaleString()}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper} variant="outlined">
            <DashboardChart
              data={sushiStakedUSD}
              type="area"
              title="Sushi Staked"
            ></DashboardChart>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper} variant="outlined">
            <DashboardChart
              data={sushiHarvestedUSD}
              type="area"
              title="Sushi Harvested"
            ></DashboardChart>
          </Paper>
        </Grid>
      </Grid>

      {/* <pre>{JSON.stringify(bar, null, 2)}</pre> */}
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getBar();
  await getBarHistories();
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default PoolsPage;
