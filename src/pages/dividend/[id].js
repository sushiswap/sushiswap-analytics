import {
  AppShell,
  // Chart,
  Curves,
  KPI,
  Link,
  PageHeader,
  PairIcon,
} from "app/components";
import { Grid, Paper, makeStyles, Box, Typography } from "@material-ui/core";
import {
  bondedStrategyPairHistoriesQuery,
  bondedStrategyPairQuery,
  // currencyFormatter,
  ethPriceQuery,
  getApollo,
  getBondedStrategyPair,
  getBondedStrategyPairsHistory,
  getEthPrice,
} from "app/core";

import Head from "next/head";
// import { POOL_DENY } from "app/core/constants";
import { ParentSize } from "@visx/responsive";
import { useRouter } from "next/router";
// import { deepPurple } from "@material-ui/core/colors";
import { useQuery } from "@apollo/client";
import { getNetwork } from "core/state";
// import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function DividendPairPage() {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <AppShell>
        <div />
      </AppShell>
    );
  }

  const classes = useStyles();
  const { id } = router.query;

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery);

  const {
    data: { bondedStrategyPair },
  } = useQuery(bondedStrategyPairQuery, {
    variables: {
      id,
    },
  });

  const {
    data: { bondedStrategyPairHistories: histories },
  } = useQuery(bondedStrategyPairHistoriesQuery, {
    variables: {
      id,
    },
  });

  const ethPrice = parseFloat(bundles[0]?.ethPrice ?? "0");

  const currentClaimedReward =
    parseFloat(bondedStrategyPair.claimedReward) / 1e18;
  const currentClaimedRewardUSD = parseFloat(
    bondedStrategyPair.claimedRewardUSD
  );
  const currentRemainingReward =
    parseFloat(bondedStrategyPair.remainingReward) / 1e18;
  const currentRemainingRewardUSD =
    parseFloat(bondedStrategyPair.remainingRewardETH) * ethPrice;

  const {
    claimedReward,
    claimedRewardUSD,
    remainingReward,
    remainingRewardUSD,
  } = histories.reduce(
    (previousValue, currentValue, i) => {
      const date = currentValue.date * 1000;
      // const dayData = dayDatas.find((d) => d.date === currentValue.date);
      // const totalSupplyDecimals = parseFloat(currentValue.totalSupply) / 1e18;

      previousValue["claimedReward"].push({
        date,
        value: parseFloat(currentValue.claimedReward) / 1e18,
      });

      previousValue["claimedRewardUSD"].push({
        date,
        value: parseFloat(currentValue.claimedRewardUSD),
      });

      previousValue["remainingReward"].push({
        date,
        value: parseFloat(currentValue.remainingReward) / 1e18,
      });

      previousValue["remainingRewardUSD"].push({
        date,
        value: parseFloat(currentValue.remainingRewardUSD),
      });

      // const totalRewardUSD =
      //   parseFloat(currentValue.claimedRewardUSD) +
      //   parseFloat(currentValue.remainingRewardUSD);

      // previousValue["totalRewardUSD"].push({
      //   date,
      //   value: totalRewardUSD,
      // });

      // const dateFromInception = currentValue.date / 86400 - inception;
      // const r = totalRewardUSD / parseFloat(currentValue.totalSupplyUSD);
      // const apr = (Math.pow(r + 1, 1 / (dateFromInception + 1)) - 1) * 365;

      // if (i > 0) {
      //   const previousTotalRewardUSD = previousValue.totalRewardUSD[i - 1];
      //   console.log(previousTotalRewardUSD.value, totalRewardUSD);
      //   console.log(
      //     totalRewardUSD - previousTotalRewardUSD.value,
      //     currentValue.totalSupplyUSD
      //   );
      //   const apr =
      //     ((totalRewardUSD - previousTotalRewardUSD.value) /
      //       parseFloat(currentValue.totalSupplyUSD)) *
      //     365;

      // previousValue["apr"].push({
      //   date,
      //   value: parseFloat(apr * 100),
      // });
      // previousValue["apy"].push({
      //   date,
      //   value: parseFloat((Math.pow(1 + apr / 365, 365) - 1) * 100),
      // });

      return previousValue;
    },
    {
      claimedReward: [],
      claimedRewardUSD: [],
      remainingReward: [],
      remainingRewardUSD: [],
      // totalRewardUSD: [],
      // apr: [],
      // apy: [],
    }
  );

  return (
    <AppShell>
      <Head>
        <title>Dividend Pair {id} | Analytics</title>
      </Head>

      <PageHeader mb={3}>
        <Box display="flex" alignItems="center" flex={1} flexWrap="nowrap">
          <Box display="flex" alignItems="center" flex={1}>
            <PairIcon
              base={bondedStrategyPair.pair.token0}
              quote={bondedStrategyPair.pair.token1}
            />
            <Typography variant="h5" component="h1">
              {bondedStrategyPair.pair.token0.symbol}-
              {bondedStrategyPair.pair.token1.symbol} PAIR DIVIDEND
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <Link href="https://apps.standard.tech/dividend">Claim</Link>
          </Box>
        </Box>
      </PageHeader>

      <Grid item xs={12} sm="auto">
        <Grid container spacing={3}>
          {/* <Grid item xs>
              <KPI
                title="xSushi Age"
                value={parseFloat(bar.xSushiAge).toLocaleString()}
              />
            </Grid> */}
          <Grid item xs={12} sm={6} md={3}>
            <KPI
              title="Claimed Rewards (USD)"
              value={currentClaimedRewardUSD}
              format="integer"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPI
              title="Claimed Rewards (LTR)"
              value={currentClaimedReward}
              format="currency"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPI
              title="Remaining Rewards (USD)"
              value={currentRemainingRewardUSD}
              format="currency"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPI
              title="Remaining Rewards (LTR)"
              value={currentRemainingReward}
              format="integer"
            />
          </Grid>

          {/* <Grid item xs={12} sm={6} md={3}>
              <KPI
                title="Sushi"
                value={parseInt(bar.sushiStaked).toLocaleString()}
              />
            </Grid> */}
        </Grid>
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            position: "relative",
            height: 400,
            flex: 1,
          }}
        >
          <ParentSize>
            {({ width, height }) => (
              <Curves
                title="Claimed Reward (USD)"
                width={width}
                height={height}
                margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                data={[claimedRewardUSD]}
              />
            )}
          </ParentSize>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            position: "relative",
            height: 400,
            flex: 1,
          }}
        >
          <ParentSize>
            {({ width, height }) => (
              <Curves
                title="Claimed Reward (LTR)"
                width={width}
                height={height}
                margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                data={[claimedReward]}
              />
            )}
          </ParentSize>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            position: "relative",
            height: 400,
            flex: 1,
          }}
        >
          <ParentSize>
            {({ width, height }) => (
              <Curves
                title="Remaining Reward (USD)"
                width={width}
                height={height}
                margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                data={[remainingRewardUSD]}
              />
            )}
          </ParentSize>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            position: "relative",
            height: 400,
            flex: 1,
          }}
        >
          <ParentSize>
            {({ width, height }) => (
              <Curves
                title="Remaining Reward (LTR)"
                width={width}
                height={height}
                margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                data={[remainingReward]}
              />
            )}
          </ParentSize>
        </Paper>
      </Grid>
    </AppShell>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();
  // await getEthPrice(client);
  await getBondedStrategyPair(id, client);
  await getBondedStrategyPairsHistory(id, client);
  await getEthPrice(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  // const client = getApollo();
  // const { pools } = await getPoolIds(client);
  // const paths = pools.map((pool) => ({
  //   params: { id: pool.id },
  // }));
  return { paths: [], fallback: true };
}

export default DividendPairPage;
