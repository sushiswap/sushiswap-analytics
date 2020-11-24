import { getApollo, getAverageBlockTime } from "app/core";
import {
  getEthPrice,
  getToken,
  liquidityPositionSubsetQuery,
  pairQuery,
  pairSubsetQuery,
  poolHistoryQuery,
  poolIdsQuery,
  poolQuery,
  poolUserQuery,
  poolsQuery,
} from "app/core";

import { POOL_DENY } from "../../constants";

export async function getPoolIds(client = getApollo()) {
  const {
    data: { pools },
  } = await client.query({
    query: poolIdsQuery,
    context: {
      clientName: "masterchef",
    },
  });
  await client.cache.writeQuery({
    query: poolIdsQuery,
    data: {
      pools: pools.filter(
        (pool) => !POOL_DENY.includes(pool.id) && pool.allocPoint !== "0"
      ),
    },
  });
  return await client.cache.readQuery({
    query: poolIdsQuery,
  });
}

export async function getPoolUser(id, client = getApollo()) {
  const {
    data: { users },
  } = await client.query({
    query: poolUserQuery,
    variables: {
      address: id,
    },
    context: {
      clientName: "masterchef",
    },
  });

  await client.cache.writeQuery({
    query: poolUserQuery,
    data: {
      users,
    },
  });

  return await client.cache.readQuery({
    query: poolUserQuery,
  });
}

export async function getPoolHistories(id, client = getApollo()) {
  const {
    data: { poolHistories },
  } = await client.query({
    query: poolHistoryQuery,
    fetchPolicy: "network-only",
    variables: { id },
    context: {
      clientName: "masterchef",
    },
  });

  await client.cache.writeQuery({
    query: poolHistoryQuery,
    data: {
      poolHistories,
    },
  });

  return await client.cache.readQuery({
    query: poolHistoryQuery,
  });
}

export async function getPool(id, client = getApollo()) {
  const {
    data: { pool },
  } = await client.query({
    query: poolQuery,
    fetchPolicy: "network-only",
    variables: { id },
    context: {
      clientName: "masterchef",
    },
  });

  const {
    data: { pair: liquidityPair },
  } = await client.query({
    query: pairQuery,
    variables: { id: pool.pair },
    fetchPolicy: "network-only",
  });

  await client.cache.writeQuery({
    query: poolQuery,
    data: {
      pool: {
        ...pool,
        liquidityPair,
      },
    },
  });

  return await client.cache.readQuery({
    query: poolQuery,
  });
}

export async function getPools(client = getApollo()) {
  const {
    data: { pools },
  } = await client.query({
    query: poolsQuery,
    context: {
      clientName: "masterchef",
    },
  });

  const pairAddresses = pools
    .map((pool) => {
      return pool.pair;
    })
    .sort();

  const {
    data: { pairs },
  } = await client.query({
    query: pairSubsetQuery,
    variables: { pairAddresses },
    fetchPolicy: "network-only",
  });

  // const averageBlockTime = (await getAverageBlockTime()) / 100;

  const averageBlockTime = await getAverageBlockTime();
  // const averageBlockTime = 13;

  // console.log({ averageBlockTime });

  const { bundles } = await getEthPrice();

  const ethPrice = bundles[0].ethPrice;

  const { token } = await getToken(
    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
  );

  const sushiPrice = ethPrice * token.derivedETH;

  // MASTERCHEF
  const {
    data: { liquidityPositions },
  } = await client.query({
    query: liquidityPositionSubsetQuery,
    variables: { user: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd" },
  });

  await client.cache.writeQuery({
    query: poolsQuery,
    data: {
      pools: pools
        .filter(
          (pool) => !POOL_DENY.includes(pool.id) && pool.allocPoint !== "0"
        )
        .map((pool) => {
          const pair = pairs.find((pair) => pair.id === pool.pair);

          const liquidityPosition = liquidityPositions.find(
            (liquidityPosition) => liquidityPosition.pair.id === pair.id
          );

          const poolWeight = pool.allocPoint / pool.owner.totalAllocPoint;

          const balance = Number(pool.balance / 1e18);

          const balanceUSD =
            (balance / Number(pair.totalSupply)) * Number(pair.reserveUSD);

          const rewardPerBlock =
            ((pool.allocPoint / pool.owner.totalAllocPoint) *
              pool.owner.sushiPerBlock) /
            1e18;

          const blocksPerHour = 3600 / averageBlockTime;

          const roiPerBlock = (rewardPerBlock * sushiPrice) / balanceUSD;

          const roiPerHour = roiPerBlock * blocksPerHour;

          const roiPerDay = roiPerHour * 24;

          const roiPerMonth = roiPerDay * 30;

          const roiPerYear = roiPerMonth * 12;

          return {
            ...pool,
            liquidityPair: pair,
            roiPerBlock,
            roiPerHour,
            roiPerDay,
            roiPerMonth,
            roiPerYear,
            rewardPerThousand: (1e3 / balanceUSD) * rewardPerBlock,
            tvl:
              (pair.reserveUSD / pair.totalSupply) *
              liquidityPosition.liquidityTokenBalance,
          };
        }),
    },
  });

  return await client.cache.readQuery({
    query: poolsQuery,
  });
}
