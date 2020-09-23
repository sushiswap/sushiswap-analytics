import { ethPriceQuery, tokensQuery } from "../operations";
import { getOneDayEthPrice, getTokens } from "../api";
import { useApolloClient, useQuery } from "@apollo/client";

import Head from "next/head";
import Layout from "../components/Layout";
import React from "react";
import TokenTable from "../components/TokenTable";
import Typography from "@material-ui/core/Typography";
import { getApollo } from "../apollo";
import useInterval from "../hooks/useInterval";

function TokensPage() {
  const {
    data: { tokens },
  } = useQuery(tokensQuery);

  useInterval(async () => {
    await Promise.all([getTokens, getOneDayEthPrice]);
  }, 60000);

  return (
    <Layout>
      <Head>
        <title>Tokens | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h5" component="h1" gutterBottom>
        Tokens
      </Typography>
      <TokenTable tokens={tokens} />
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();

  await client.query({
    query: ethPriceQuery,
  });

  await getTokens(client);

  await getOneDayEthPrice(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default TokensPage;
