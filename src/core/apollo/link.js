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
    uri: "https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange",
    shouldBatch: true,
  }),
]);

export const blocklytics = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-blocks",
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
