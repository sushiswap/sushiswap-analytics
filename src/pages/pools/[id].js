import {
  AppShell,
  // Chart,
  Curves,
  KPI,
  Link,
  LiquidityProviderList,
  PageHeader,
  PairIcon,
} from "app/components";
import { Box, Grid, Paper, Typography, makeStyles } from "@material-ui/core";
import {
  // currencyFormatter,
  getApollo,
  getEthPrice,
  getPool,
  getPoolHistories,
  // getPoolIds,
  // getPools,
  getSushiToken,
  poolHistoryQuery,
  poolQuery,
} from "app/core";

import Head from "next/head";
// import { POOL_DENY } from "app/core/constants";
import { ParentSize } from "@visx/responsive";
import { useNetwork } from "state/network/hooks";
import { useRouter } from "next/router";
// import { deepPurple } from "@material-ui/core/colors";
import { useQuery } from "@apollo/client";
import { BigNumber } from "bignumber.js";
// import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PoolPage() {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <AppShell>
        <div />
      </AppShell>
    );
  }

  const classes = useStyles();
  // const theme = useTheme();

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

  // const {
  //   data: { bundles },
  // } = useQuery(ethPriceQuery, {
  //   pollInterval: 60000,
  // });

  // console.log(STND_ADDRESS[chainId]);
  // const {
  //   data: { token },
  // } = useQuery(tokenQuery, {
  //   variables: {
  //     id: STND_ADDRESS[chainId],
  //   },
  // });

  // const sushiPrice =
  //   parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);
  const {
    slpAge,
    slpAgeRemoved,
    userCount,
    slpDeposited,
    slpWithdrawn,
    slpAgeAverage,
    slpBalance,
    tvl,
  } = poolHistories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.timestamp * 1000;

      previousValue.slpAge.push({
        date,
        value: currentValue.slpAge,
      });

      const slpAgeAverage =
        parseFloat(currentValue.slpAge) /
        parseFloat(currentValue.slpBalanceDecimal);

      previousValue.slpAgeAverage.push({
        date,
        value: !Number.isNaN(slpAgeAverage) ? slpAgeAverage : 0,
      });

      previousValue.slpAgeRemoved.push({
        date,
        value: currentValue.slpAgeRemoved,
      });

      previousValue.slpBalance.push({
        date,
        value: parseFloat(currentValue.slpBalanceDecimal),
      });

      previousValue.slpDeposited.push({
        date,
        value: parseFloat(currentValue.slpDeposited),
      });

      previousValue.slpWithdrawn.push({
        date,
        value: parseFloat(currentValue.slpWithdrawn),
      });

      previousValue.tvl.push({
        date,
        value: parseFloat(
          BigNumber(pool.liquidityPair.reserveUSD)
            .dividedBy(BigNumber(pool.liquidityPair.totalSupply))
            .multipliedBy(BigNumber(currentValue.slpBalanceDecimal))
            .toFixed(6)
        ),
      });

      previousValue.userCount.push({
        date,
        value: parseFloat(currentValue.userCount),
      });

      return previousValue;
    },
    {
      entries: [],
      exits: [],
      slpAge: [],
      slpAgeAverage: [],
      slpAgeRemoved: [],
      slpBalance: [],
      slpDeposited: [],
      slpWithdrawn: [],
      tvl: [],
      userCount: [],
    }
  );

  return (
    <AppShell>
      <Head>
        <title>Pool {id} | Analytics</title>
      </Head>

      <PageHeader mb={3}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          // className={classes.top}
        >
          <Grid item xs={12} sm="auto" className={classes.title}>
            <Box display="flex" alignItems="center">
              <PairIcon
                base={pool.liquidityPair.token0}
                quote={pool.liquidityPair.token1}
              />
              <Typography variant="h5" component="h1">
                {pool.liquidityPair.token0.symbol}-
                {pool.liquidityPair.token1.symbol} POOL
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto" className={classes.links}>
            <Link
              href={`https://apps.standard.tech/add/${
                pool.liquidityPair.token0.symbol === "WETH" ||
                pool.liquidityPair.token0.symbol === "ETH"
                  ? "ETH"
                  : pool.liquidityPair.token0.id
              }/${
                pool.liquidityPair.token1.symbol === "WETH" ||
                pool.liquidityPair.token1.symbol === "ETH"
                  ? "ETH"
                  : pool.liquidityPair.token1.id
              }`}
              target="_blank"
              variant="body1"
            >
              Stake LTR
            </Link>
          </Grid>
        </Grid>

        {/* <Box display="flex" alignItems="center">
          <PairIcon
            base={pool.liquidityPair.token0.id}
            quote={pool.liquidityPair.token1.id}
          />
          <Typography variant="h5" component="h1">
            {pool.liquidityPair.token0.symbol}-
            {pool.liquidityPair.token1.symbol} POOL
          </Typography>
        </Box> */}
      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <KPI
            title="~ LTR Age"
            value={`${(
              parseFloat(pool.slpAge) / parseFloat(pool.slpBalance / 1e18)
            ).toFixed(2)} Days`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI title="Users" value={pool.userCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI
            title="Staked"
            value={`${(pool.slpBalance / 1e18).toFixed(4)} LTR`}
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
        {/* 
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
                  width={width}
                  height={height}
                  title="Profitability"
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[pendingSushi]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid> */}

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
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpAge, slpAgeRemoved]}
                  labels={["LTR Age", "LTR Age Removed"]}
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
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpDeposited, slpWithdrawn]}
                  labels={["LTR Deposited", "LTR Age Withdrawn"]}
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
                  title="~ LTR Age (Days)"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpAgeAverage]}
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
                  title="Users"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[userCount]}
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
                  title="LTR Balance"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpBalance]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        {/* <Grid item xs={12}>
          <Chart
            title="Virtual Profit/Loss USD"
            data={profit}
            height={400}
            margin={{ top: 56, right: 24, bottom: 0, left: 56 }}
            tooptip
            brush
          />
        </Grid> */}

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
                  title="TVL (USD)"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[tvl]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>
      </Grid>

      <LiquidityProviderList
        pool={pool}
        orderBy="amount"
        title="Top Liquidity Providers"
      />
      {/* <pre>{JSON.stringify(pool, null, 2)}</pre> */}
    </AppShell>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();
  await getEthPrice(client);
  await getSushiToken(client);
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
  // const client = getApollo();
  // const { pools } = await getPoolIds(client);
  // const paths = pools.map((pool) => ({
  //   params: { id: pool.id },
  // }));
  return { paths: [], fallback: true };
}

export default PoolPage;
