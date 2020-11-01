import Head from "next/head";
import Layout from "../components/Layout";
import React from "react";
import Typography from "@material-ui/core/Typography";
import { getApollo } from "../apollo";

function PoolsPage() {
  return (
    <Layout>
      <Head>
        <title>Pools | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h5" component="h1" gutterBottom>
        Pools
      </Typography>
    </Layout>
  );
}

export async function getStaticProps() {
  const client = getApollo();
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export default PoolsPage;
