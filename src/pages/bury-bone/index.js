import { AppShell, Curves, KPI } from "app/components";
import { Grid, Paper, useTheme } from "@material-ui/core";
import {
  buryBoneHistoriesQuery,
  buryBoneQuery,
  dayDatasQuery,
  ethPriceQuery,
  factoryQuery,
  getApollo,
  getBuryBone,
  getBuryBoneHistories,
  getDayData,
  getEthPrice,
  getFactory,
  getBoneToken,
  tokenQuery,
  useInterval,
} from "app/core";

import Chart from "../../components/Chart";
import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import {BONE_TOKEN_ADDRESS} from "app/core/constants";

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

function BuryBonePage() {
  const classes = useStyles();

  const theme = useTheme();

  const results = useQuery(buryBoneQuery, {
    context: {
      clientName: "buryBone",
    },
  });


  const {
    data: { bury },
  } = results

  const {
    data: { histories },
  } = useQuery(buryBoneHistoriesQuery, {
    context: {
      clientName: "buryBone",
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
      id: BONE_TOKEN_ADDRESS,
    },
  });

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery);

  const {
    data: { dayDatas },
  } = useQuery(dayDatasQuery);

  const bonePrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  useInterval(async () => {
    await Promise.all([
      getBuryBone,
      getBuryBoneHistories,
      getDayData,
      getFactory,
      getBoneToken,
      getEthPrice,
    ]);
  }, 60000);

  const {
    boneStakedUSD,
    boneHarvestedUSD,
    tBoneMinted,
    tBoneBurned,
    tBone,
    apr,
    apy,
    fees,
  } = histories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.date * 1000;
      const dayData = dayDatas.find((d) => d.date === currentValue.date);
      previousValue["boneStakedUSD"].push({
        date,
        value: parseFloat(currentValue.boneStakedUSD),
      });
      previousValue["boneHarvestedUSD"].push({
        date,
        value: parseFloat(currentValue.boneHarvestedUSD),
      });

      previousValue["tBoneMinted"].push({
        date,
        value: parseFloat(currentValue.tBoneMinted),
      });
      previousValue["tBoneBurned"].push({
        date,
        value: parseFloat(currentValue.tBoneBurned),
      });
      previousValue["tBone"].push({
        date,
        value: parseFloat(currentValue.tBoneSupply),
      });
      const apr =
        (((dayData.volumeUSD * 0.01 * 0.01) / currentValue.tBoneSupply) *
          365) /
        (currentValue.ratio * bonePrice);
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
      boneStakedUSD: [],
      boneHarvestedUSD: [],
      tBoneMinted: [],
      tBoneBurned: [],
      tBone: [],
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

  const boneApr = dayDatas && (((parseFloat(dayDatas[0]?.volumeUSD) * (0.05 / 3) * 0.05) / parseFloat(bury?.totalSupply)) * 365) 
  / (parseFloat(bury?.ratio) * bonePrice)

  const APR =
    (((oneDayVolume * 0.05 * 0.01) / bury.totalSupply) * 365) /
    (bury.ratio * bonePrice);

  const APY = Math.pow(1 + boneApr / 365, 365) - 1;

  const boneBoneApr = ((0.9 * parseInt(bonePrice))/(bury?.boneStakedUSD)) * 277 * 24 * 30 * 12 * 100;

  return (
    <AppShell>
      <Head>
        <title>Bury Bone | ShibaSwap Analytics</title>
      </Head>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* <Grid item xs>
              <KPI
                title="tBone Age"
                value={parseFloat(bury.tBoneAge).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="BONE APY (24h)" value={APY * 100} format="percent" />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI title="APY (Avg)" value={averageApy} format="percent" />
            </Grid> */}
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI title="APR (24h)" value={boneApr} format="percent" />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="+ BONE APR (24h)" value={boneBoneApr} format="percent" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="tBone" value={bury.totalSupply} format="integer" />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="Bone"
                value={parseInt(bury.boneStaked).toLocaleString()}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <KPI title="tBone:Bone" value={Number(bury.ratio).toFixed(4)} />
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <Lines
              title="tBone Age & tBone Age Destroyed"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[tBoneAge, tBoneAgeDestroyed]}
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
                  title="tBone:Bone & Bone:tBone"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[tBoneBone, tBonePerBone]}
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
                  data={[boneStakedUSD, boneHarvestedUSD]}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  labels={["Bone Staked (USD)", "Bone Woofed (USD)"]}
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
                  data={[tBoneMinted, tBoneBurned]}
                  labels={["tBone Minted", "tBone Burned"]}
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
                  title="tBone Total Supply"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[tBone]}
                />
              )}
            </ParentSize>
          </Paper>

          {/* <Chart
            title="tBone Total Supply"
            data={tBone}
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
  await getBuryBone(client);
  await getBuryBoneHistories(client);
  await getFactory(client);
  await getDayData(client);
  await getBoneToken(client);
  await getEthPrice(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default BuryBonePage;
