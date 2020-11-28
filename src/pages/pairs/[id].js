import {
  AppShell,
  AreaChart,
  BarChart,
  BasicTable,
  Chart,
  KPI,
  Link,
  PageHeader,
  PairIcon,
  Percent,
  Transactions,
} from "app/components";
import { Avatar, Box, Chip, Grid, Paper, Typography } from "@material-ui/core";
import {
  currencyFormatter,
  decimalFormatter,
  ethPriceQuery,
  getApollo,
  getPair,
  pairDayDatasQuery,
  pairIdsQuery,
  pairQuery,
  transactionsQuery,
  useInterval,
} from "app/core";

import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
  },
  top: {
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.up("sm")]: {
      marginBottom: 0,
    },
  },
  links: {
    "& > a:first-of-type": {
      marginRight: theme.spacing(4),
    },
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  avatars: {
    marginRight: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
  },
  reserve: {
    marginRight: theme.spacing(1),
  },
  chips: {
    // margin: theme.spacing(4, 0, 0, 0),
    "& > div:first-of-type": {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        marginBottom: 0,
      },
    },
  },
}));

function PairPage(props) {
  const router = useRouter();

  if (router.isFallback) {
    return <AppShell />;
  }

  const classes = useStyles();

  const { id } = router.query;

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  const {
    data: { pair },
  } = useQuery(pairQuery, {
    query: pairQuery,
    variables: { id },
  });

  useInterval(async () => {
    await getPair(id);
  }, 60000);

  const { data: transactions } = useQuery(transactionsQuery, {
    variables: { pairAddresses: [id] },
    pollInterval: 60000,
  });

  const {
    data: { pairDayDatas },
  } = useQuery(pairDayDatasQuery, {
    variables: {
      pairs: [id],
    },
    pollInterval: 60000,
  });

  const volumeUSD =
    pair?.volumeUSD === "0" ? pair?.untrackedVolumeUSD : pair?.volumeUSD;

  const oneDayVolumeUSD =
    pair?.oneDay?.volumeUSD === "0"
      ? pair?.oneDay?.untrackedVolumeUSD
      : pair?.oneDay?.volumeUSD;

  const twoDayVolumeUSD =
    pair?.twoDay?.volumeUSD === "0"
      ? pair?.twoDay?.untrackedVolumeUSD
      : pair?.twoDay?.volumeUSD;

  const volume = volumeUSD - oneDayVolumeUSD;

  const volumeYesterday = oneDayVolumeUSD - twoDayVolumeUSD;

  const volumeChange = ((volume - volumeYesterday) / volumeYesterday) * 100;

  const fees = volume * 0.003;

  const feesYesterday = volumeYesterday * 0.003;

  const chartDatas = pairDayDatas.reduce(
    (previousValue, currentValue) => {
      const untrackedVolumeUSD =
        currentValue?.token0.derivedETH * currentValue?.volumeToken0 +
        currentValue?.token1.derivedETH *
          currentValue?.volumeToken1 *
          bundles[0].ethPrice;

      // console.log("untrackedVolumeUSD", untrackedVolumeUSD)

      const volumeUSD =
        currentValue?.volumeUSD === "0"
          ? untrackedVolumeUSD
          : currentValue?.volumeUSD;

      previousValue["liquidity"].unshift({
        date: currentValue.date,
        value: parseFloat(currentValue.reserveUSD),
      });
      previousValue["volume"].unshift({
        date: currentValue.date,
        value: parseFloat(volumeUSD),
      });
      return previousValue;
    },
    { liquidity: [], volume: [] }
  );

  return (
    <AppShell>
      <Head>
        <title>
          {pair.token0.symbol}-{pair.token1.symbol} | SushiSwap Analytics
        </title>
      </Head>
      <PageHeader>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          className={classes.top}
        >
          <Grid item xs={12} sm="auto" className={classes.title}>
            <Box display="flex" alignItems="center">
              <PairIcon base={pair.token0.id} quote={pair.token1.id} />
              <Typography variant="h5" component="h1">
                {pair.token0.symbol}-{pair.token1.symbol} PAIR
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm="auto" className={classes.links}>
            <Link
              href={`https://exchange.sushiswapclassic.org/#/add/${pair.token0.id}/${pair.token1.id}`}
              target="_blank"
              variant="body1"
            >
              Add Liquidity
            </Link>
            <Link
              href={`https://exchange.sushiswapclassic.org/#/swap?inputCurrency=${pair.token0.id}&outputCurrency=${pair.token1.id}`}
              target="_blank"
              variant="body1"
            >
              Trade
            </Link>
          </Grid>
        </Grid>
      </PageHeader>

      <Grid container spacing={3}>
        {chartDatas.liquidity.length > 1 ? (
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              style={{ height: 300, position: "relative" }}
            >
              <ParentSize>
                {({ width, height }) => (
                  <AreaChart
                    title="Liquidity"
                    data={chartDatas.liquidity}
                    margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                    width={width}
                    height={height}
                    tooltipDisabled
                    overlayEnabled
                  />
                )}
              </ParentSize>
            </Paper>
          </Grid>
        ) : null}

        {chartDatas.liquidity.length > 1 ? (
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              style={{ height: 300, position: "relative" }}
            >
              <ParentSize>
                {({ width, height }) => (
                  <BarChart
                    title="Volume"
                    data={chartDatas.volume}
                    width={width}
                    height={height}
                    margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                    tooltipDisabled
                    overlayEnabled
                  />
                )}
              </ParentSize>
            </Paper>
          </Grid>
        ) : null}

        <Grid item xs={12} md={4}>
          <KPI
            title="Liquidity (24h)"
            value={currencyFormatter.format(pair?.reserveUSD || 0)}
            difference={(
              ((pair?.reserveUSD - pair?.oneDay?.reserveUSD) /
                pair?.oneDay?.reserveUSD) *
              100
            ).toFixed(2)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPI
            title="Volume (24h)"
            value={currencyFormatter.format(volume || 0)}
            difference={volumeChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPI
            title="Fees (24h)"
            value={currencyFormatter.format(fees)}
            difference={((fees - feesYesterday) / feesYesterday) * 100}
          />
        </Grid>
      </Grid>

      <Box my={4}>
        <Typography variant="h6" component="h2" gutterBottom>
          Tokens
        </Typography>
        <Grid container justify="flex-start" xs={12} className={classes.chips}>
          <Grid item>
            <Chip
              color="primary"
              avatar={
                <Avatar
                  style={{ backgroundColor: "transparent" }}
                  alt="USDC"
                  src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                    pair.token0.id
                  )}/logo.png`}
                />
              }
              clickable
              onClick={() => {
                router.push("/tokens/" + pair.token0.id);
              }}
              label={`1 ${pair.token0.symbol} = ${decimalFormatter.format(
                pair.reserve1 / pair.reserve0
              )} ${pair.token1.symbol} (${currencyFormatter.format(
                pair.token0?.derivedETH * bundles[0].ethPrice
              )})`}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              color="primary"
              avatar={
                <Avatar
                  style={{ backgroundColor: "transparent" }}
                  alt="ETH"
                  src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                    pair.token1.id
                  )}/logo.png`}
                />
              }
              clickable
              onClick={() => {
                router.push("/tokens/" + pair.token1.id);
              }}
              label={`1 ${pair.token1.symbol} = ${decimalFormatter.format(
                pair.reserve0 / pair.reserve1
              )} ${pair.token0.symbol} (${currencyFormatter.format(
                pair.token1?.derivedETH * bundles[0].ethPrice
              )})`}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>

      <Box my={4}>
        <Typography variant="h6" component="h2" gutterBottom>
          Reserves
        </Typography>
        <Grid container spacing={3}>
          <Grid item>
            <Box display="flex" alignItems="center">
              <Avatar
                className={classes.avatar}
                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                  pair.token0.id
                )}/logo.png`}
              />
              <Typography
                variant="h6"
                color="textPrimary"
                noWrap
                className={classes.reserve}
              >
                {decimalFormatter.format(pair.reserve0)}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" noWrap>
                {pair.token0.symbol}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center">
              <Avatar
                className={classes.avatar}
                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                  pair.token1.id
                )}/logo.png`}
              />
              <Typography
                variant="h6"
                color="textPrimary"
                noWrap
                className={classes.reserve}
              >
                {decimalFormatter.format(pair.reserve1)}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" noWrap>
                {pair.token1.symbol}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box my={4}>
        <BasicTable
          title="Information"
          headCells={[
            {
              key: "id",
              label: `${pair.token0.symbol}-${pair.token1.symbol} Address`,
              maxWidth: "250px",
            },
            {
              key: "token0",
              label: `${pair.token0.symbol} Address`,
              maxWidth: "250px",
            },
            {
              key: "token1",
              label: `${pair.token1.symbol} Address`,
              maxWidth: "250px",
            },
            { key: "etherscan", label: "Etherscan", align: "right" },
          ]}
          bodyCells={[
            <Typography variant="body2" noWrap>
              {pair.id}
            </Typography>,
            <Typography variant="body2" noWrap>
              {pair.token0.id}
            </Typography>,
            <Typography variant="body2" noWrap>
              {pair.token1.id}
            </Typography>,
            <Link href={`https://etherscan.io/address/${pair.id}`}>View</Link>,
          ]}
        />
      </Box>
      <Transactions transactions={transactions} txCount={pair.txCount} />
    </AppShell>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();

  // EthPrice
  await client.query({
    query: ethPriceQuery,
  });

  await getPair(id, client);

  await client.query({
    query: pairDayDatasQuery,
    variables: {
      pairs: [id],
    },
  });

  await client.query({
    query: transactionsQuery,
    variables: {
      pairAddresses: [id],
    },
  });

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  // const apollo = getApollo();

  // const { data } = await apollo.query({
  //   query: pairIdsQuery,
  // });

  // const paths = data.pairs.map((pair) => ({
  //   params: { id: pair.id },
  // }));

  return { paths: [], fallback: true };
}

export default PairPage;
