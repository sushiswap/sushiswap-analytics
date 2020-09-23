import Head from "next/head";
import Layout from "../../components/Layout";
import Typography from "@material-ui/core/Typography";
import { getApollo } from "../../apollo";
import { useQuery } from '@apollo/client'
import { useRouter } from "next/router";
import { userQuery } from "../../operations";

function UserPage() {
  const router = useRouter();

  const { id } = router.query;

  // const {
  //   data: { user },
  // } = useQuery(userQuery, {
  //   variables: {
  //     id,
  //   },
  //   pollInterval: 60000,
  // });
  
  // console.log("user", user)

  return (
    <Layout>
      <Head>
        <title>User {id} | SushiSwap Analytics</title>
      </Head>
      <Typography variant="h5" component="h1" noWrap>
        User {id}
      </Typography>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
    </Layout>
  );
}

export async function getStaticProps({ params: { id } }) {
  const client = getApollo();
  const { data } = await client.query({
    query: userQuery,
    variables: {
      id,
    },
  });
  console.log("s user", data)
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
