import Document, { Head, Html, Main, NextScript } from "next/document";

import { GA_TRACKING_ID } from '../core/analytics'
import React from "react";
import { ServerStyleSheets } from "@material-ui/core/styles";
//
import { palette } from "../theme";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" dir="ltr" style={{ overflowY: "scroll" }}>
        <Head>
          <meta charSet="utf-8" />

          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

          <meta name="application-name" content={process.env.APP_NAME} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta
            name="apple-mobile-web-app-title"
            content={process.env.APP_NAME}
          />

          <meta
            name="description"
            content={process.env.NEXT_PUBLIC_APP_DESCRIPTION}
          />
          <meta
            name="keywords"
            content={process.env.NEXT_PUBLIC_APP_KEYWORDS}
          />

          <link
            rel="preload"
            href="/fonts/inter-var-latin.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />

          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-TileColor" content={palette.primary.main} />
          <meta name="msapplication-tap-highlight" content="no" />

          <meta name="theme-color" content={palette.primary.main} />

          {/* <link rel="apple-touch-icon" href="/apple-icon.png"></link> */}

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />

          <link
            href="/favicon-16x16.png"
            rel="icon"
            type="image/png"
            sizes="16x16"
          />

          <link
            href="/favicon-32x32.png"
            rel="icon"
            type="image/png"
            sizes="32x32"
          />

          <link rel="manifest" href="/manifest.json" />

          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />

          <link rel="shortcut icon" href="/favicon.ico" />

          {/* TWITTER */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content={process.env.APP_URL} />
          <meta name="twitter:title" content={process.env.APP_NAME} />
          <meta
            name="twitter:description"
            content={process.env.APP_DESCRIPTION}
          />
          <meta name="twitter:image" content="/android-chrome-192x192.png" />
          <meta name="twitter:creator" content="@MatthewLilley" />

          {/* FACEBOOK */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={process.env.APP_NAME} />
          <meta
            property="og:description"
            content={process.env.APP_DESCRIPTION}
          />
          <meta property="og:site_name" content={process.env.APP_NAME} />
          <meta property="og:url" content={process.env.APP_URL} />
          <meta property="og:image" content="/apple-touch-icon.png" />
          <script
            type="text/javascript"
            src="https://app.intotheblock.com/widget.js"
          />
                   {/* Global Site Tag (gtag.js) - Google Analytics */}
                   <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </Head>
        <body className="no-js">
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var query = window.matchMedia("(prefers-color-scheme: dark)");
                  var darkMode = window.localStorage.getItem("darkMode") === "true";
                
                  if (darkMode) {
                    document.documentElement.classList.add("dark-theme");
                  }
                } catch (e) {
                  // Silence
                }
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  };
};
