import {
  AreaChart,
  KPI,
  Layout,
  LineChart,
  LiquidityProviderList,
  PageHeader,
  PairIcon,
} from "app/components";
import {
  Box,
  Grid,
  Paper,
  Typography,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import {
  getApollo,
  getPool,
  getPoolHistories,
  getPools,
  poolHistoryQuery,
  poolQuery,
} from "app/core";

import Head from "next/head";
import { deepPurple } from "@material-ui/core/colors";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PoolPage() {
  const router = useRouter();

  if (router.isFallback) {
    return <Layout>New pool detected, generating...</Layout>;
  }

  const classes = useStyles();

  const theme = useTheme();

  const { id } = router.query;

  const {
    data: { pool },
  } = useQuery(poolQuery, {
    variables: {
      id,
    },
    context: {
      clientName: "masterchef",
    },
  });

  const {
    data: { poolHistories },
  } = useQuery(poolHistoryQuery, {
    variables: {
      id,
    },
    context: {
      clientName: "masterchef",
    },
  });

  const [
    slpAge,
    slpAgeRemoved,
    users,
    slpDeposited,
    slpWithdrawn,
    averageSlpAge,
  ] = poolHistories.reduce(
    (previousValue, currentValue) => {
      const time = new Date(parseInt(currentValue.timestamp) * 1e3)
        .toISOString()
        .slice(0, 10);

      previousValue[0].push({
        time,
        value: currentValue.slpAge,
      });

      previousValue[1].push({
        time,
        value: currentValue.slpAgeRemoved,
      });

      previousValue[2].push({
        time,
        value: parseInt(currentValue.userCount),
      });

      previousValue[3].push({
        time,
        value: parseFloat(currentValue.slpDeposited),
      });

      previousValue[4].push({
        time,
        value: parseFloat(currentValue.slpWithdrawn),
      });

      const average =
        parseInt(currentValue.slpAge) / parseFloat(currentValue.slpBalance);
      previousValue[5].push({
        time,
        value: !Number.isNaN(average) ? average : 0,
      });

      return previousValue;
    },
    [[], [], [], [], [], []]
  );

  return (
    <Layout>
      <Head>
        <title>Pool {id} | SushiSwap Analytics</title>
      </Head>

      <PageHeader mb={3}>
        <Box display="flex" alignItems="center">
          <PairIcon
            base={pool.liquidityPair.token0.id}
            quote={pool.liquidityPair.token1.id}
          />
          <Typography variant="h5" component="h1">
            {pool.liquidityPair.token0.symbol}-
            {pool.liquidityPair.token1.symbol}
          </Typography>
        </Box>
      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <KPI
            title="~ SLP Age"
            value={`${(
              parseFloat(pool.slpAge) / parseFloat(pool.balance / 1e18)
            ).toFixed(2)} Days`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI title="Pool Users" value={pool.userCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI
            title="Staked"
            value={`${(pool.balance / 1e18).toFixed(4)} SLP`}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="SLP Age & SLP Age Removed"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[slpAge, slpAgeRemoved]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="SLP Deposited & SLP Withdrawn"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[
                theme.palette.positive.light,
                theme.palette.negative.light,
              ]}
              lines={[slpDeposited, slpWithdrawn]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="~ SLP Age (Days)"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[theme.palette.positive.light]}
              lines={[averageSlpAge]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <LineChart
              title="Active Users"
              margin={{ top: 64, right: 32, bottom: 32, left: 64 }}
              strokes={[theme.palette.positive.light]}
              lines={[users]}
            />
          </Paper>
        </Grid>
      </Grid>

      <LiquidityProviderList
        pool={pool}
        orderBy="amount"
        title="Top Liquidity Providers"
      />
      {/* <pre>{JSON.stringify(pool, null, 2)}</pre> */}
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();
  await getPool(id, client);
  await getPoolHistories(id, client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  const { pools } = await getPools();
  const paths = pools.map((pool) => ({
    params: { id: pool.id },
  }));
  // console.log("STATIC PATH FOR POOLS", paths);
  return { paths, fallback: true };
}

export default PoolPage;
