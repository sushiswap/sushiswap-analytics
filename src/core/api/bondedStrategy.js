import {
  bondedStrategyHistoriesQuery,
  bondedStrategyQuery,
  bondedStrategyUserQuery,
  bondedStrategyPairsQuery,
  bondedStrategyPairQuery,
  bondedStrategyPairHistoriesQuery,
} from "../queries/bondedStrategy";

import { getApollo } from "../apollo";
import { getNetwork } from "core/state";
import { DIVIDEND_POOL_ADDRESS } from "../constants";

export async function getBondedStrategy(
  client = getApollo(),
  chainId = getNetwork()
) {
  const { data } = await client.query({
    query: bondedStrategyQuery,
    variables: {
      id: DIVIDEND_POOL_ADDRESS[chainId],
    },
  });

  await client.cache.writeQuery({
    query: bondedStrategyQuery,
    data,
    variables: {
      id: DIVIDEND_POOL_ADDRESS[chainId],
    },
  });

  return await client.cache.readQuery({
    query: bondedStrategyQuery,
    variables: {
      id: DIVIDEND_POOL_ADDRESS[chainId],
    },
  });
}

export async function getBondedStrategyHistories(client = getApollo()) {
  const { data } = await client.query({
    query: bondedStrategyHistoriesQuery,
  });

  await client.cache.writeQuery({
    query: bondedStrategyHistoriesQuery,
    data,
  });

  return await client.cache.readQuery({
    query: bondedStrategyHistoriesQuery,
  });
}

export async function getBondedStrategyUser(id, client = getApollo()) {
  const { data } = await client.query({
    query: bondedStrategyUserQuery,
    variables: {
      id,
    },
  });

  await client.cache.writeQuery({
    query: bondedStrategyUserQuery,
    data,
    variables: {
      id,
    },
  });

  return await client.cache.readQuery({
    query: bondedStrategyUserQuery,
    variables: { id },
  });
}

export async function getBondedStrategyPairs(client = getApollo()) {
  const { data } = await client.query({
    query: bondedStrategyPairsQuery,
  });

  await client.cache.writeQuery({
    query: bondedStrategyPairsQuery,
    data,
  });

  return await client.cache.readQuery({
    query: bondedStrategyPairsQuery,
  });
}

export async function getBondedStrategyPair(id, client = getApollo()) {
  const { data } = await client.query({
    query: bondedStrategyPairQuery,
    variables: {
      id,
    },
  });

  await client.cache.writeQuery({
    query: bondedStrategyPairQuery,
    data,
    variables: {
      id,
    },
  });

  return await client.cache.readQuery({
    query: bondedStrategyPairQuery,
    variables: {
      id,
    },
  });
}

export async function getBondedStrategyPairsHistory(id, client = getApollo()) {
  const { data } = await client.query({
    query: bondedStrategyPairHistoriesQuery,
    variables: {
      id,
    },
  });

  await client.cache.writeQuery({
    query: bondedStrategyPairHistoriesQuery,
    data,
    variables: {
      id,
    },
  });

  return await client.cache.readQuery({
    query: bondedStrategyPairHistoriesQuery,
    variables: {
      id,
    },
  });
}
