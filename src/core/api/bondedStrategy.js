import {
  bondedStrategyHistoriesQuery,
  bondedStrategyQuery,
  bondedStrategyUserQuery,
  bondedStrategyPairsQuery,
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

export async function getBondedStrategyPairsQuery(client = getApollo()) {
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
