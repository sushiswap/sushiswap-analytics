import { AppShell, Curves, KPI } from "app/components";
import { Grid, Paper, useTheme } from "@material-ui/core";
import {
  barHistoriesQuery,
  barQuery,
  getApollo,
  getBar,
  getBarHistories,
  useInterval,
} from "app/core";

import Chart from "../../components/Chart";
import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  charts: {
    flexGrow: 1,
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    // textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function PoolsPage() {
  const classes = useStyles();

  const theme = useTheme();

  const {
    data: { bar },
  } = useQuery(barQuery, {
    context: {
      clientName: "bar",
    },
  });

  const {
    data: { histories },
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
    xSushiSushi,
    xSushiPerSushi,
    xSushiMinted,
    xSushiBurned,
    xSushiAge,
    xSushiAgeDestroyed,
    xSushi,
  ] = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      previousValue[0].push({
        date,
        value: parseFloat(currentValue.sushiStakedUSD),
      });
      previousValue[1].push({
        date,
        value: parseFloat(currentValue.sushiHarvestedUSD),
      });
      previousValue[2].push({
        date,
        value: parseFloat(currentValue.ratio),
      });
      previousValue[3].push({
        date,
        value: 2 - parseFloat(currentValue.ratio),
      });
      previousValue[4].push({
        date,
        value: parseFloat(currentValue.xSushiMinted),
      });
      previousValue[5].push({
        date,
        value: parseFloat(currentValue.xSushiBurned),
      });
      previousValue[6].push({
        date,
        value: parseInt(currentValue.xSushiAge),
        stroke: theme.palette.positive.light,
      });
      previousValue[7].push({
        date,
        value: parseInt(currentValue.xSushiAgeDestroyed),
      });

      previousValue[8].push({
        date,
        value: parseFloat(currentValue.xSushiSupply),
      });

      return previousValue;
    },
    [[], [], [], [], [], [], [], [], []]
  );

  // console.log("xSushiAge", xSushiAge);
  // console.log("xSushiAgeDestroyed", xSushiAgeDestroyed);
  return (
    <AppShell>
      <Head>
        <title>Sushi Bar | SushiSwap Analytics</title>
      </Head>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* <Grid item xs>
              <KPI
                title="xSushi Age"
                value={parseFloat(bar.xSushiAge).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs>
              <KPI
                title="xSushi"
                value={parseFloat(bar.totalSupply).toLocaleString()}
              />
            </Grid>
            <Grid item xs>
              <KPI
                title="Sushi"
                value={parseFloat(bar.sushiStaked).toLocaleString()}
              />
            </Grid>
            <Grid item xs>
              <KPI
                title="xSushi:Sushi"
                value={parseFloat(bar.ratio).toLocaleString()}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <Lines
              title="xSushi Age & xSushi Age Destroyed"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[xSushiAge, xSushiAgeDestroyed]}
            />
          </Paper>
        </Grid> */}

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ display: "flex", height: 400, flex: 1 }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  title="xSushi:Sushi & Sushi:xSushi"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xSushiSushi, xSushiPerSushi]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ display: "flex", height: 400, flex: 1 }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  title="Sushi Staked (USD) & Sushi Harvested (USD)"
                  data={[sushiStakedUSD, sushiHarvestedUSD]}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ display: "flex", height: 400, flex: 1 }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  title="xSushi Minted & xSushi Burned"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xSushiMinted, xSushiBurned]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Chart
            title="xSushi Total Supply"
            data={xSushi}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          />
        </Grid>
      </Grid>

      {/* <pre>{JSON.stringify(bar, null, 2)}</pre> */}
    </AppShell>
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
