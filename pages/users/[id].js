import { Avatar, Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, makeStyles } from "@material-ui/core";
import { ethPriceQuery, tokenQuery, userIdsQuery, userQuery } from "../../operations";
import { getToken, getUser } from '../../api'

import { AvatarGroup } from "@material-ui/lab"
import Head from "next/head";
import Layout from "../../components/Layout";
import Link from "../../components/Link";
import { currencyFormatter } from '../../intl'
import { getApollo } from "../../apollo";
import { toChecksumAddress } from "web3-utils";
import { useQuery } from '@apollo/client'
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {
    
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

  console.log("Router is fallback", router.isFallback)

  if (router.isFallback) {
    return <Layout>Generating user portfolio...</Layout>
  }

  console.log("Router not fallback", router.isFallback)

  const classes = useStyles();
  
  const { id } = router.query;

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  const {
    data,
    error,
  } = useQuery(userQuery, {
    variables: {
      id: id.toLowerCase(),
    },
    pollInterval: 60000,
  });
  
  const {
    data: { token }
  } = useQuery(tokenQuery, {
    variables: {
      id: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    },
    pollInterval: 60000,
  });

  console.log("data", data)
  console.log("error", error)

  const sushiPrice = parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  const xSushi = data?.user?.xSushi

  const barPending = data?.user?.xSushi * data?.user?.bar?.stakedSushi / data?.user?.bar?.totalSupply
  const barStaked = data?.user?.barStaked - data?.user?.barHarvested
  return (
    <Layout>
      <Head>
        <title>User {id} | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h5" component="h1" noWrap>
        User {id}
      </Typography>
      <pre>{JSON.stringify(data?.user, null, 2)}</pre>


      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h6" component="h2" gutterBottom>
            Farming
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table aria-label="farming">
              <TableHead>
                <TableRow>
                  <TableCell key="pool">Pool</TableCell>
                  <TableCell key="slp" align="right">SLP</TableCell>
                  <TableCell key="balance" align="right">Balance</TableCell>
                  <TableCell key="value" align="right">Value</TableCell>
                  <TableCell key="pendingSushi" align="right">
                    Pending Sushi
                  </TableCell>
                  <TableCell key="apy" align="right">
                    APY
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
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
                      <Link href={`/pairs/0x795065dcc9f64b5614c407a6efdc400da6221fb0`} variant="body2" noWrap>
                        SUSHI + WETH
                      </Link>
                    </Box>
                    
                  </TableCell>
                  <TableCell align="right">
                    23.88 SLP
                  </TableCell>
                  <TableCell align="right">
                  613.21 SUSHI + 1.02 WETH
                  </TableCell>
                  <TableCell align="right">
                  $784.95
                  </TableCell>
                  <TableCell align="right">
                  46.57($29.73)
                  </TableCell>
                  <TableCell align="right">
                  23.76%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item>
          <Typography variant="h6" component="h2" gutterBottom>
            Staking
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table aria-label="farming">
              <TableHead>
                <TableRow>
                  <TableCell key="token">Token</TableCell>
                  <TableCell key="staked" align="right">Staked</TableCell>
                  <TableCell key="xSushi" align="right">xSushi</TableCell>
                  <TableCell key="balance" align="right">Balance</TableCell>
                  <TableCell key="value" align="right">Value</TableCell>
                  <TableCell key="apy" align="right">
                    APY
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
                      <Link href={`/token/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2`} variant="body2" noWrap>
                        SUSHI
                      </Link>
                    </Box>
                    
                  </TableCell>
                  <TableCell align="right">
                  { barStaked.toFixed(2) } SUSHI
                  </TableCell>
                  <TableCell align="right">
                  { Number(xSushi).toFixed(2) } XSUSHI
                  </TableCell>
                  <TableCell align="right">
                  { barPending.toFixed(2) } SUSHI
                  </TableCell>
                  <TableCell align="right">
                    { currencyFormatter.format(sushiPrice * barPending) }
                  </TableCell>
                  <TableCell align="right">
                    21.04%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>



    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {

  console.log("server id", id)

  const client = getApollo();

  await client.query({
    query: ethPriceQuery,
  });

  await getUser(id.toLowerCase(), client);

  await getToken("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", client)

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {

  const client = getApollo();

  const { data } = await client.query({
    query: userIdsQuery,
  });

  // Get the paths we want to pre-render based on tokens
  const paths = data.users.map(({ id }) => ({
    params: { id },
  }));

  return { paths, fallback: true };
}

export default UserPage;
