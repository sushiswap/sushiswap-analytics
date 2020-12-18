import "../styles/index.css";
import "../styles/into-the-block.css";

import { ApolloProvider, useReactiveVar } from "@apollo/client";
import React, { useEffect } from "react";
import { darkModeVar, useApollo } from "app/core";
import { darkTheme, lightTheme } from "../theme";

import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import fontTheme from "../styles/font";

function MyApp({ Component, pageProps }) {
  const client = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
    // Add JS
    document.body.className = (document.body.className ?? "").replace(
      "no-js",
      "js"
    );
  }, []);

  const darkMode = useReactiveVar(darkModeVar);

  const theme = React.useMemo(() => (darkMode ? darkTheme : lightTheme), [
    darkMode,
  ]);

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ApolloProvider client={client}>
        <ThemeProvider
          theme={{
            ...theme,
            // props: {
            //   // Change the default options of useMediaQuery
            //   MuiUseMediaQuery: { ssrMatchMedia },
            // },
          }}
        >
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
      <style jsx global>
        {fontTheme}
      </style>
    </>
  );
}

export default MyApp;
