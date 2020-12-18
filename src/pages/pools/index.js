import { AppShell, PoolTable } from "app/components";
import { getApollo, getPools, poolsQuery, useInterval } from "app/core";

import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function PoolsPage() {
  const {
    data: { pools },
  } = useQuery(poolsQuery, {
    context: {
      clientName: "masterchef",
    },
  });

  useInterval(getPools, 60000);

  return (
    <AppShell>
      <Head>
        <title>Pools | SushiSwap Analytics</title>
      </Head>
      <PoolTable
        pools={pools}
        orderBy="rewardPerThousand"
        order="desc"
        rowsPerPage={100}
      />
    </AppShell>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getPools(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default PoolsPage;
