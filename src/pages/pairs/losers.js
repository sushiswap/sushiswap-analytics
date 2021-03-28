import { AppShell, LosersList } from "app/components";
import { getApollo, getLosers, losersQuery, useInterval } from "app/core";

import { Container } from "@material-ui/core";
import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function LosersPage() {
  const { data } = useQuery(losersQuery);
  useInterval(() => {
    getLosers();
  }, 60000);
  const pairs = data.pairs.filter((pair) => {
    const negativeFees = Math.sign(pair.feesUSDLost - pair.feesUSDLostYesterday) < 0;
    const negativeReserve = Math.sign(pair.reserveUSDLost) < 0;

    return negativeReserve && negativeFees;
  });
  return (
    <AppShell>
      <Head>
        <title>Top Losers | SushiSwap Analytics</title>
      </Head>
      <LosersList pairs={pairs} />
    </AppShell>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  await getLosers(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default LosersPage;
