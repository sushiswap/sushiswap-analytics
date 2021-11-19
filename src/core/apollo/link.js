import { HttpLink, from, split } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

export const uniswap = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    shouldBatch: true,
  }),
]);

export const exchange = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/jiro-ono/moonriver-exchange-staging",
    shouldBatch: true,
  }),
]);

export const blocklytics = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/sushiswap/moonriver-blocks",
    shouldBatch: true,
  }),
]);

export default split(
  (operation) => {
    return operation.getContext().clientName === "blocklytics";
  },
  blocklytics,
  exchange
);
