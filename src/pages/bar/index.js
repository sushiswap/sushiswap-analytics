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
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

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
    interest,
    fees,
  } = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      const dayData = dayDatas.find((d) => d.date === currentValue.date);
      console.log({ dayData });
      previousValue["sushiStakedUSD"].push({
        date,
        value: parseFloat(currentValue.sushiStakedUSD),
      });
      previousValue["sushiHarvestedUSD"].push({
        date,
        value: parseFloat(currentValue.sushiHarvestedUSD),
      });
      // previousValue[2].push({
      //   date,
      //   value: parseFloat(currentValue.ratio),
      // });
      // previousValue[3].push({
      //   date,
      //   value: 2 - parseFloat(currentValue.ratio),
      // });
      previousValue["xSushiMinted"].push({
        date,
        value: parseFloat(currentValue.xSushiMinted),
      });
      previousValue["xSushiBurned"].push({
        date,
        value: parseFloat(currentValue.xSushiBurned),
      });

      // previousValue[6].push({
      //   date,
      //   value: parseInt(currentValue.xSushiAge),
      //   stroke: theme.palette.positive.light,
      // });
      // previousValue[7].push({
      //   date,
      //   value: parseInt(currentValue.xSushiAgeDestroyed),
      // });

      previousValue["xSushi"].push({
        date,
        value: parseFloat(currentValue.xSushiSupply),
      });

      const APR =
        (((dayData.volumeUSD * 0.05 * 0.01) / currentValue.xSushiSupply) *
          365) /
        (currentValue.ratio * sushiPrice);

      previousValue["interest"].push({
        date,
        value: parseFloat((Math.pow(1 + APR / 365, 365) - 1) * 100),
      });

      previousValue["fees"].push({
        date,
        value: parseFloat(dayData.volumeUSD * 0.05 * 0.01),
      });

      return previousValue;
    },
    {
      sushiStakedUSD: [],
      sushiHarvestedUSD: [],
      xSushiMinted: [],
      xSushiBurned: [],
      xSushi: [],
      interest: [],
      fees: [],
    }
  );

  const averageApy =
    interest.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.value;
    }, 0) / interest.length;

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
              <KPI title="APY (24h)" value={`${(APY * 100).toFixed(2)}%`} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (Avg)" value={`${averageApy.toFixed(2)}%`} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="xSushi"
                value={parseInt(bar.totalSupply).toLocaleString()}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="Sushi"
                value={parseInt(bar.sushiStaked).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
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
                  title="Interest % (APY)"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[interest]}
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
