import {
  AreaChart,
  BarChart,
  BasicTable,
  Chart,
  KPI,
  Layout,
  Link,
  PairIcon,
  Percent,
  Transactions,
} from "app/components";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
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
import { getUnixTime, startOfDay, subMonths } from "date-fns";

import Head from "next/head";
import React from "react";
import Router from "next/router";
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
  chips: {
    margin: theme.spacing(0, 0, 4),
    "& > div:first-of-type": {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        marginBottom: 0,
      },
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
}));

function PairPage(props) {
  const router = useRouter();

  if (router.isFallback) {
    return <Layout>New pair detected, generating...</Layout>;
  }

  const classes = useStyles();

  const { id } = router.query;

  const [type, setType] = React.useState("liquidity");
  const [chartType, setChartType] = React.useState("area");
  const [timeframe, setTimeframe] = React.useState("ALL");

  const handleTimeframe = (event, timeframe) => {
    if (timeframe) {
      setTimeframe(timeframe);
    }
  };

  const handleType = (event, type) => {
    if (type) {
      if (type === "liquidity") {
        setChartType("area");
      }
      if (type === "volume") {
        setChartType("histogram");
      }
      if (type === "transactions") {
        setChartType("area");
      }
      setType(type);
    }
  };

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

  const start = new Date();

  if (timeframe === "ALL") {
    start.setTime(628021800000);
  }

  if (timeframe === "1W") {
    start.setDate(new Date().getDate() - 7);
    start.setUTCHours(0, 0, 0, 0);
  }

  if (timeframe === "1M") {
    start.setDate(new Date().getDate() - 30);
    start.setUTCHours(0, 0, 0, 0);
  }

  const {
    data: { pairDayDatas },
  } = useQuery(pairDayDatasQuery, {
    variables: {
      pairs: [id],
      date: getUnixTime(startOfDay(subMonths(Date.now(), 1))),
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

  const chartDatas = pairDayDatas
    .filter((d) => d.date > getUnixTime(startOfDay(subMonths(Date.now(), 1))))
    // .filter((pairDayData) => pairDayData.date > start.getTime() / 1000)
    .reduce(
      (previousValue, currentValue) => {
        const time = new Date(currentValue.date * 1e3)
          .toISOString()
          .slice(0, 10);

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

        previousValue["liquidity"].push({
          time,
          value: parseFloat(currentValue.reserveUSD),
        });
        previousValue["volume"].push({
          time,
          value: parseFloat(volumeUSD),
        });
        previousValue["fees"].push({
          time,
          value: parseFloat(currentValue.volumeUSD) * 0.003,
        });
        return previousValue;
      },
      { liquidity: [], volume: [], fees: [] }
    );

  console.log(volumeChange);

  return (
    <Layout>
      <Head>
        <title>
          {pair.token0.symbol}-{pair.token1.symbol} | SushiSwap Analytics
        </title>
      </Head>
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
              {pair.token0.symbol}-{pair.token1.symbol}
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

      <Grid container spacing={3}>
        {chartDatas.liquidity.length > 1 ? (
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              style={{ height: 300, position: "relative" }}
            >
              <AreaChart
                title="Liquidity"
                data={chartDatas.liquidity.reverse()}
                margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                tooltipDisabled
                overlayEnabled
              />
            </Paper>
          </Grid>
        ) : null}

        {chartDatas.liquidity.length > 1 ? (
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              style={{ height: 300, position: "relative" }}
            >
              <BarChart
                title="Volume"
                data={chartDatas.volume.reverse()}
                margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                tooltipDisabled
                overlayEnabled
              />
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
          Pair Balances
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
              key: "name",
              label: "Name",
            },
            { key: "id", label: "Address", maxWidth: "250px" },
            { key: "token0", label: "Token 0", maxWidth: "250px" },
            { key: "token1", label: "Token 1", maxWidth: "250px" },
            { key: "etherscan", label: "Etherscan", align: "right" },
          ]}
          bodyCells={[
            <Typography variant="body2" noWrap>
              {pair.token0.symbol}-{pair.token1.symbol}
            </Typography>,
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
    </Layout>
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
      date: getUnixTime(startOfDay(subMonths(Date.now(), 1))),
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
  const apollo = getApollo();

  const { data } = await apollo.query({
    query: pairIdsQuery,
  });

  // Get the paths we want to pre-render based on pairs
  const paths = data.pairs.map((pair) => ({
    params: { id: pair.id },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: true };

  // return { paths: [], fallback: false };
}

export default PairPage;
