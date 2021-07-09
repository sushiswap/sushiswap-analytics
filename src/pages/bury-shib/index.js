import { AppShell, Curves, KPI } from "app/components";
import { Grid, Paper, useTheme } from "@material-ui/core";
import {
  buryShibHistoriesQuery,
  buryShibQuery,
  dayDatasQuery,
  ethPriceQuery,
  factoryQuery,
  getApollo,
  getBuryShib,
  getBuryShibHistories,
  getDayData,
  getEthPrice,
  getFactory,
  getShibToken,
  tokenQuery,
  useInterval,
} from "app/core";

import Chart from "../../components/Chart";
import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
// import {getBuryShib, getBuryShibHistories} from "../../core/api/bury-shib";

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

function BuryShibPage() {
  const classes = useStyles();

  const theme = useTheme();

  const {
    data: { bury },
  } = useQuery(buryShibQuery, {
    context: {
      clientName: "buryShib",
    },
  });
  
  const {
    data: { histories },
  } = useQuery(buryShibHistoriesQuery, {
    context: {
      clientName: "buryShib",
    },
  });

  const {
    data: { factory },
  } = useQuery(factoryQuery);

  // TODO CHANGE
  const {
    data: { token },
  } = useQuery(tokenQuery, {
    variables: {
      id: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    },
  });

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery);

  const {
    data: { dayDatas },
  } = useQuery(dayDatasQuery);

  const shibPrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  useInterval(async () => {
    await Promise.all([
      getBuryShib,
      getBuryShibHistories,
      getDayData,
      getFactory,
      getShibToken,
      getEthPrice,
    ]);
  }, 60000);

  const {
    shibStakedUSD,
    shibHarvestedUSD,
    xShibMinted,
    xShibBurned,
    xShib,
    apr,
    apy,
    fees,
  } = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      const dayData = dayDatas.find((d) => d.date === currentValue.date);
      previousValue["shibStakedUSD"].push({
        date,
        value: parseFloat(currentValue.shibStakedUSD),
      });
      previousValue["shibHarvestedUSD"].push({
        date,
        value: parseFloat(currentValue.shibHarvestedUSD),
      });

      previousValue["xShibMinted"].push({
        date,
        value: parseFloat(currentValue.xShibMinted),
      });
      previousValue["xShibBurned"].push({
        date,
        value: parseFloat(currentValue.xShibBurned),
      });
      previousValue["xShib"].push({
        date,
        value: parseFloat(currentValue.xShibSupply),
      });
      const apr =
        (((dayData.volumeUSD * 0.05 * 0.01) / currentValue.xShibSupply) *
          365) /
        (currentValue.ratio * shibPrice);
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
      shibStakedUSD: [],
      shibHarvestedUSD: [],
      xShibMinted: [],
      xShibBurned: [],
      xShib: [],
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
    (((oneDayVolume * 0.05 * 0.01) / bury.totalSupply) * 365) /
    (bury.ratio * shibPrice);

  const APY = Math.pow(1 + APR / 365, 365) - 1;

  return (
    <AppShell>
      <Head>
        <title>Bury Shib | ShibaSwap Analytics</title>
      </Head>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* <Grid item xs>
              <KPI
                title="xShib Age"
                value={parseFloat(bury.xShibAge).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (24h)" value={APY * 100} format="percent" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (Avg)" value={averageApy} format="percent" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="xShib" value={bury.totalSupply} format="integer" />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="Shib"
                value={parseInt(bury.shibStaked).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="xShib:Shib" value={Number(bury.ratio).toFixed(4)} />
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <Lines
              title="xShib Age & xShib Age Destroyed"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[xShibAge, xShibAgeDestroyed]}
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
                  title="xShib:Shib & Shib:xShib"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xShibShib, xShibPerShib]}
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
                  data={[shibStakedUSD, shibHarvestedUSD]}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  labels={["Shib Staked (USD)", "Shib Harvested (USD)"]}
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
                  data={[xShibMinted, xShibBurned]}
                  labels={["xShib Minted", "xShib Burned"]}
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
                  title="xShib Total Supply"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xShib]}
                />
              )}
            </ParentSize>
          </Paper>

          {/* <Chart
            title="xShib Total Supply"
            data={xShib}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          /> */}
        </Grid>
      </Grid>

      {/* <pre>{JSON.stringify(bury, null, 2)}</pre> */}
    </AppShell>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getBuryShib(client);
  await getBuryShibHistories(client);
  await getFactory(client);
  await getDayData(client);
  await getShibToken(client);
  await getEthPrice(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default BuryShibPage;