import { Layout, PairTable, PoolTable } from "app/components";
import {
  getApollo,
  getPairs,
  getPools,
  pairsQuery,
  poolsQuery,
  useInterval,
} from "app/core";

import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

const variables = { orderBy: "timestamp", orderDirection: "desc" };

function RecentlyAddedPage() {
  const {
    data: { pairs },
  } = useQuery(pairsQuery);

  const {
    data: { pools },
  } = useQuery(poolsQuery, {
    context: {
      clientName: "masterchef",
    },
    variables: {
      orderBy: "timestamp",
      orderDirection: "desc",
    },
  });

  useInterval(() => Promise.all([getPairs, getPools]), 60000);

  return (
    <Layout>
      <Head>
        <title>Recently Added | SushiSwap Analytics</title>
      </Head>
      <PoolTable pools={pools} />
      <PairTable pairs={pairs} orderBy="timestamp" order="desc" />
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getPairs(client);
  await getPools(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default RecentlyAddedPage;
