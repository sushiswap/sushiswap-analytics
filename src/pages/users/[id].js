import { AppShell, KPI, Link, PageHeader, PairIcon } from "app/components";
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
  blockQuery,
  currencyFormatter,
  decimalFormatter,
  ethPriceQuery,
  getApollo,
  getBarUser,
  getEthPrice,
  getLatestBlock,
  getPairs,
  getPoolUser,
  getSushiToken,
  getToken,
  getUser,
  latestBlockQuery,
  lockupUserQuery,
  pairSubsetQuery,
  pairsQuery,
  poolUserQuery,
  tokenQuery,
  useInterval,
  userIdsQuery,
  userQuery,
} from "app/core";
import { getUnixTime, startOfMinute, startOfSecond } from "date-fns";

import { AvatarGroup } from "@material-ui/lab";
import Head from "next/head";
import { POOL_DENY } from "app/core/constants";
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
    return <AppShell />;
  }

  const classes = useStyles();

  const { id } = router.query;

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  const { data: barData } = useQuery(barUserQuery, {
    variables: {
      id: id.toLowerCase(),
    },
    context: {
      clientName: "bar",
    },
  });

  console.log(barData);

  const { data: poolData } = useQuery(poolUserQuery, {
    variables: {
      address: id.toLowerCase(),
    },
    context: {
      clientName: "masterchef",
    },
  });

  const { data: lockupData } = useQuery(lockupUserQuery, {
    variables: {
      address: id.toLowerCase(),
    },
    context: {
      clientName: "lockup",
    },
  });

  const poolUsers = poolData.users.filter(
    (user) =>
      user.pool &&
      !POOL_DENY.includes(user.pool.id) &&
      user.pool.allocPoint !== "0"
  );

  const {
    data: { token },
  } = useQuery(tokenQuery, {
    variables: {
      id: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    },
  });

  // const pairAddresses = poolData?.users.map((user) => user.pool.pair);

  // console.log("pairAddresses", pairAddresses);

  const {
    data: { pairs },
  } = useQuery(pairsQuery);

  // console.log("pairs", pairs);

  // useInterval(
  //   () =>
  //     Promise.all([
  //       getPairs,
  //       getSushiToken,
  //       getPoolUser(id.toLowerCase()),
  //       getBarUser(id.toLocaleLowerCase()),
  //       getEthPrice,
  //     ]),
  //   60000
  // );

  const sushiPrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  const xSushi = parseFloat(barData?.user?.xSushi);

  const barPending =
    (xSushi * parseFloat(barData?.user?.bar?.sushiStaked)) /
    parseFloat(barData?.user?.bar?.totalSupply);

  const xSushiTransfered =
    barData?.user?.xSushiIn > barData?.user?.xSushiOut
      ? parseFloat(barData?.user?.xSushiIn) -
        parseFloat(barData?.user?.xSushiOut)
      : parseFloat(barData?.user?.xSushiOut) -
        parseFloat(barData?.user?.xSushiIn);

  // const xSushiTransfered = Math.max(
  //   0,
  //   parseFloat(barData?.user?.xSushiIn) - parseFloat(barData?.user?.xSushiOut),
  //   parseFloat(barData?.user?.xSushiOut) - parseFloat(barData?.user?.xSushiIn)
  // );

  const stakedTransferProportion = parseFloat(
    (barData?.user?.sushiStaked / (xSushi + xSushiTransfered)) *
      xSushiTransfered
  );

  const stakedUSDTransferProportion = parseFloat(
    (barData?.user?.sushiStakedUSD / (xSushi + xSushiTransfered)) *
      xSushiTransfered
  );

  // const barHarvested = barData?.user?.sushiHarvested + barData?.user?.sushiOut;

  const barStaked = barData?.user?.sushiStaked;

  const barStakedUSD = barData?.user?.sushiStakedUSD;

  // const barStaked = barData?.user?.sushiStaked - stakedTransferProportion;

  // const barStakedUSD =
  //   barData?.user?.sushiStakedUSD - stakedUSDTransferProportion;

  const farmingStaked = poolUsers?.reduce((previousValue, currentValue) => {
    // console.log(currentValue);
    const pair = pairs.find((pair) => pair.id == currentValue?.pool?.pair);
    if (!pair) {
      return previousValue;
    }
    // console.log(currentValue?.pool?.pair);
    const share = currentValue.amount / currentValue?.pool?.balance;
    return previousValue + pair.reserveUSD * share;
  }, 0);

  const farmingPending =
    poolUsers?.reduce((previousValue, currentValue) => {
      return (
        previousValue +
        ((currentValue.amount * currentValue.pool.accSushiPerShare) / 1e12 -
          currentValue.rewardDebt) /
          1e18
      );
    }, 0) * sushiPrice;

  // console.log({ barData, poolData });

  const poolInvestments = poolData?.users.reduce(
    (previousValue, currentValue) => {
      return parseFloat(previousValue) + parseFloat(currentValue.entryUSD);
    },
    0
  );

  const originalInvestments =
    parseFloat(barData?.user?.sushiStakedUSD) + parseFloat(poolInvestments);

  const barPendingUSD = barPending > 0 ? barPending * sushiPrice : 0;

  const barRoiSushi =
    barPending -
    (parseFloat(barData?.user?.sushiStaked) -
      parseFloat(barData?.user?.sushiHarvested) +
      parseFloat(barData?.user?.sushiIn) -
      parseFloat(barData?.user?.sushiOut));

  const barRoiUSD =
    barPendingUSD -
    (parseFloat(barData?.user?.sushiStakedUSD) -
      parseFloat(barData?.user?.sushiHarvestedUSD) +
      parseFloat(barData?.user?.usdIn) -
      parseFloat(barData?.user?.usdOut));

  const { data: blocksData } = useQuery(latestBlockQuery, {
    context: {
      clientName: "blocklytics",
    },
  });

  const blockDifference =
    parseInt(blocksData?.blocks[0].number) -
    parseInt(barData.user.createdAtBlock);

  const barRoiDailySushi = (barRoiSushi / blockDifference) * 6440;

  const investments = farmingStaked + barPendingUSD + farmingPending;

  return (
    <AppShell>
      <Head>
        <title>User {id} | SushiSwap Analytics</title>
      </Head>

      <PageHeader>
        <Typography variant="h5" component="h1" gutterBottom noWrap>
          Portfolio
        </Typography>
        <Typography gutterBottom noWrap>
          Address {id}
        </Typography>
      </PageHeader>

      {/* <pre>{JSON.stringify(data?.user, null, 2)}</pre> */}

      <Box marginBottom={4}>
        <Grid container spacing={2}>
          <Grid item xs>
            <KPI
              title="Original Investments"
              value={currencyFormatter.format(originalInvestments)}
            />
          </Grid>
          <Grid item xs>
            <KPI
              title="Investments"
              value={currencyFormatter.format(investments)}
            />
          </Grid>
          <Grid item xs>
            <KPI
              title="Profit/Loss"
              value={currencyFormatter.format(
                investments - originalInvestments
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Box my={4}>
        <Typography
          variant="h6"
          component="h2"
          color="textSecondary"
          gutterBottom
        >
          Bar
        </Typography>
        <Paper variant="outlined">
          {!barData?.user?.bar ? (
            <Typography>Address isn't in the bar...</Typography>
          ) : (
            <TableContainer variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="token">
                      <Typography variant="subtitle2" noWrap>
                        Token
                      </Typography>
                    </TableCell>
                    <TableCell key="staked" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Staked
                      </Typography>
                    </TableCell>
                    <TableCell key="xSushi" align="right">
                      <Typography variant="subtitle2" noWrap>
                        xSushi
                      </Typography>
                    </TableCell>
                    <TableCell key="balance" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Pending Sushi
                      </Typography>
                    </TableCell>
                    <TableCell key="barRoiDaily" align="right">
                      <Typography variant="subtitle2" noWrap>
                        ROI (Daily)
                      </Typography>
                    </TableCell>
                    <TableCell key="barRoiYearly" align="right">
                      <Typography variant="subtitle2" noWrap>
                        ROI (Yearly)
                      </Typography>
                    </TableCell>
                    <TableCell key="barRoiSushi" align="right">
                      <Typography variant="subtitle2" noWrap>
                        ROI (Sushi)
                      </Typography>
                    </TableCell>
                    <TableCell key="barRoiUSD" align="right">
                      <Typography variant="subtitle2" noWrap>
                        ROI (USD)
                      </Typography>
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
                          href={`/tokens/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2`}
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
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(barStaked)} SUSHI (
                        {currencyFormatter.format(barStakedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {Number(xSushi.toFixed(2)).toLocaleString()} XSUSHI
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {Number(barPending.toFixed(2)).toLocaleString()} (
                        {currencyFormatter.format(sushiPrice * barPending)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(barRoiDailySushi)} (
                        {currencyFormatter.format(
                          barRoiDailySushi * sushiPrice
                        )}
                        )
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(barRoiDailySushi * 365)} (
                        {currencyFormatter.format(
                          barRoiDailySushi * 365 * sushiPrice
                        )}
                        )
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {decimalFormatter.format(barRoiSushi)}{" "}
                      {/* {Number(
                        barStaked - (barPending + barData?.user?.sushiHarvested)
                      ).toFixed(2)}{" "} */}
                      ({currencyFormatter.format(barRoiSushi * sushiPrice)})
                      {/* const barRoiSushi =
                      barData?.user?.sushiHarvested -
                      barData?.user?.sushiStaked -
                      barPending -
                      barData?.user?.sushiOut; */}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(barRoiUSD)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Box my={4}>
        <Typography
          variant="h6"
          component="h2"
          color="textSecondary"
          gutterBottom
        >
          Pools
        </Typography>

        <Paper variant="outlined">
          {!poolData?.users.length ? (
            <Typography>Address isn't farming...</Typography>
          ) : (
            <TableContainer variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="pool">Pool</TableCell>
                    <TableCell key="slp" align="right">
                      <Typography variant="subtitle2" noWrap>
                        SLP
                      </Typography>
                    </TableCell>
                    <TableCell key="balance" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Balance
                      </Typography>
                    </TableCell>
                    <TableCell key="value" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Value
                      </Typography>
                    </TableCell>

                    <TableCell key="pendingSushi" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Pending Sushi
                      </Typography>
                    </TableCell>
                    <TableCell key="sushiHarvested" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Sushi Rewarded
                      </Typography>
                    </TableCell>
                    <TableCell key="sushiLocked" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Sushi Locked
                      </Typography>
                    </TableCell>
                    <TableCell key="entryUSD" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Entries
                      </Typography>
                    </TableCell>
                    <TableCell key="exitUSD" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Exits
                      </Typography>
                    </TableCell>
                    <TableCell key="pl" align="right">
                      <Typography variant="subtitle2" noWrap>
                        Profit/Loss
                      </Typography>
                    </TableCell>
                    {/* <TableCell key="apy" align="right">
                      APY
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {poolUsers.map((user) => {
                    const pair = pairs.find(
                      (pair) => pair.id == user.pool.pair
                    );
                    const slp = Number(user.amount / 1e18);

                    const share = user.amount / user.pool.balance;

                    const token0 = pair.reserve0 * share;
                    const token1 = pair.reserve1 * share;

                    const pendingSushi =
                      ((user.amount * user.pool.accSushiPerShare) / 1e12 -
                        user.rewardDebt) /
                      1e18;
                    // user.amount.mul(accSushiPerShare).div(1e12).sub(user.rewardDebt);

                    // console.log(
                    //   user,
                    //   user.entryUSD,
                    //   user.exitUSD,
                    //   pendingSushi * sushiPrice
                    // );

                    const lockupUser = lockupData?.users.find(
                      (u) => u.pool.id === user.pool.id
                    );

                    const sushiAtLockup = lockupUser
                      ? ((lockupUser.amount *
                          lockupUser.pool.accSushiPerShare) /
                          1e12 -
                          lockupUser.rewardDebt) /
                        1e18
                      : 0;

                    const sushiLocked =
                      (parseFloat(user.sushiHarvestedSinceLockup) +
                        pendingSushi -
                        sushiAtLockup) *
                      2;

                    const sushiLockedUSD = sushiLocked * sushiPrice;
                    return (
                      <TableRow key={user.pool.id}>
                        <TableCell component="th" scope="row">
                          <Box display="flex" alignItems="center">
                            <PairIcon
                              base={pair.token0.id}
                              quote={pair.token1.id}
                            />
                            <Link
                              href={`/pools/${user.pool.id}`}
                              variant="body2"
                              noWrap
                            >
                              {pair.token0.symbol}-{pair.token1.symbol}
                            </Link>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {decimalFormatter.format(slp)} SLP
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {decimalFormatter.format(token0)}{" "}
                            {pair.token0.symbol} +{" "}
                            {decimalFormatter.format(token1)}{" "}
                            {pair.token1.symbol}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {currencyFormatter.format(pair.reserveUSD * share)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {decimalFormatter.format(pendingSushi)} (
                            {currencyFormatter.format(
                              pendingSushi * sushiPrice
                            )}
                            )
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {decimalFormatter.format(user.sushiHarvested)} (
                            {currencyFormatter.format(user.sushiHarvestedUSD)})
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {decimalFormatter.format(sushiLocked)} (
                            {currencyFormatter.format(sushiLockedUSD)})
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {currencyFormatter.format(user.entryUSD)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {currencyFormatter.format(user.exitUSD)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {currencyFormatter.format(
                              parseFloat(pair.reserveUSD * share) +
                                parseFloat(user.exitUSD) +
                                parseFloat(user.sushiHarvestedUSD) +
                                parseFloat(pendingSushi * sushiPrice) -
                                parseFloat(user.entryUSD)
                            )}
                          </Typography>
                        </TableCell>
                        {/* <TableCell align="right">23.76%</TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();

  await getEthPrice(client);

  await getSushiToken(client);

  await getBarUser(id.toLowerCase(), client);

  await client.query({
    query: lockupUserQuery,
    variables: {
      address: id.toLowerCase(),
    },
    context: {
      clientName: "lockup",
    },
  });

  await getPoolUser(id.toLowerCase(), client);

  await getPairs(client);

  await getLatestBlock(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export default UserPage;
