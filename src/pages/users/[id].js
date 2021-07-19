import { AppShell, KPI, Link, Loading, PageHeader, PairIcon } from "app/components";
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
  formatCurrency,
  getApollo,
  getBarUser,
  getEthPrice,
  getLatestBlock,
  getPairs,
  getPoolUser,
  getBoneToken,
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
  buryShibUserQuery, 
  buryLeashUserQuery, 
  buryBoneUserQuery, 
  getBuryBoneUser,
  getBuryShibUser,
  getBuryLeashUser
} from "app/core";
import { getUnixTime, startOfMinute, startOfSecond } from "date-fns";

import { AvatarGroup } from "@material-ui/lab";
import Head from "next/head";
import {BONE_TOKEN_ADDRESS, SHIB_TOKEN_ADDRESS, LEASH_TOKEN_ADDRESS, POOL_DENY} from "app/core/constants";
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
    return <Loading />;
  }
  const classes = useStyles();

  const id = router && router.query && router.query.id && router.query.id.toLowerCase();

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  const { data: buryShibData } = useQuery(buryShibUserQuery, {
    variables: {
      id: id.toLowerCase(),
    },
    context: {
      clientName: "buryShib",
    },
  });

  const { data: buryBoneData } = useQuery(buryBoneUserQuery, {
    variables: {
      id: id.toLowerCase(),
    },
    context: {
      clientName: "buryBone",
    },
  });
  const { data: buryLeashData } = useQuery(buryLeashUserQuery, {
    variables: {
      id: id.toLowerCase(),
    },
    context: {
      clientName: "buryLeash",
    },
  });


  const { data: poolData } = useQuery(poolUserQuery, {
    variables: {
      address: id.toLowerCase(),
    },
    context: {
      clientName: "masterchef",
    },
  });

  const {
    data: { token },
  } = useQuery(tokenQuery, {
    variables: {
      id: BONE_TOKEN_ADDRESS,
    },
  });

  // console.log("token:: ", token)

  const shibTokenData = useQuery(tokenQuery, {
    variables: {
      id: SHIB_TOKEN_ADDRESS,
    },
  });

  const leashTokenData = useQuery(tokenQuery, {
    variables: {
      id: LEASH_TOKEN_ADDRESS,
    },
  });

  const {
    data: { pairs },
  } = useQuery(pairsQuery);

  const poolUsers = poolData.users.filter(
    (user) =>
      user.pool &&
      !POOL_DENY.includes(user.pool.id) &&
      user.pool.allocPoint !== "0" &&
      pairs.find((pair) => pair?.id === user.pool.pair)
  );

  // useInterval(
  //   () =>
  //     Promise.all([
  //       getPairs,
  //       getBoneToken,
  //       getPoolUser(id.toLowerCase()),
  //       getBarUser(id.toLocaleLowerCase()),
  //       getEthPrice,
  //     ]),
  //   60000
  // );

  const bonePrice =
    parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);
  const shibPrice =
    parseFloat(shibTokenData?.data?.token?.derivedETH) * parseFloat(bundles[0].ethPrice);
  const leashPrice =
    parseFloat(leashTokenData?.data?.token.derivedETH) * parseFloat(bundles[0].ethPrice);

  const { data: blocksData } = useQuery(latestBlockQuery, {
    context: {
      clientName: "blocklytics",
    },
  });

  // BAR - Bury Bone
  const tBone = parseFloat(buryBoneData?.user?.tBone);

  const buryBonePending =
    (tBone * parseFloat(buryBoneData?.user?.buries?.boneStaked)) /
    parseFloat(buryBoneData?.user?.buries?.totalSupply);

  const tBoneTransfered =
  buryBoneData?.user?.tBoneIn > buryBoneData?.user?.tBoneOut
      ? parseFloat(buryBoneData?.user?.tBoneIn) -
        parseFloat(buryBoneData?.user?.tBoneOut)
      : parseFloat(buryBoneData?.user?.tBoneOut) -
        parseFloat(buryBoneData?.user?.tBoneIn);

  const buryBoneStaked = buryBoneData?.user?.boneStaked;

  const buryBoneStakedUSD = buryBoneData?.user?.boneStakedUSD;

  const buryBoneHarvested = buryBoneData?.user?.boneHarvested;
  const buryBoneHarvestedUSD = buryBoneData?.user?.boneHarvestedUSD;

  const buryBonePendingUSD = buryBonePending > 0 ? buryBonePending * bonePrice : 0;

  const buryBoneRoiBone =
    buryBonePending -
    (parseFloat(buryBoneData?.user?.boneStaked) -
      parseFloat(buryBoneData?.user?.boneHarvested) +
      parseFloat(buryBoneData?.user?.boneIn) -
      parseFloat(buryBoneData?.user?.boneOut));

  const buryBoneRoiUSD =
    buryBonePendingUSD -
    (parseFloat(buryBoneData?.user?.boneStakedUSD) -
      parseFloat(buryBoneData?.user?.boneHarvestedUSD) +
      parseFloat(buryBoneData?.user?.usdIn) -
      parseFloat(buryBoneData?.user?.usdOut));

  // const buryBoneBlockDifference =
  //   parseInt(blocksData?.blocks[0].number) -
  //   parseInt(buryBoneData?.user?.createdAtBlock);

  // const buryBoneRoiDailyBone = (buryBoneRoiBone / buryBoneBlockDifference) * 6440;

  // Bury Shib
  const xShib = parseFloat(buryShibData?.user?.xShib);

  const buryShibPending =
    (xShib * parseFloat(buryShibData?.user?.buries?.shibStaked)) /
    parseFloat(buryShibData?.user?.buries?.totalSupply);

  const xShibTransfered =
  buryShibData?.user?.xShibIn > buryShibData?.user?.xShibOut
      ? parseFloat(buryShibData?.user?.xShibIn) -
        parseFloat(buryShibData?.user?.xShibOut)
      : parseFloat(buryShibData?.user?.xShibOut) -
        parseFloat(buryShibData?.user?.xShibIn);

  const buryShibStaked = buryShibData?.user?.shibStaked;

  const buryShibStakedUSD = buryShibData?.user?.shibStakedUSD;

  const buryShibHarvested = buryShibData?.user?.shibHarvested;
  const buryShibHarvestedUSD = buryShibData?.user?.shibHarvestedUSD;

  const buryShibPendingUSD = buryShibPending > 0 ? buryShibPending * shibPrice : 0;

  const buryShibRoiShib =
  buryShibPending -
    (parseFloat(buryShibData?.user?.shibStaked) -
      parseFloat(buryShibData?.user?.shibHarvested) +
      parseFloat(buryShibData?.user?.shibIn) -
      parseFloat(buryShibData?.user?.shibOut));

  const buryShibRoiUSD =
  buryShibPendingUSD -
    (parseFloat(buryShibData?.user?.shibStakedUSD) -
      parseFloat(buryShibData?.user?.shibHarvestedUSD) +
      parseFloat(buryShibData?.user?.usdIn) -
      parseFloat(buryShibData?.user?.usdOut));


  // const buryShibBlockDifference =
  //   parseInt(blocksData?.blocks[0].number) -
  //   parseInt(buryShibData?.user?.createdAtBlock);

  // const buryShibRoiDailyShib = (buryShibRoiShib / buryShibBlockDifference) * 6440;


  // Bury Leash
  const xLeash = parseFloat(buryLeashData?.user?.xLeash);

  const buryLeashPending =
    (xLeash * parseFloat(buryLeashData?.user?.buries?.leashStaked)) /
    parseFloat(buryLeashData?.user?.buries?.totalSupply);

  const xLeashTransfered =
  buryLeashData?.user?.xLeashIn > buryLeashData?.user?.xLeashOut
      ? parseFloat(buryLeashData?.user?.xLeashIn) -
        parseFloat(buryLeashData?.user?.xLeashOut)
      : parseFloat(buryLeashData?.user?.xLeashOut) -
        parseFloat(buryLeashData?.user?.xLeashIn);

  const buryLeashStaked = buryLeashData?.user?.leashStaked;

  const buryLeashStakedUSD = buryLeashData?.user?.leashStakedUSD;

  const buryLeashHarvested = buryLeashData?.user?.leashHarvested;
  const buryLeashHarvestedUSD = buryLeashData?.user?.leashHarvestedUSD;

  const buryLeashPendingUSD = buryLeashPending > 0 ? buryLeashPending * leashPrice : 0;

  const buryLeashRoiLeash =
  buryLeashPending -
    (parseFloat(buryLeashData?.user?.leashStaked) -
      parseFloat(buryLeashData?.user?.leashHarvested) +
      parseFloat(buryLeashData?.user?.leashIn) -
      parseFloat(buryLeashData?.user?.leashOut));

  const buryLeashRoiUSD =
  buryLeashPendingUSD -
    (parseFloat(buryLeashData?.user?.leashStakedUSD) -
      parseFloat(buryLeashData?.user?.leashHarvestedUSD) +
      parseFloat(buryLeashData?.user?.usdIn) -
      parseFloat(buryLeashData?.user?.usdOut));

  // const buryLeashBlockDifference =
  //   parseInt(blocksData?.blocks[0].number) -
  //   parseInt(buryLeashData?.user?.createdAtBlock);

  // const buryLeashRoiDailyLeash = (buryLeashRoiLeash / buryLeashBlockDifference) * 6440;

  // POOLS

  const poolsUSD = poolUsers?.reduce((previousValue, currentValue) => {
    const pair = pairs.find((pair) => pair.id == currentValue?.pool?.pair);
    if (!pair) {
      return previousValue;
    }
    const share = Number(currentValue.amount / 1e18) / pair.totalSupply;
    return previousValue + pair.reserveUSD * share;
  }, 0);

  const poolsPendingUSD =
    poolUsers?.reduce((previousValue, currentValue) => {
      return (
        previousValue +
        ((currentValue.amount * currentValue.pool.accBonePerShare) / 1e12 -
          currentValue.rewardDebt) /
          1e18
      );
    }, 0) * bonePrice;

  const [
    poolEntriesUSD,
    poolExitsUSD,
    poolHarvestedUSD,
  ] = poolData?.users.reduce(
    (previousValue, currentValue) => {
      const [entries, exits, harvested] = previousValue;
      return [
        entries + parseFloat(currentValue.entryUSD),
        exits + parseFloat(currentValue.exitUSD),
        harvested + parseFloat(currentValue.boneHarvestedUSD),
      ];
    },
    [0, 0, 0]
  );

  // Global

  // const originalInvestments =
  //   parseFloat(barData?.user?.boneStakedUSD) + parseFloat(poolEntriesUSD);

  // const investments =
  //   poolEntriesUSD + barPendingUSD + poolsPendingUSD + poolExitsUSD;

  const buryBoneInvestments =
    poolEntriesUSD + buryBonePendingUSD + poolsPendingUSD + poolExitsUSD;
  const buryShibInvestments =
    poolEntriesUSD + buryShibPendingUSD + poolsPendingUSD + poolExitsUSD;
  const buryLeashInvestments =
    poolEntriesUSD + buryLeashPendingUSD + poolsPendingUSD + poolExitsUSD;

  const buryShibComing = true
  const buryLeashComing = true
  const buryBoneComing = true

  return (
    <AppShell>
      <Head>
        <title>User {id} | ShibaSwap Analytics</title>
      </Head>

      <PageHeader>
        <Typography variant="h5" component="h1" gutterBottom noWrap>
          Portfolio {id}
        </Typography>
      </PageHeader>

      {/*<Typography*/}
      {/*  variant="h6"*/}
      {/*  component="h2"*/}
      {/*  color="textSecondary"*/}
      {/*  gutterBottom*/}
      {/*>*/}
      {/*  Bar*/}
      {/*</Typography>*/}

      {/* Bury Bone */}
      {
      buryBoneComing ? (
        <Box mb={4}>
          <Typography>BuryBone: Coming Soon...</Typography>
        </Box>
      ):!buryBoneData?.user?.buries ? (
        <Box mb={4}>
          <Typography>Address isn't in the Bury Bone...</Typography>
        </Box>
      ) : (
        <>
          <Box mb={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <KPI
                  title="Value"
                  value={formatCurrency(bonePrice * buryBonePending)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPI title="Invested" value={formatCurrency(buryBoneStakedUSD)} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPI
                  title="tBONE"
                  value={Number(tBone.toFixed(2)).toLocaleString()}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPI title="Profit/Loss" value={formatCurrency(buryBoneRoiUSD)} />
              </Grid>
            </Grid>
          </Box>

          <Box my={4}>
            <TableContainer variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="token">Token</TableCell>
                    <TableCell key="staked" align="right">
                      Deposited
                    </TableCell>
                    <TableCell key="harvested" align="right">
                      Withdrawn
                    </TableCell>
                    <TableCell key="pending" align="right">
                      Pending
                    </TableCell>
                    {/* <TableCell key="buryBoneRoiYearly" align="right">
                      ROI (Yearly)
                    </TableCell>
                    <TableCell key="buryBoneRoiMonthly" align="right">
                      ROI (Monthly)
                    </TableCell>
                    <TableCell key="buryBoneRoiDaily" align="right">
                      ROI (Daily)
                    </TableCell> */}
                    <TableCell key="buryBoneRoiBone" align="right">
                      ROI (All-time)
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
                          alt="BONE"
                          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                            "0x9813037ee2218799597d83D4a5B6F3b6778218d9"
                          )}/logo.png`}
                        />
                        <Link
                          href={`/tokens/0x9813037ee2218799597d83D4a5B6F3b6778218d9`}
                          variant="body2"
                          noWrap
                        >
                          BONE
                        </Link>
                        {/* <Link href={`/tokens/0x8798249c2e607446efb7ad49ec89dd1865ff4272`} variant="body2" noWrap>
                        tBONE
                      </Link> */}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryBoneStaked)} (
                        {formatCurrency(buryBoneStakedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryBoneHarvested)} (
                        {formatCurrency(buryBoneHarvestedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {Number(buryBonePending.toFixed(2)).toLocaleString()} (
                        {formatCurrency(bonePrice * buryBonePending)})
                      </Typography>
                    </TableCell>
                    {/* <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryBoneRoiDailyBone * 365)} (
                        {formatCurrency(buryBoneRoiDailyBone * 365 * bonePrice)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryBoneRoiDailyBone * 30)} (
                        {formatCurrency(buryBoneRoiDailyBone * 30 * bonePrice)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryBoneRoiDailyBone)} (
                        {formatCurrency(buryBoneRoiDailyBone * bonePrice)})
                      </Typography>
                    </TableCell> */}

                    <TableCell align="right">
                      {decimalFormatter.format(buryBoneRoiBone)} (
                      {formatCurrency(buryBoneRoiBone * bonePrice)})
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      {/* Bury Shib */}
      {
      buryShibComing ? (
        <Box mb={4}>
          <Typography>BuryShib: Coming Soon...</Typography>
        </Box>
      ): !buryShibData?.user?.buries ? (
        <Box mb={4}>
          <Typography>Address isn't in the Bury Shib...</Typography>
        </Box>
      ) : (
        <>
          <Box mb={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <KPI
                  title="Value"
                  value={formatCurrency(shibPrice * buryShibPending)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPI title="Invested" value={formatCurrency(buryShibStakedUSD)} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPI
                  title="xSHIB"
                  value={Number(xShib.toFixed(2)).toLocaleString()}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPI title="Profit/Loss" value={formatCurrency(buryShibRoiUSD)} />
              </Grid>
            </Grid>
          </Box>

          <Box my={4}>
            <TableContainer variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="token">Token</TableCell>
                    <TableCell key="staked" align="right">
                      Deposited
                    </TableCell>
                    <TableCell key="harvested" align="right">
                      Withdrawn
                    </TableCell>
                    <TableCell key="pending" align="right">
                      Pending
                    </TableCell>
                    {/* <TableCell key="buryShibRoiYearly" align="right">
                      ROI (Yearly)
                    </TableCell>
                    <TableCell key="buryShibRoiMonthly" align="right">
                      ROI (Monthly)
                    </TableCell>
                    <TableCell key="buryShibRoiDaily" align="right">
                      ROI (Daily)
                    </TableCell>
                    <TableCell key="buryShibRoiShib" align="right">
                      ROI (All-time)
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key="12">
                    <TableCell component="th" scope="row">
                      <Box display="flex" alignItems="center">
                        <Avatar
                          className={classes.avatar}
                          imgProps={{ loading: "lazy" }}
                          alt="SHIB"
                          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                            "0x9813037ee2218799597d83D4a5B6F3b6778218d9"
                          )}/logo.png`}
                        />
                        <Link
                          href={`/tokens/0x9813037ee2218799597d83D4a5B6F3b6778218d9`}
                          variant="body2"
                          noWrap
                        >
                          SHIB
                        </Link>
                        {/* <Link href={`/tokens/0x8798249c2e607446efb7ad49ec89dd1865ff4272`} variant="body2" noWrap>
                        xShib
                      </Link> */}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryShibStaked)} (
                        {formatCurrency(buryShibStakedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryShibHarvested)} (
                        {formatCurrency(buryShibHarvestedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {Number(buryShibPending.toFixed(2)).toLocaleString()} (
                        {formatCurrency(shibPrice * buryShibPending)})
                      </Typography>
                    </TableCell>
                    {/* <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryShibRoiDailyShib * 365)} (
                        {formatCurrency(buryShibRoiDailyShib * 365 * shibPrice)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryShibRoiDailyShib * 30)} (
                        {formatCurrency(buryShibRoiDailyShib * 30 * shibPrice)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryShibRoiDailyShib)} (
                        {formatCurrency(buryShibRoiDailyShib * shibPrice)})
                      </Typography>
                    </TableCell> */}

                    <TableCell align="right">
                      {decimalFormatter.format(buryShibRoiShib)} (
                      {formatCurrency(buryShibRoiShib * shibPrice)})
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      {/* Bury Leash */}

      {
      buryLeashComing ? (
        <Box mb={4}>
          <Typography>BuryLeash: Coming Soon...</Typography>
        </Box>
      ): !buryLeashData?.user?.buries ? (
        <Box mb={4}>
          <Typography>Address isn't in the Bury Leash...</Typography>
        </Box>
      ) : (
        <>
          <Box mb={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <KPI
                  title="Value"
                  value={formatCurrency(leashPrice * buryLeashPending)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPI title="Invested" value={formatCurrency(buryLeashStakedUSD)} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPI
                  title="xLEASH"
                  value={Number(xLeash.toFixed(2)).toLocaleString()}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPI title="Profit/Loss" value={formatCurrency(buryLeashRoiUSD)} />
              </Grid>
            </Grid>
          </Box>

          <Box my={4}>
            <TableContainer variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="token">Token</TableCell>
                    <TableCell key="staked" align="right">
                      Deposited
                    </TableCell>
                    <TableCell key="harvested" align="right">
                      Withdrawn
                    </TableCell>
                    <TableCell key="pending" align="right">
                      Pending
                    </TableCell>
                    {/* <TableCell key="buryLeashRoiYearly" align="right">
                      ROI (Yearly)
                    </TableCell>
                    <TableCell key="buryLeashRoiMonthly" align="right">
                      ROI (Monthly)
                    </TableCell>
                    <TableCell key="buryLeashRoiDaily" align="right">
                      ROI (Daily)
                    </TableCell> */}
                    <TableCell key="buryLeashRoiLeash" align="right">
                      ROI (All-time)
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
                          alt="LEASH"
                          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                            "0x9813037ee2218799597d83D4a5B6F3b6778218d9"
                          )}/logo.png`}
                        />
                        <Link
                          href={`/tokens/0x9813037ee2218799597d83D4a5B6F3b6778218d9`}
                          variant="body2"
                          noWrap
                        >
                          LEASH
                        </Link>
                        {/* <Link href={`/tokens/0x8798249c2e607446efb7ad49ec89dd1865ff4272`} variant="body2" noWrap>
                        xLEASH
                      </Link> */}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryLeashStaked)} (
                        {formatCurrency(buryLeashStakedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryLeashHarvested)} (
                        {formatCurrency(buryLeashHarvestedUSD)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {Number(buryLeashPending.toFixed(2)).toLocaleString()} (
                        {formatCurrency(leashPrice * buryLeashPending)})
                      </Typography>
                    </TableCell>
                    {/* <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryLeashRoiDailyLeash * 365)} (
                        {formatCurrency(buryLeashRoiDailyLeash * 365 * leashPrice)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryLeashRoiDailyLeash * 30)} (
                        {formatCurrency(buryLeashRoiDailyLeash * 30 * leashPrice)})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography noWrap variant="body2">
                        {decimalFormatter.format(buryLeashRoiDailyLeash)} (
                        {formatCurrency(buryLeashRoiDailyLeash * leashPrice)})
                      </Typography>
                    </TableCell> */}

                    <TableCell align="right">
                      {decimalFormatter.format(buryLeashRoiLeash)} (
                      {formatCurrency(buryLeashRoiLeash * leashPrice)})
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      <Typography
        variant="h6"
        component="h2"
        color="textSecondary"
        gutterBottom
      >
        Pools
      </Typography>

      {!poolData?.users.length ? (
        <Typography>Address isn't farming...</Typography>
      ) : (
        <>
          <Box mb={4}>
            <Grid container spacing={2}>
              <Grid item xs>
                <KPI
                  title="Value"
                  value={formatCurrency(poolsUSD + poolsPendingUSD)}
                />
              </Grid>
              <Grid item xs>
                <KPI title="Invested" value={formatCurrency(poolEntriesUSD)} />
              </Grid>
              <Grid item xs>
                <KPI
                  title="Profit/Loss"
                  value={formatCurrency(
                    poolsUSD +
                      poolExitsUSD +
                      poolHarvestedUSD +
                      poolsPendingUSD -
                      poolEntriesUSD
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box my={4}>
            <TableContainer variant="outlined">
              <Table aria-label="farming">
                <TableHead>
                  <TableRow>
                    <TableCell key="pool">Pool</TableCell>
                    <TableCell key="slp" align="right">
                      SLP
                    </TableCell>
                    <TableCell key="entryUSD" align="right">
                      Deposited
                    </TableCell>
                    <TableCell key="exitUSD" align="right">
                      Withdrawn
                    </TableCell>
                    <TableCell key="balance" align="right">
                      Balance
                    </TableCell>
                    <TableCell key="value" align="right">
                      Value
                    </TableCell>
                    <TableCell key="pendingBone" align="right">
                      Bone Pending
                    </TableCell>
                    <TableCell key="boneHarvested" align="right">
                      Bone Harvested
                    </TableCell>
                    <TableCell key="pl" align="right">
                      Profit/Loss
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

                    const share = slp / pair.totalSupply;

                    const token0 = pair.reserve0 * share;
                    const token1 = pair.reserve1 * share;

                    const pendingBone =
                      ((user.amount * user.pool.accBonePerShare) / 1e12 -
                        user.rewardDebt) /
                      1e18;
                    // user.amount.mul(accBonePerShare).div(1e12).sub(user.rewardDebt);

                    // console.log(
                    //   user,
                    //   user.entryUSD,
                    //   user.exitUSD,
                    //   pendingBone * bonePrice
                    // );

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
                            {decimalFormatter.format(pendingBone)} (
                            {currencyFormatter.format(
                              pendingBone * bonePrice
                            )}
                            )
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {decimalFormatter.format(user.boneHarvested)} (
                            {currencyFormatter.format(user.boneHarvestedUSD)})
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography noWrap variant="body2">
                            {currencyFormatter.format(
                              parseFloat(pair.reserveUSD * share) +
                                parseFloat(user.exitUSD) +
                                parseFloat(user.boneHarvestedUSD) +
                                parseFloat(pendingBone * bonePrice) -
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
          </Box>
        </>
      )}
    </AppShell>
  );
}

export async function getStaticProps({ params }) {
  const client = getApollo();

  const id = params.id.toLowerCase();

  await getEthPrice(client);

  await getBoneToken(client);

  await getBuryBoneUser(id.toLowerCase(), client);

  await getBuryShibUser(id.toLowerCase(), client);

  await getBuryLeashUser(id.toLowerCase(), client);

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
