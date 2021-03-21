import { AppShell, GainersList } from "app/components";
import { gainersQuery, getApollo, getGainers, useInterval } from "app/core";

import { Container } from "@material-ui/core";
import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function GainersPage() {
  const { data } = useQuery(gainersQuery);
  useInterval(() => {
    getGainers();
  }, 60000);
  const pairs = data.pairs.filter((pair) => {
    const positiveFees = Math.sign(pair.feesUSDGained - pair.feesUSDGainedYesterday) > 0;
    const positiveReserve = Math.sign(pair.reserveUSDGained) > 0;

    return positiveReserve && positiveFees;
  });
  return (
    <AppShell>
      <Head>
        <title>Top Gainers | SushiSwap Analytics</title>
      </Head>
      <GainersList pairs={pairs} />
    </AppShell>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getGainers(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default GainersPage;
