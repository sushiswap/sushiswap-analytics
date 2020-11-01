import { Box, Typography, makeStyles } from "@material-ui/core";

import Head from "next/head";
import Layout from "../../components/Layout";
import { ethPriceQuery } from "../../operations";
import { getApollo } from "../../apollo";
import { toChecksumAddress } from "web3-utils";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PoolPage() {

  const classes = useStyles();

  const router = useRouter();

  const { id } = router.query;

  return (
    <Layout>
      <Head>
        <title>Pool {id} | SushiSwap Analytics</title>
      </Head>

      <Box marginBottom={4}>
        <Typography variant="h5" component="h1" gutterBottom>
          Pool
        </Typography>
      </Box>
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {

  const client = getApollo();

  await client.query({
    query: ethPriceQuery,
  });

  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

export default UserPage;
