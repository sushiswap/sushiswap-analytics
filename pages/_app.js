import "../styles/index.css";

import { ApolloProvider, useReactiveVar } from "@apollo/client";
import React, { useEffect } from "react";
import { darkTheme, lightTheme } from "../theme";

import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import { darkModeVar } from "../apollo/variables";
import fontTheme from "../styles/font";
import { useApollo } from "../apollo";
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

  const darkMode = useReactiveVar(darkModeVar);

  // const theme = useMemo(() => {
  //   return createMuiTheme({
  //     palette: {
  //       type: prefersDarkMode || darkMode ? "dark" : "light",
  //       ...palette,
  //     },
  //     typography: {
  //       fontFamily: [
  //         "Inter",
  //         "-apple-system",
  //         "BlinkMacSystemFont",
  //         "Segoe UI",
  //         "Roboto",
  //         "Oxygen",
  //         "Ubuntu",
  //         "Cantarell",
  //         "Fira Sans",
  //         "Droid Sans",
  //         "Helvetica Neue",
  //         "sans-serif",
  //       ],
  //     },
  //     overrides: {
  //       MuiTable: {
  //         root: {
  //           "& > tbody > tr:last-child > *": { border: 0 },
  //         },
  //       },
  //     },
  //   });
  // }, [prefersDarkMode, darkMode]);

  // const theme = prefersDarkMode || darkMode ? darkTheme : lightTheme;

  // console.log(theme.palette.type, theme.palette.background.default);

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
        <ThemeProvider
          theme={prefersDarkMode || darkMode ? darkTheme : lightTheme}
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
