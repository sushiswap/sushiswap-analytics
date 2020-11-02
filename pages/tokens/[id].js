import {
  ethPriceQuery,
  oneDayEthPriceQuery,
  tokenDayDatasQuery,
  tokenIdsQuery,
  tokenPairsQuery,
  tokenQuery,
  transactionsQuery,
} from "../../operations";
import {
  getOneDayBlock,
  getOneDayEthPrice,
  getToken,
  getTokenPairs,
} from "api";
import { useEffect, useState } from "react";

import Avatar from "../../components/Avatar";
import Chart from "../../components/Chart";
import Head from "next/head";
import Layout from "../../components/Layout";
import Link from "../../components/Link";
import PairTable from "../../components/PairTable";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import Transactions from "app/components/Transactions";
import {
  makeStyles,
  Box,
  Grid,
  Button,
  Paper,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  TableCell,
  TableBody,
  Table,
} from "@material-ui/core";
import { currencyFormatter } from "../../intl";
import { getApollo } from "../../apollo";
import { toChecksumAddress } from "web3-utils";
import useInterval from "../../hooks/useInterval";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import SingleGridItem from "../../components/SingleGridItem";

const useStyles = makeStyles((theme) => ({
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
    marginRight: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

function TokenPage() {
  const classes = useStyles();

  const router = useRouter();

  const { id } = router.query;

  const [type, setType] = useState("liquidity");
  const [chartType, setChartType] = useState("area");
  const [timeframe, setTimeframe] = useState("ALL");

  function handleTimeframe(event, timeframe) {
    if (timeframe) {
      setTimeframe(timeframe);
    }
  }

  function handleType(event, type) {
    if (type) {
      if (type === "liquidity") {
        setChartType("area");
      }
      if (type === "volume") {
        setChartType("histogram");
      }
      if (type === "price") {
        setChartType("area");
      }
      setType(type);
    }
  }

  const {
    data: { token },
  } = useQuery(tokenQuery, {
    variables: { id },
  });

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  const { data: oneDayEthPriceData } = useQuery(oneDayEthPriceQuery);

  useInterval(async () => {
    await getToken(id);
    await getOneDayEthPrice();
  }, 60000);

  const start = new Date();

  if (timeframe === "ALL") {
    start.setTime(628021800000);
  }

  if (timeframe === "1W") {
    start.setDate(start.getDate() - 7);
    start.setUTCHours(0, 0, 0, 0);
  }

  if (timeframe === "1M") {
    start.setDate(new Date().getDate() - 30);
    start.setUTCHours(0, 0, 0, 0);
  }

  const {
    data: { tokenDayDatas },
  } = useQuery(tokenDayDatasQuery, {
    variables: {
      tokens: [id],
    },
    pollInterval: 60000,
  });

  const {
    data: { pairs0, pairs1 },
  } = useQuery(tokenPairsQuery, {
    variables: { id },
  });

  const pairs = [...pairs0, ...pairs1];

  const { data: transactions } = useQuery(transactionsQuery, {
    variables: {
      pairAddresses: pairs.map((pair) => pair.id).sort(),
    },
    pollInterval: 60000,
  });

  const chartDatas = tokenDayDatas
    .filter((tokenDayData) => tokenDayData.date > start.getTime() / 1000)
    .reduce(
      (previousValue, currentValue) => {
        const time = new Date(currentValue.date * 1e3)
          .toISOString()
          .slice(0, 10);

        previousValue["liquidity"].push({
          time,
          value: parseFloat(currentValue.liquidityUSD),
        });
        previousValue["volume"].push({
          time,
          value: parseFloat(currentValue.volumeUSD),
        });
        previousValue["price"].push({
          time,
          value: parseFloat(currentValue.priceUSD),
        });
        return previousValue;
      },
      { liquidity: [], volume: [], price: [] }
    );

  const totalLiquidityUSD =
    parseFloat(token?.liquidity) *
    parseFloat(token?.derivedETH) *
    parseFloat(bundles[0].ethPrice);

  const totalLiquidityUSDYesterday =
    parseFloat(token.oneDay?.liquidity) *
    parseFloat(token.oneDay?.derivedETH) *
    parseFloat(oneDayEthPriceData?.ethPrice);

  const price = parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  const priceYesterday =
    parseFloat(token.oneDay?.derivedETH) *
    parseFloat(oneDayEthPriceData?.ethPrice);

  const priceChange = ((price - priceYesterday) / priceYesterday) * 100;

  const volume = token?.volumeUSD - token?.oneDay?.volumeUSD;
  const volumeYesterday = token?.oneDay?.volumeUSD - token?.twoDay?.volumeUSD;

  const txCount = token?.txCount - token?.oneDay?.txCount;
  const txCountYesterday = token?.oneDay?.txCount - token?.twoDay?.txCount;
  return (
    <Layout>
      <Head>
        <title>
          {currencyFormatter.format(price || 0)} | {token.symbol} | SushiSwap
          Analytics
        </title>
      </Head>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        className={classes.top}
      >
        <Grid item xs={12} sm="auto" className={classes.title}>
          <Box display="flex" alignItems="center">
            <Avatar className={classes.avatar} src={token.id} />
            <Typography variant="h5" component="h1" noWrap>
              {token.name} ({token.symbol})
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm="auto" className={classes.links}>
          <Link
            href={`https://exchange.sushiswapclassic.org/#/add/${token.id}/ETH`}
            target="_blank"
            variant="body1"
          >
            Add Liquidity
          </Link>
          <Link
            href={`https://exchange.sushiswapclassic.org/#/swap?inputCurrency=${token.id}`}
            target="_blank"
            variant="body1"
          >
            Trade
          </Link>
        </Grid>
      </Grid>

      <Typography variant="h6" component="h2" gutterBottom>
        Analytics
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Grid container direction="column" spacing={2}>
            <SingleGridItem
              header="Price"
              data={price}
              percentage={priceChange}
            />
            <SingleGridItem
              header="Liquidity"
              data={totalLiquidityUSD}
              percentage={(
                ((totalLiquidityUSD - totalLiquidityUSDYesterday) /
                  totalLiquidityUSDYesterday) *
                100
              ).toFixed(2)}
            />
            <SingleGridItem
              header="Volume (24h)"
              data={volume}
              percentage={(
                ((volume - volumeYesterday) / volumeYesterday) *
                100
              ).toFixed(2)}
            />
            <SingleGridItem
              header="Transactions (24h)"
              data={txCount.toLocaleString()}
              percentage={(
                ((txCount - txCountYesterday) / txCountYesterday) *
                100
              ).toFixed(2)}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box
            component={Paper}
            className={classes.paper}
            variant="outlined"
            display="flex"
            flexDirection="column"
            height="100%"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={handleType}
                aria-label="chart type"
                variant="text"
              >
                <ToggleButton value="liquidity" aria-label="liquidity chart">
                  Liquidity
                </ToggleButton>
                <ToggleButton value="volume" aria-label="volume chart">
                  Volume
                </ToggleButton>
                <ToggleButton value="price" aria-label="price chart">
                  Price
                </ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup
                value={timeframe}
                exclusive
                onChange={handleTimeframe}
                aria-label="timeframe"
                variant="text"
              >
                <ToggleButton value="1W" aria-label="1W">
                  1W
                </ToggleButton>
                <ToggleButton value="1M" aria-label="1M">
                  1M
                </ToggleButton>
                <ToggleButton value="ALL" aria-label="ALL">
                  ALL
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Chart data={chartDatas[type].reverse()} type={chartType} />
          </Box>
        </Grid>
      </Grid>

      <Box my={4}>
        <Typography variant="h6" component="h2" gutterBottom>
          Information
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="token information">
            <TableHead>
              <TableRow>
                <TableCell key="name">Name</TableCell>
                <TableCell key="symbol">Symbol</TableCell>
                <TableCell key="address">Address</TableCell>
                <TableCell key="etherscan" align="right">
                  Etherscan
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key={token.id}>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" noWrap>
                    {token.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {token.symbol}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {token.id}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Link href={`https://etherscan.io/address/${token.id}`}>
                    View
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="h6" component="h2" gutterBottom>
        Pairs
      </Typography>
      <PairTable pairs={pairs} />

      <Transactions transactions={transactions} txCount={token.txCount} />
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();

  await client.query({
    query: ethPriceQuery,
  });

  await getToken(id, client);

  await client.query({
    query: tokenDayDatasQuery,
    variables: {
      tokens: [id],
    },
  });

  const { pairs0, pairs1 } = await getTokenPairs(id, client);

  const pairAddresses = [
    ...pairs0.map((pair) => pair.id),
    ...pairs1.map((pair) => pair.id),
  ].sort();

  // Transactions
  await client.query({
    query: transactionsQuery,
    variables: {
      pairAddresses,
    },
  });

  await getOneDayEthPrice(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const apollo = getApollo();

  const { data } = await apollo.query({
    query: tokenIdsQuery,
  });

  // Get the paths we want to pre-render based on tokens
  const paths = data.tokens.map(({ id }) => ({
    params: { id },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.

  return { paths, fallback: false };

  // return { paths: [], fallback: false };
}

export default TokenPage;
