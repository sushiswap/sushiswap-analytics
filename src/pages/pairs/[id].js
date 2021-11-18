import {
  AppShell,
  AreaChart,
  BarChart,
  BasicTable,
  Chart,
  IntoTheBlock,
  KPI,
  Link,
  PageHeader,
  PairIcon,
  Percent,
  TokenIcon,
  Transactions,
} from "app/components";
import { Avatar, Box, Chip, Grid, Paper, Typography } from "@material-ui/core";
import {
  ethPriceQuery,
  formatCurrency,
  formatDecimal,
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
  firstLink: {
    marginRight: theme.spacing(2),
  },
  pageHeader: {
    display: "block",
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
  },
  links: {
    margin: theme.spacing(2, 0),
    [theme.breakpoints.up("sm")]: {
      margin: 0,
    },
  },
}));

function PairPage(props) {
  const router = useRouter();

  if (router.isFallback) {
    return <AppShell />;
  }

  const classes = useStyles();

  const id = router.query.id.toLowerCase();

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

  const avgTradePrice = volume / (pair?.txCount - pair?.oneDay?.txCount);

  const avgTradePriceYesturday =
    volumeYesterday / (pair?.oneDay?.txCount - pair?.twoDay?.txCount);

  const avgTradePriceChange =
    ((avgTradePrice - avgTradePriceYesturday) / avgTradePriceYesturday) * 100;

  const utilisation = (volume / pair.reserveUSD) * 100;

  const utilisationYesterday = (volumeYesterday / pair.oneDay.reserveUSD) * 100;

  const utilisationChange =
    ((utilisation - utilisationYesterday) / utilisationYesterday) * 100;

  const tx = pair.txCount - pair.oneDay.txCount;

  const txYesterday = pair.oneDay.txCount - pair.twoDay.txCount;

  const txChange = ((tx - txYesterday) / txYesterday) * 100;

  const chartDatas = pairDayDatas.reduce(
    (previousValue, currentValue) => {
      const untrackedVolumeUSD =
        currentValue?.token0.derivedETH * currentValue?.volumeToken0 +
        currentValue?.token1.derivedETH *
          currentValue?.volumeToken1 *
          bundles[0].ethPrice;

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

  // console.log(pair);

  return (
    <AppShell>
      <Head>
        <title>
          {pair.token0.symbol}-{pair.token1.symbol} | SushiSwap Analytics
        </title>
      </Head>
      <PageHeader>
        <Box display="flex" alignItems="center" className={classes.pageHeader}>
          <Box display="flex" alignItems="center" flex={1} flexWrap="nowrap">
            <PairIcon base={pair.token0.id} quote={pair.token1.id} />
            <Typography variant="h5" component="h1" noWrap>
              {pair.token0.symbol}-{pair.token1.symbol}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" className={classes.links}>
            <Link
              href={`https://app.sushi.com/add/${pair.token0.id}/${pair.token1.id}`}
              target="_blank"
              variant="body1"
              className={classes.firstLink}
            >
              Add Liquidity
            </Link>
            <Link
              href={`https://app.sushi.com/swap?inputCurrency=${pair.token0.id}&outputCurrency=${pair.token1.id}`}
              target="_blank"
              variant="body1"
            >
              Trade
            </Link>
          </Box>
        </Box>
      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" className={classes.paper}>
            <Box display="flex" alignItems="center">
              <TokenIcon className={classes.avatar} id={pair.token0.id} />
              <Typography
                variant="h6"
                color="textPrimary"
                noWrap
                className={classes.reserve}
              >
                {formatDecimal(pair.reserve0)}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" noWrap>
                {pair.token0.symbol}
              </Typography>
            </Box>
            <Typography variant="body2">
              {`1 ${pair.token0.symbol} = ${formatDecimal(
                pair.reserve1 / pair.reserve0
              )} ${pair.token1.symbol} (${formatCurrency(
                pair.token0?.derivedETH * bundles[0].ethPrice
              )})`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" className={classes.paper}>
            <Box display="flex" alignItems="center">
              <TokenIcon className={classes.avatar} id={pair.token1.id} />
              <Typography
                variant="h6"
                color="textPrimary"
                noWrap
                className={classes.reserve}
              >
                {formatDecimal(pair.reserve1)}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" noWrap>
                {pair.token1.symbol}{" "}
              </Typography>
            </Box>
            <Typography variant="body2">
              {`1 ${pair.token1.symbol} = ${formatDecimal(
                pair.reserve0 / pair.reserve1
              )} ${pair.token0.symbol} (${formatCurrency(
                pair.token1?.derivedETH * bundles[0].ethPrice
              )})`}
            </Typography>
          </Paper>
        </Grid>

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
        <Grid item xs={12} sm={6} md={4}>
          <KPI
            title="Liquidity (24h)"
            value={pair?.reserveUSD}
            difference={
              ((pair?.reserveUSD - pair?.oneDay?.reserveUSD) /
                pair?.oneDay?.reserveUSD) *
              100
            }
            format="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPI
            title="Volume (24h)"
            value={volume}
            difference={volumeChange}
            format="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPI
            title="Fees (24h)"
            value={fees}
            // difference={
            //   100 *
            //   Math.abs((fees - feesYesterday) / ((fees + feesYesterday) / 2))
            // }
            difference={((fees - feesYesterday) / feesYesterday) * 100}
            format="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPI
            title="Tx (24h)"
            value={tx}
            difference={txChange}
            format="integer"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPI
            title="Avg. Trade (24h)"
            value={avgTradePrice}
            difference={avgTradePriceChange}
            format="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPI
            title="Utilisation (24h)"
            value={utilisation}
            difference={utilisationChange}
            format="percent"
          />
        </Grid>
      </Grid>

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
      <Box my={4}>
        <IntoTheBlock pairAddress={pair.id} />
      </Box>
      <Box my={4}>
        <Transactions transactions={transactions} txCount={pair.txCount} />
      </Box>
    </AppShell>
  );
}

export async function getStaticProps({ params }) {
  const client = getApollo();

  const id = params.id.toLowerCase()

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
