import "../styles/index.css";

import { ApolloProvider, useReactiveVar } from "@apollo/client";
import React, { useEffect } from "react";
import { darkModeVar, useApollo } from "app/core";
import { darkTheme, lightTheme } from "../theme";

import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import fontTheme from "../styles/font";
import useMediaQuery from "@material-ui/core/useMediaQuery";

function MyApp({ Component, pageProps }) {
  const client = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    document.body.className = (document.body.className ?? "").replace(
      "no-js",
      "js"
    );
  }, []);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // if (prefersDarkMode) {
  //   if (!document.documentElement.classList.contains("dark-theme")) {
  //     document.documentElement.classList.add(["dark-theme"]);
  //   }
  //   localStorage.setItem("darkMode", "true");
  // }

  const darkMode = useReactiveVar(darkModeVar);

  // if ((prefersDarkMode && darkMode === null) || darkMode === "true") {
  //   document.documentElement.classList.add(["dark-theme"]);
  //   localStorage.setItem("darkMode", "true");
  // } else {
  //   document.documentElement.classList.remove(["dark-theme"]);
  //   localStorage.setItem("darkMode", "false");
  // }

  // const theme = React.useMemo(
  //   () => (darkMode && prefersDarkMode ? darkTheme : lightTheme),
  //   [prefersDarkMode, darkMode]
  // );

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        {/* <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        /> */}
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ApolloProvider client={client}>
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
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
