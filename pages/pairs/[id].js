import React, { useEffect, useState } from "react";
import { currencyFormatter, decimalFormatter } from "../../intl";
import {
  ethPriceQuery,
  pairDayDatasQuery,
  pairIdsQuery,
  pairQuery,
  transactionsQuery,
} from "../../operations";

import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Chart from "../../components/Chart";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Head from "next/head";
import Layout from "../../components/Layout";
import Link from "../../components/Link";
import Paper from "@material-ui/core/Paper";
import Percent from "../../components/Percent";
import Router from "next/router";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Transactions from "../../components/Transactions";
import Typography from "@material-ui/core/Typography";
import { getApollo } from "../../apollo";
import { getPair } from "../../api";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import useInterval from "../../hooks/useInterval";
import useMediaQuery from "@material-ui/core/useMediaQuery";
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
}));

function PairPage(props) {
  const classes = useStyles();

  const router = useRouter();

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
    },
    pollInterval: 60000,
  });


  const volumeUSD = pair?.volumeUSD === "0" ? pair?.untrackedVolumeUSD : pair?.volumeUSD
  const oneDayVolumeUSD = pair?.oneDay?.volumeUSD === "0" ? pair?.oneDay?.untrackedVolumeUSD : pair?.oneDay?.volumeUSD
  const twoDayVolumeUSD = pair?.twoDay?.volumeUSD === "0" ? pair?.twoDay?.untrackedVolumeUSD : pair?.twoDay?.volumeUSD


  console.log(pair)

  const volume = volumeUSD - oneDayVolumeUSD;
  const volumeYesterday = oneDayVolumeUSD - twoDayVolumeUSD;
  const volumeChange = ((volume - volumeYesterday) / volumeYesterday) * 100;

  const fees = volume * 0.003;
  const feesYesterday = volumeYesterday * 0.003;

  const chartDatas = pairDayDatas
    .filter((pairDayData) => pairDayData.date > start.getTime() / 1000)
    .reduce(
      (previousValue, currentValue) => {
        const time = new Date(currentValue.date * 1e3)
          .toISOString()
          .slice(0, 10)

        const untrackedVolumeUSD = (currentValue?.token0.derivedETH * currentValue?.volumeToken0) + (currentValue?.token1.derivedETH * currentValue?.volumeToken1) * bundles[0].ethPrice

        // console.log("untrackedVolumeUSD", untrackedVolumeUSD)

        const volumeUSD = currentValue?.volumeUSD === "0" ? untrackedVolumeUSD : currentValue?.volumeUSD;

        previousValue["liquidity"].push({
          time,
          value: parseFloat(currentValue.reserveUSD),
        });
        previousValue["volume"].push({
          time,
          value: parseFloat(volumeUSD),
        });
        previousValue["transactions"].push({
          time,
          value: parseInt(currentValue.txCount),
        });
        return previousValue;
      },
      { liquidity: [], volume: [], transactions: [] }
    );

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
            <AvatarGroup className={classes.avatars}>
              <Avatar
                imgProps={{ loading: "lazy" }}
                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                  pair.token0.id
                )}/logo.png`}
              />
              <Avatar
                imgProps={{ loading: "lazy" }}
                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                  pair.token1.id
                )}/logo.png`}
              />
            </AvatarGroup>
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

      <Grid container className={classes.chips}>
        <Grid item xs={12} sm="auto">
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
              Router.push("/tokens/" + pair.token0.id);
            }}
            label={`1 ${pair.token0.symbol} = ${decimalFormatter.format(
              pair.reserve1 / pair.reserve0
            )} ${pair.token1.symbol} (${currencyFormatter.format(
              pair.token0?.derivedETH * bundles[0].ethPrice
            )})`}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm="auto">
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
              Router.push("/tokens/" + pair.token1.id);
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

      <Typography variant="h6" component="h2" gutterBottom>
        Analytics
      </Typography>

      <Grid container spacing={2} style={{ alignItems: "stretch" }}>
        <Grid item xs={12} sm={4}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Paper variant="outlined" className={classes.paper}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total Liquidity
                </Typography>
                <Typography variant="body2">
                  <Box display="flex">
                    <Typography variant="body2">
                      {currencyFormatter.format(pair?.reserveUSD || 0)}
                    </Typography>
                    <Percent
                      marginLeft={1}
                      percent={(
                        ((pair?.reserveUSD - pair?.oneDay?.reserveUSD) /
                          pair?.oneDay?.reserveUSD) *
                        100
                      ).toFixed(2)}
                    />
                  </Box>
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper variant="outlined" className={classes.paper}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Volume (24h)
                </Typography>

                <Box display="flex">
                  <Typography variant="body2">
                    {currencyFormatter.format(
                      volume || 0
                    )}
                  </Typography>
                  <Percent marginLeft={1} percent={volumeChange} />
                </Box>
              </Paper>
            </Grid>
            <Grid item>
              <Paper variant="outlined" className={classes.paper}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Fees (24h)
                </Typography>
                <Typography variant="body2">
                  <Box display="flex">
                    <Typography variant="body2">
                      {currencyFormatter.format(fees)}
                    </Typography>
                    <Percent
                      marginLeft={1}
                      percent={(
                        ((fees - feesYesterday) / feesYesterday) *
                        100
                      ).toFixed(2)}
                    />
                  </Box>
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper variant="outlined" className={classes.paper}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Pooled Tokens
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    className={classes.avatar}
                    imgProps={{ loading: "lazy" }}
                    src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                      pair.token0.id
                    )}/logo.png`}
                  />
                  <Typography variant="body2" noWrap>
                    {decimalFormatter.format(pair.reserve0)}{" "}
                    {pair.token0.symbol}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Avatar
                    className={classes.avatar}
                    imgProps={{ loading: "lazy" }}
                    src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                      pair.token1.id
                    )}/logo.png`}
                  />
                  <Typography variant="body2" noWrap>
                    {decimalFormatter.format(pair.reserve1)}{" "}
                    {pair.token1.symbol}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Paper
            className={classes.paper}
            variant="outlined"
            component={Box}
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
              <div>
                <ToggleButtonGroup
                  value={type}
                  exclusive
                  onChange={handleType}
                  aria-label="chart type"
                >
                  <ToggleButton value="liquidity" aria-label="liquidity chart">
                    Liquidity
                  </ToggleButton>
                  <ToggleButton value="volume" aria-label="volume chart">
                    Volume
                  </ToggleButton>
                  {/* <ToggleButton
                    value="transactions"
                    aria-label="transactions chart"
                  >
                    Transactions
                  </ToggleButton> */}
                </ToggleButtonGroup>
              </div>
              <div>
                <ToggleButtonGroup
                  value={timeframe}
                  exclusive
                  onChange={handleTimeframe}
                  aria-label="timeframe"
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
              </div>
            </Box>
            <Chart data={chartDatas[type].reverse()} type={chartType} />
          </Paper>
        </Grid>
      </Grid>

      <Box my={4}>
        <Typography variant="h6" component="h2" gutterBottom>
          Information
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="pair information">
            <TableHead>
              <TableRow>
                <TableCell key="name">Name</TableCell>
                <TableCell key="address">Address</TableCell>
                <TableCell key="token0">Token0</TableCell>
                <TableCell key="token1">Token1</TableCell>
                <TableCell key="etherscan" align="right">
                  Etherscan
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key={pair.id}>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" noWrap>
                    {pair.token0.symbol}-{pair.token1.symbol}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {pair.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {pair.token0.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {pair.token1.id}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Link href={`https://etherscan.io/address/${pair.id}`}>
                    View
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
  // Call an external API endpoint to get posts
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
  return { paths, fallback: false };

  // return { paths: [], fallback: false };
}

export default PairPage;
