import { AppShell, Curves, KPI } from "app/components";
import { Grid, Paper, useTheme } from "@material-ui/core";
import {
  barHistoriesQuery,
  barQuery,
  dayDatasQuery,
  ethPriceQuery,
  factoryQuery,
  getApollo,
  getBar,
  getBarHistories,
  getDayData,
  getEthPrice,
  getFactory,
  getSushiToken,
  tokenQuery,
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

function BarPage() {
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

  const {
    data: { factory },
  } = useQuery(factoryQuery);

  const {
    data: { token },
  } = useQuery(tokenQuery, {
    variables: {
      id: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    },
  });

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery);

  const {
    data: { dayDatas },
  } = useQuery(dayDatasQuery);

  const sushiPrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  useInterval(async () => {
    await Promise.all([
      getBar,
      getBarHistories,
      getDayData,
      getFactory,
      getSushiToken,
      getEthPrice,
    ]);
  }, 60000);

  const {
    sushiStakedUSD,
    sushiHarvestedUSD,
    xSushiMinted,
    xSushiBurned,
    xSushi,
    apr,
    apy,
    fees,
  } = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      const dayData = dayDatas.find((d) => d.date === currentValue.date);
      previousValue["sushiStakedUSD"].push({
        date,
        value: parseFloat(currentValue.sushiStakedUSD),
      });
      previousValue["sushiHarvestedUSD"].push({
        date,
        value: parseFloat(currentValue.sushiHarvestedUSD),
      });

      previousValue["xSushiMinted"].push({
        date,
        value: parseFloat(currentValue.xSushiMinted),
      });
      previousValue["xSushiBurned"].push({
        date,
        value: parseFloat(currentValue.xSushiBurned),
      });
      previousValue["xSushi"].push({
        date,
        value: parseFloat(currentValue.xSushiSupply),
      });
      const apr =
        (((dayData.volumeUSD * 0.05 * 0.01) / currentValue.xSushiSupply) *
          365) /
        (currentValue.ratio * sushiPrice);
      previousValue["apr"].push({
        date,
        value: parseFloat(apr * 100),
      });
      previousValue["apy"].push({
        date,
        value: parseFloat((Math.pow(1 + apr / 365, 365) - 1) * 100),
      });
      previousValue["fees"].push({
        date,
        value: parseFloat(dayData.volumeUSD * 0.005),
      });
      return previousValue;
    },
    {
      sushiStakedUSD: [],
      sushiHarvestedUSD: [],
      xSushiMinted: [],
      xSushiBurned: [],
      xSushi: [],
      apr: [],
      apy: [],
      fees: [],
    }
  );

  const averageApy =
    apy.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.value;
    }, 0) / apy.length;

  const oneDayVolume = factory.volumeUSD - factory.oneDay.volumeUSD;

  const APR =
    (((oneDayVolume * 0.05 * 0.01) / bar.totalSupply) * 365) /
    (bar.ratio * sushiPrice);

  const APY = Math.pow(1 + APR / 365, 365) - 1;

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
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (24h)" value={APY * 100} format="percent" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (Avg)" value={averageApy} format="percent" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="xSushi" value={bar.totalSupply} format="integer" />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="Sushi"
                value={parseInt(bar.sushiStaked).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="xSushi:Sushi" value={Number(bar.ratio).toFixed(4)} />
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
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[apy, apr]}
                  labels={["APY", "APR"]}
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
                  title="Fees received (USD)"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[fees]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        {/* <Grid item xs={12}>
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
                  data={[sushiStakedUSD, sushiHarvestedUSD]}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  labels={["Sushi Staked (USD)", "Sushi Harvested (USD)"]}
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
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xSushiMinted, xSushiBurned]}
                  labels={["xSushi Minted", "xSushi Burned"]}
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
                  title="xSushi Total Supply"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xSushi]}
                />
              )}
            </ParentSize>
          </Paper>

          {/* <Chart
            title="xSushi Total Supply"
            data={xSushi}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          /> */}
        </Grid>
      </Grid>

      {/* <pre>{JSON.stringify(bar, null, 2)}</pre> */}
    </AppShell>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getBar(client);
  await getBarHistories(client);
  await getFactory(client);
  await getDayData(client);
  await getSushiToken(client);
  await getEthPrice(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default BarPage;
