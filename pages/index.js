import {
  ethPriceQuery,
  pairDayDatasQuery,
  pairsQuery,
  tokenDayDatasQuery,
  tokensQuery,
  uniswapDayDatasQuery,
} from "../operations";
import { getOneDayEthPrice, getPairs, getTokens } from "../api";

import Box from "@material-ui/core/Box";
import DashboardCharts from "../components/DashboardCharts";
import Head from "next/head";
import Layout from "../components/Layout";
import PairTable from "../components/PairTable";
import React from "react";
import Search from "../components/Search";
import TokenTable from "../components/TokenTable";
import Typography from "@material-ui/core/Typography";
import { getApollo } from "../apollo";
import useInterval from "../hooks/useInterval";
import { useQuery } from "@apollo/client";

function IndexPage() {
  const {
    data: { tokens },
  } = useQuery(tokensQuery);
  const {
    data: { pairs },
  } = useQuery(pairsQuery);

  useInterval(
    () => Promise.all([getPairs, getTokens, getOneDayEthPrice]),
    60000
  );

  return (
    <Layout>
      <Head>
        <title>Dashboard | SushiSwap Analytics</title>
      </Head>
      <Box my={4}>
        <Search />
      </Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <DashboardCharts />
      <Typography variant="h6" component="h2" gutterBottom>
        Top Tokens
      </Typography>
      <TokenTable tokens={tokens} />
      <Typography variant="h6" component="h2" gutterBottom>
        Top Pairs
      </Typography>
      <PairTable pairs={pairs} />
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();

  // uniswapDayDatasQuery
  await client.query({
    query: uniswapDayDatasQuery,
  });

  // ethPriceQuery
  await client.query({
    query: ethPriceQuery,
  });

  await getTokens(client);

  await getPairs(client);

  await getOneDayEthPrice(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default IndexPage;
