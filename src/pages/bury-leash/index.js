import { AppShell, Curves, KPI } from "app/components";
import { Grid, Paper, useTheme } from "@material-ui/core";
import {
  buryLeashHistoriesQuery,
  buryLeashQuery,
  dayDatasQuery,
  ethPriceQuery,
  factoryQuery,
  getApollo,
  getBuryLeash,
  getBuryLeashHistories,
  getDayData,
  getEthPrice,
  getFactory,
  getLeashToken,
  tokenQuery,
  useInterval,
  getBoneToken
} from "app/core";

import Chart from "../../components/Chart";
import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import {LEASH_TOKEN_ADDRESS, BONE_TOKEN_ADDRESS} from "app/core/constants";

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

function BuryLeashPage() {
  const classes = useStyles();

  const theme = useTheme();

  const results = useQuery(buryLeashQuery, {
    context: {
      clientName: "buryLeash",
    },
  });

  // console.log(results);

  const {
    data: { bury },
  } = results

  const {
    data: { histories },
  } = useQuery(buryLeashHistoriesQuery, {
    context: {
      clientName: "buryLeash",
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
      id: LEASH_TOKEN_ADDRESS,
    },
  });

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery);

  const {
    data: { dayDatas },
  } = useQuery(dayDatasQuery);

  const leashPrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  useInterval(async () => {
    await Promise.all([
      getBuryLeash,
      getBuryLeashHistories,
      getDayData,
      getFactory,
      getLeashToken,
      getEthPrice,
      getBoneToken
    ]);
  }, 60000);

  const {
    leashStakedUSD,
    leashHarvestedUSD,
    xLeashMinted,
    xLeashBurned,
    xLeash,
    apr,
    apy,
    fees,
  } = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      const dayData = dayDatas.find((d) => d.date === currentValue.date);
      previousValue["leashStakedUSD"].push({
        date,
        value: parseFloat(currentValue.leashStakedUSD),
      });
      previousValue["leashHarvestedUSD"].push({
        date,
        value: parseFloat(currentValue.leashHarvestedUSD),
      });

      previousValue["xLeashMinted"].push({
        date,
        value: parseFloat(currentValue.xLeashMinted),
      });
      previousValue["xLeashBurned"].push({
        date,
        value: parseFloat(currentValue.xLeashBurned),
      });
      previousValue["xLeash"].push({
        date,
        value: parseFloat(currentValue.xLeashSupply),
      });
      const apr =
        (((dayData.volumeUSD * 0.01 * 0.01) / currentValue.xLeashSupply) *
          365) /
        (currentValue.ratio * leashPrice);
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
      leashStakedUSD: [],
      leashHarvestedUSD: [],
      xLeashMinted: [],
      xLeashBurned: [],
      xLeash: [],
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

  const leashApr = dayDatas && (((parseFloat(dayDatas[0]?.volumeUSD) * (0.05 / 3) * 0.2) / parseFloat(bury?.totalSupply)) * 365) 
  / (parseFloat(bury?.ratio) * leashPrice)

  const APR =
    (((oneDayVolume * 0.05 * 0.01) / bury.totalSupply) * 365) /
    (bury.ratio * leashPrice);

  const APY = Math.pow(1 + leashApr / 365, 365) - 1;

  const boneToken = useQuery(tokenQuery, {
    variables: {
      id: BONE_TOKEN_ADDRESS,
    },
  });

  const bonePrice =
    parseFloat(boneToken?.data?.token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  const leashBoneApr = ((10 * parseInt(bonePrice))/(bury?.leashStakedUSD)) * 277 * 24 * 30 * 12 * 100;

  return (
    <AppShell>
      <Head>
        <title>Bury Leash | ShibaSwap Analytics</title>
      </Head>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* <Grid item xs>
              <KPI
                title="xLeash Age"
                value={parseFloat(bury.xLeashAge).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="LEASH APY (24h)" value={APY * 100} format="percent" />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (Avg)" value={averageApy} format="percent" />
            </Grid> */}
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI title="APR (24h)" value={leashApr} format="percent" />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="Additional BONE APR (24h)" value={leashBoneApr} format="percent" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="xLeash" value={bury.totalSupply} format="integer" />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="Leash"
                value={parseInt(bury.leashStaked).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="xLeash:Leash" value={Number(bury.ratio).toFixed(4)} />
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <Lines
              title="xLeash Age & xLeash Age Destroyed"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[xLeashAge, xLeashAgeDestroyed]}
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
                  title="xLeash:Leash & Leash:xLeash"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xLeashLeash, xLeashPerLeash]}
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
                  data={[leashStakedUSD, leashHarvestedUSD]}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  labels={["Leash Staked (USD)", "Leash Woofed (USD)"]}
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
                  data={[xLeashMinted, xLeashBurned]}
                  labels={["xLeash Minted", "xLeash Burned"]}
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
                  title="xLeash Total Supply"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[xLeash]}
                />
              )}
            </ParentSize>
          </Paper>

          {/* <Chart
            title="xLeash Total Supply"
            data={xLeash}
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
  await getBuryLeash(client);
  await getBuryLeashHistories(client);
  await getFactory(client);
  await getDayData(client);
  await getLeashToken(client);
  await getEthPrice(client);
  await getBoneToken(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default BuryLeashPage;
