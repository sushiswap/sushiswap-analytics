import {
  AreaChart,
  BrushChart,
  KPI,
  Layout,
  LineChart,
  LiquidityProviderList,
  PageHeader,
  PairIcon,
  StackedBrushChart,
  ThresholdChart,
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
  currencyFormatter,
  getApollo,
  getPool,
  getPoolHistories,
  getPoolIds,
  getPools,
  poolHistoryQuery,
  poolQuery,
} from "app/core";

import Head from "next/head";
import { POOL_DENY } from "../../constants";
import { deepPurple } from "@material-ui/core/colors";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PoolPage() {
  const router = useRouter();

  if (router.isFallback) {
    return <Layout />;
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
    slpBalance,
    slpFlow,
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

      // console.log({ userCount: parseFloat(currentValue.userCount) });

      previousValue[2].push({
        time,
        value: parseFloat(currentValue.userCount),
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
        parseFloat(currentValue.slpAge) / parseFloat(currentValue.slpBalance);

      previousValue[5].push({
        time,
        value: !Number.isNaN(average) ? average : 0,
      });

      previousValue[6].push({
        time,
        value: parseFloat(currentValue.slpBalance),
      });

      previousValue[7].push({
        time,
        slpDeposited: parseFloat(currentValue.slpDeposited),
        slpWithdrawn: parseFloat(currentValue.slpWithdrawn),
      });
      return previousValue;
    },
    [[], [], [], [], [], [], [], []]
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
          <KPI title="Users" value={pool.userCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI
            title="Staked"
            value={`${(pool.balance / 1e18).toFixed(4)} SLP`}
          />
        </Grid>
        {/* <Grid item xs={12} sm={4}>
          <KPI
            title="Fees (24h)"
            value={currencyFormatter.format(
              pool.liquidityPair.volumeUSD * 0.03
            )}
          />
        </Grid> */}

        <Grid item xs={12}>
          <Typography variant="h6" component="h2" gutterBottom>
            ~ SLP Age (Days)
          </Typography>
          <Paper
            variant="outlined"
            style={{ height: 400, position: "relative" }}
          >
            <BrushChart data={averageSlpAge} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" component="h2" gutterBottom>
            Users
          </Typography>
          <Paper
            variant="outlined"
            style={{ height: 400, position: "relative" }}
          >
            <BrushChart data={users} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" component="h2" gutterBottom>
            SLP Balance
          </Typography>
          <Paper
            variant="outlined"
            style={{ height: 400, position: "relative" }}
          >
            <BrushChart data={slpBalance} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            style={{ height: 400, position: "relative" }}
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
            style={{ height: 400, position: "relative" }}
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
      </Grid>

      {/* <Grid item xs={12}>
          <Typography variant="h6" component="h2" gutterBottom>
            SLP Deposited & SLP Withdrawn
          </Typography>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <StackedBrushChart data={[slpDeposited, slpWithdrawn]} />
          </Paper>
        </Grid>
      </Grid> */}

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
  const client = getApollo();
  const { pools } = await getPoolIds(client);
  const paths = pools.map((pool) => ({
    params: { id: pool.id },
  }));
  return { paths, fallback: true };
}

export default PoolPage;
