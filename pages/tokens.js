import {
  ethPriceQuery,
  getApollo,
  getOneDayEthPrice,
  getTokens,
  tokensQuery,
  useInterval,
} from "app/core";
import { useApolloClient, useQuery } from "@apollo/client";

import Head from "next/head";
import { Layout } from "app/components";
import React from "react";
import TokenTable from "../components/TokenTable";

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
      <TokenTable title="Tokens" tokens={tokens} />
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();

  await client.query({
    query: ethPriceQuery,
  });

  await getOneDayEthPrice(client);

  await getTokens(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default TokensPage;
