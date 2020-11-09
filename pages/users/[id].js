import {
  Avatar,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  barUserQuery,
  ethPriceQuery,
  pairsQuery,
  tokenQuery,
  userIdsQuery,
  userQuery,
} from "../../operations";
import { getBarUser, getPairs, getToken, getUser } from "../../api";

import { AvatarGroup } from "@material-ui/lab";
import Head from "next/head";
import Layout from "../../components/Layout";
import Link from "../../components/Link";
import { currencyFormatter } from "../../intl";
import { getApollo } from "../../apollo";
import { toChecksumAddress } from "web3-utils";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
  title: {
    fontSize: 14,
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

function UserPage() {
  const router = useRouter();

  if (router.isFallback) {
    return <Layout>Generating portfolio...</Layout>;
  }

  const classes = useStyles();

  const { id } = router.query;

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  // const { data: exchangeUser } = useQuery(userQuery, {
  //   variables: {
  //     id: id.toLowerCase(),
  //   },
  //   pollInterval: 60000,
  // });

  const { data: barData, error: barDataError } = useQuery(barUserQuery, {
    variables: {
      id: id.toLowerCase(),
    },
    // fetchPolicy: "no-cache",
    context: {
      clientName: "bar",
    },
  });

  const {
    data: { token },
  } = useQuery(tokenQuery, {
    variables: {
      id: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    },
    pollInterval: 60000,
  });

  const {
    data: { pairs },
  } = useQuery(pairsQuery, {
    pollInterval: 60000,
  });

  // console.log("data", data);
  // console.log("bar data", barData);
  // console.log("error", error)

  const sushiPrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  const xSushi = Number(barData?.user?.xSushi);

  const barPending =
    (xSushi * barData?.user?.bar?.sushiStaked) /
    barData?.user?.bar?.totalSupply;

  const xSushiTransfered = barData?.user?.xSushiOut - barData?.user?.xSushiIn;

  // console.log("xSushiTransfered", xSushiTransfered);

  const stakedTransferProportion =
    (barData?.user?.sushiStaked / (xSushi + xSushiTransfered)) *
    xSushiTransfered;

  const stakedUSDTransferProportion =
    (barData?.user?.sushiStakedUSD / (xSushi + xSushiTransfered)) *
    xSushiTransfered;

  // console.log("stakedTransferProportion", stakedTransferProportion);

  const barStaked =
    barData?.user?.sushiStaked -
    barData?.user?.sushiHarvested -
    stakedTransferProportion;

  const barStakedUSD =
    barData?.user?.sushiStakedUSD -
    barData?.user?.sushiHarvestedUSD -
    stakedUSDTransferProportion;

  //  - (barData?.user?.usdOut - barData?.user?.usdIn);

  // const farmingStaked = data?.user?.pools.reduce(
  //   (previousValue, currentValue) => {
  //     const pair = pairs.find((pair) => pair.id == currentValue.pool.lpToken);
  //     const share = currentValue.amount / currentValue.pool.totalSupply;
  //     return previousValue + pair.reserveUSD * share;
  //   },
  //   0
  // );

  // const farmingPending =
  //   data?.user?.pools?.reduce((previousValue, currentValue) => {
  //     return (
  //       previousValue +
  //       ((currentValue.amount * currentValue.pool.accSushiPerShare) / 1e12 -
  //         currentValue.rewardDebt) /
  //         1e18
  //     );
  //   }, 0) * sushiPrice;

  return (
    <Layout>
      <Head>
        <title>User {id} | SushiSwap Analytics</title>
      </Head>

      <Box marginBottom={4}>
        {/* <Typography variant="h5" component="h1" gutterBottom noWrap>
          Portfolio
        </Typography> */}
        <Typography gutterBottom noWrap>
          Address {id}
        </Typography>
      </Box>

      {/* <pre>{JSON.stringify(data?.user, null, 2)}</pre> */}

      {/* <Box marginBottom={4}>
        <Grid container spacing={2}>
          <Grid item xs>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Investments
            </Typography>
            <Typography variant="h5" component="h2">
              {currencyFormatter.format(
                farmingStaked + barPending * sushiPrice + farmingPending
              )}
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Original Investments
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Profit/Loss
            </Typography>
          </Grid>
        </Grid>
      </Box> */}

      <Grid container direction="column" spacing={4}>
        {/* <Grid item>
          <Typography
            variant="h6"
            component="h2"
            color="textSecondary"
            gutterBottom
          >
            Pools
          </Typography>

          {!data.user.pools.length ? (
            <Typography>Address isn't farming...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="pool">Pool</TableCell>
                    <TableCell key="slp" align="right">
                      SLP
                    </TableCell>
                    <TableCell key="balance" align="right">
                      Balance
                    </TableCell>
                    <TableCell key="value" align="right">
                      Value
                    </TableCell>
                    <TableCell key="pendingSushi" align="right">
                      Pending Sushi
                    </TableCell>
                    <TableCell key="apy" align="right">
                      APY
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.user.pools.map((pool) => {
                    const pair = pairs.find(
                      (pair) => pair.id == pool.pool.lpToken
                    );
                    const slp = Number(pool.amount / 1e18);
                    const share = pool.amount / pool.pool.totalSupply;

                    const token0 = pair.reserve0 * share;
                    const token1 = pair.reserve1 * share;

                    const pendingSushi =
                      ((pool.amount * pool.pool.accSushiPerShare) / 1e12 -
                        pool.rewardDebt) /
                      1e18;

                    return (
                      <TableRow key="12">
                        <TableCell component="th" scope="row">
                          <Box display="flex" alignItems="center">
                            <AvatarGroup className={classes.avatar}>
                              <Avatar
                                imgProps={{ loading: "lazy" }}
                                alt="SUSHI"
                                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                                  "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
                                )}/logo.png`}
                              />
                              <Avatar
                                imgProps={{ loading: "lazy" }}
                                alt="WETH"
                                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                                  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
                                )}/logo.png`}
                              />
                            </AvatarGroup>
                            <Link
                              href={`/pairs/0x795065dcc9f64b5614c407a6efdc400da6221fb0`}
                              variant="body2"
                              noWrap
                            >
                              {pair.token0.symbol} + {pair.token1.symbol}
                            </Link>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {Number(slp.toFixed(2)).toLocaleString()} SLP
                        </TableCell>
                        <TableCell align="right">
                          {Number(token0.toFixed(2)).toLocaleString()}{" "}
                          {pair.token0.symbol} +{" "}
                          {Number(token1.toFixed(2)).toLocaleString()}{" "}
                          {pair.token1.symbol}
                        </TableCell>
                        <TableCell align="right">
                          {currencyFormatter.format(pair.reserveUSD * share)}
                        </TableCell>
                        <TableCell align="right">
                          {Number(pendingSushi.toFixed(2)).toLocaleString()} (
                          {currencyFormatter.format(pendingSushi * sushiPrice)})
                        </TableCell>
                        <TableCell align="right">23.76%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid> */}
        <Grid item>
          <Typography
            variant="h6"
            component="h2"
            color="textSecondary"
            gutterBottom
          >
            Bar
          </Typography>
          {!barData.user.bar ? (
            <Typography>Address isn't in the bar...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="token">Token</TableCell>
                    <TableCell key="staked" align="right">
                      Staked
                    </TableCell>
                    <TableCell key="xSushi" align="right">
                      xSushi
                    </TableCell>
                    <TableCell key="balance" align="right">
                      Pending Sushi
                    </TableCell>
                    <TableCell key="apy" align="right">
                      ROI (Sushi)
                    </TableCell>
                    <TableCell key="apy" align="right">
                      ROI (USD)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key="12">
                    <TableCell component="th" scope="row">
                      <Box display="flex" alignItems="center">
                        <Avatar
                          className={classes.avatar}
                          imgProps={{ loading: "lazy" }}
                          alt="SUSHI"
                          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                            "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
                          )}/logo.png`}
                        />
                        <Link
                          href={`/token/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2`}
                          variant="body2"
                          noWrap
                        >
                          SUSHI
                        </Link>
                        {/* <Link href={`/tokens/0x8798249c2e607446efb7ad49ec89dd1865ff4272`} variant="body2" noWrap>
                        xSUSHI
                      </Link> */}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {Number(barStaked.toFixed(2)).toLocaleString()} SUSHI (
                      {currencyFormatter.format(barStakedUSD)})
                    </TableCell>
                    <TableCell align="right">
                      {Number(xSushi.toFixed(2)).toLocaleString()} XSUSHI
                    </TableCell>
                    <TableCell align="right">
                      {Number(barPending.toFixed(2)).toLocaleString()} (
                      {currencyFormatter.format(sushiPrice * barPending)})
                    </TableCell>
                    <TableCell align="right">
                      {Number(barPending - barStaked).toFixed(2)} (
                      {currencyFormatter.format(
                        Number(barPending - barStaked) * sushiPrice
                      )}
                      )
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(
                        sushiPrice * barPending +
                          barData?.user?.sushiHarvestedUSD -
                          barStakedUSD
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();

  await client.query({
    query: ethPriceQuery,
  });

  // const { user } = await getUser(id.toLowerCase(), client);

  // console.log("server user", user);

  await getPairs(client);

  await getToken("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", client);

  const { user: barUser } = await getBarUser(id.toLowerCase(), client);

  // console.log("server bar user", barUser);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  const client = getApollo();

  // const { data } = await client.query({
  //   query: userIdsQuery,
  // });

  // const paths = data.users.map(({ id }) => ({
  //   params: { id },
  // }));

  return { paths: [], fallback: true };
}

export default UserPage;
