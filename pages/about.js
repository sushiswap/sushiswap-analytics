import Head from "next/head";
import Layout from "../components/Layout";
import React from "react";
import Typography from "@material-ui/core/Typography";

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h4" component="h1" gutterBottom>
        About
      </Typography>
    </Layout>
  );
}
