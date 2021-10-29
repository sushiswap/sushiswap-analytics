import { HttpLink, from, split } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";
import { getNetwork } from "core/state";
import {
  getMasterChefGraphAddr,
  getBlocksGraphAddr,
  getExchangeGraphAddr,
} from "./constants";

export const uniswap = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    shouldBatch: true,
  }),
]);

export const bar = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/matthewlilley/bar",
    shouldBatch: true,
  }),
]);

export const masterchef = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/sushiswap/master-chef",
    shouldBatch: true,
  }),
]);

export const exchange = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
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

export const lockup = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/matthewlilley/lockup",
    shouldBatch: true,
  }),
]);

export const getExchange = (chainId) => {
  return from([
    new RetryLink(),
    new HttpLink({
      uri: getExchangeGraphAddr(chainId),
      shouldBatch: true,
    }),
  ]);
};

export const getBlocks = (chainId) => {
  const result = from([
    new RetryLink(),
    new HttpLink({
      uri: getBlocksGraphAddr(chainId),
      shouldBatch: true,
    }),
  ]);
  return result;
};

export const getMasterChef = (chainId) => {
  return from([
    new RetryLink(),
    new HttpLink({
      uri: getMasterChefGraphAddr(chainId),
      shouldBatch: true,
    }),
  ]);
};

export default split(
  (operation) => {
    return operation.getContext().clientName === "blocklytics";
  },
  getBlocks(getNetwork()),
  split(
    (operation) => {
      return operation.getContext().clientName === "masterchef";
    },
    getMasterChef(getNetwork()),
    split(
      (operation) => {
        return operation.getContext().clientName === "bar";
      },
      bar,
      split(
        (operation) => {
          return operation.getContext().clientName === "lockup";
        },
        lockup,
        getExchange(getNetwork())
      )
    )
  )
);
