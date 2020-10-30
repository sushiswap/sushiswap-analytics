import { HttpLink, from, split } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

export const uniswap = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    shouldBatch: true,
  }),
]);

// export const sushiswap = from([
//   new RetryLink(),
//   new HttpLink({
//     uri:
//       "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
//     shouldBatch: true,
//   }),
// ]);

export const sushiswap = from([
  new RetryLink(),
  new HttpLink({
    uri:
      "https://api.thegraph.com/subgraphs/name/matthewlilley/sushiswap",
    shouldBatch: true,
  }),
]);

export const masterchef = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap",
    shouldBatch: true,
  }),
]);

export const blocklytics = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
    shouldBatch: true,
  }),
]);

export default split(
  (operation) => {
    return operation.getContext().clientName === "blocklytics";
  },
  blocklytics,
  split(
    (operation) => {
      return operation.getContext().clientName === "masterchef";
    },
    masterchef,
    sushiswap
  )
);
