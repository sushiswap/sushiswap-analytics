import { ApolloClient } from "@apollo/client";
import cache from "./cache";
import link from "./link";
import merge from "lodash.merge";
import { useMemo } from "react";

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

let apolloClient;

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    connectToDevTools:
      typeof window !== "undefined" && process.NODE_ENV === "development",
    link,
    cache,
  });
}

export function getApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Combine
    const data = merge(initialState, existingCache);

    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") {
    return _apolloClient;
  }

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState) {
  const store = useMemo(() => getApollo(initialState), [initialState]);
  return store;
}

export * from "./variables";
