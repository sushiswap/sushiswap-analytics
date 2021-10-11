import { HttpLink, from, split } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

export const uniswap = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    shouldBatch: true,
  }),
]);

export const bar = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/matthewlilley/bar",
    shouldBatch: true,
  }),
]);

export const masterchef = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/topdog",
    shouldBatch: true,
  }),
]);

export const exchange = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/exchange",
    shouldBatch: true,
  }),
]);

export const blocklytics = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
    shouldBatch: true,
  }),
]);

export const lockup = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/matthewlilley/lockup",
    shouldBatch: true,
  }),
]);


export const buryShib = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/buryshib",
    shouldBatch: true,
  }),
]);

export const buryLeash = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/buryleash",
    shouldBatch: true,
  }),
]);


export const buryBone = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/burybone",
    shouldBatch: true,
  }),
]);

export const topDog = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/topdog",
    shouldBatch: true,
  }),
]);

export const shibaSwapExchange = from([
  new RetryLink({
    delay: (count, operation, error) => {
      return count * 1000 * Math.random();
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error
    }
  }),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/exchange",
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
        split(
          (operation) => {
            return operation.getContext().clientName === "buryShib";
          },
          buryShib,
          split(
            (operation) => {
              return operation.getContext().clientName === "buryLeash";
            },
            buryLeash,
            split(
              (operation) => {
                return operation.getContext().clientName === "buryBone";
              },
              buryBone,
              exchange
            )
          )
        ),
      )
    )
  )
);


