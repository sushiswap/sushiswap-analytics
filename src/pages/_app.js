import "../styles/index.css";
import "../styles/itb.css";

import * as gtag from "../core/analytics";

import { ApolloProvider, useReactiveVar } from "@apollo/client";
import React, { useEffect } from "react";
import {
  // StylesProvider,
  ThemeProvider,
  // createGenerateClassName,
} from "@material-ui/core/styles";
import { darkModeVar, useApollo } from "app/core";
import { darkTheme, lightTheme } from "../theme";

import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import { useRouter } from "next/router";

import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "../state";

function MyApp({ Component, pageProps }) {
  const client = useApollo(pageProps.initialApolloState);

  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

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

  const theme = React.useMemo(
    () => (darkMode ? darkTheme : lightTheme),
    [darkMode]
  );

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <title key="title">Standard Analytics</title>

        <meta
          key="description"
          name="description"
          content="Analytics for Standard Protocol, building the next multichain money"
        />

        <meta name="application-name" content="Standard" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Standard" />

        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#F338C3" />

        <meta key="twitter:card" name="twitter:card" content="app" />
        <meta key="twitter:title" name="twitter:title" content="Standard" />
        <meta
          key="twitter:url"
          name="twitter:url"
          content="https://apps/standard.tech"
        />
        <meta
          key="twitter:description"
          name="twitter:description"
          content="Standard Protocol, building the next multichain finance standard"
        />
        {/* <meta key="twitter:image" name="twitter:image" content="https://app.sushi.com/icons/icon-192x192.png" /> */}
        <meta
          key="twitter:creator"
          name="twitter:creator"
          content="@standarddefi"
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Standard" />
        <meta
          key="og:url"
          property="og:url"
          content="https://apps.standard.tech"
        />
        {/* <meta key="og:image" property="og:image" content="https://app.sushi.com/apple-touch-icon.png" /> */}
        <meta
          key="og:description"
          property="og:description"
          content="Standard Protocol, building the next multichain finance standard"
        />
        {/* metamask image*/}
        <link rel="shortcut icon" href="https://i.imgur.com/hIKSt2P.png" />
        {/* Remove notch in iOS*/}

        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        ></meta>
      </Head>
      <ThemeProvider
        theme={{
          ...theme,
          // props: {
          //   // Change the default options of useMediaQuery
          //   MuiUseMediaQuery: { ssrMatchMedia },
          // },
        }}
      >
        <ReduxProvider store={store}>
          <PersistGate loading="loading" persistor={persistor}>
            <ApolloProvider client={client}>
              <CssBaseline />
              <Component {...pageProps} />
            </ApolloProvider>
          </PersistGate>
        </ReduxProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
