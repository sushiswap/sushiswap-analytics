import Head from "next/head";
import Layout from "../components/Layout";
import PairTable from "../components/PairTable";
import React from "react";
import Typography from "@material-ui/core/Typography";
import { getApollo } from "../apollo";
import { getPairs } from "../api";
import { pairsQuery } from "../operations";
import useInterval from "../hooks/useInterval";
import { useQuery } from "@apollo/client";

function PairsPage() {
  const {
    data: { pairs },
  } = useQuery(pairsQuery);
  useInterval(getPairs, 60000);
  return (
    <Layout>
      <Head>
        <title>Pairs | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h5" component="h1" gutterBottom>
        Pairs
      </Typography>
      <PairTable pairs={pairs} />
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();

  // Pairs
  await getPairs(client);

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default PairsPage;
