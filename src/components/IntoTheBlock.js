import React, { useEffect, useState } from "react";

const IntoTheBlock = (props) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.itbWidgetInit && !loaded) {
      window.itbWidgetInit({
        apiKey: "IXlsoP7uCH5tjojovmac53V8xlOh8Qa31yOgozMG",
        options: {
          colors: {
            series: ["#8c6651"],
          },
          protocol: "sushiswap",
          pairAddress: props.pairAddress,
          granularity: "hourly",
          loader: true,
          hideNavigator: true,
          events: {
            onPairNotSupported: () => {
              props.onPairNotSupported(true);
            },
          },
        },
      });
      setLoaded(true);
    }
  }, [props.pairAddress]);

  return (
    <div className="widget-container">
      <div className="charts-container">
        <div
          data-target="itb-widget"
          data-type="protocol-fees-per-liquidity"
        ></div>
        <div
          data-target="itb-widget"
          data-type="protocol-transactions-breakdown"
        ></div>
        <div
          data-target="itb-widget"
          data-type="protocol-liquidity-variation"
          data-options='{ "pairTokenIndex": 0 }'
        ></div>
        <div
          data-target="itb-widget"
          data-type="protocol-liquidity-variation"
          data-options='{ "pairTokenIndex": 1 }'
        ></div>
        <div
          data-target="itb-widget"
          data-type="protocol-roi-calculator"
          className="full-width"
        ></div>
      </div>
      <div className="footer">
        <div data-target="itb-widget" data-type="call-to-action"></div>
        <div data-target="itb-widget" data-type="powered-by"></div>
      </div>
    </div>
  );
};

export default IntoTheBlock;
