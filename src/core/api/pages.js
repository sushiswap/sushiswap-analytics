import {
  gainersQuery,
  getApollo,
  barPageQuery,
  factoryQuery,
  factoryTimeTravelQuery,
  dayDatasQuery,
  getOneDayBlock,
  getTwoDayBlock,
  getSevenDayBlock,
  losersQuery,
  pairsTimeTravelQuery,
  pairQuery,
  pairTimeTravelQuery,
  pairsQuery,
  poolPageQuery,
  poolQuery,
  poolHistoryQuery,
  tokenPageQuery,
  tokenPairsQuery,
  tokenQuery,
  tokenTimeTravelQuery,
  transactionsQuery,
  ethPriceQuery,
  ethPriceTimeTravelQuery,
  userPageQuery,
  barUserQuery,
  poolUserQuery,
  lockupUserQuery,
  latestBlockQuery,
} from "app/core";
import { SUSHI_TOKEN } from "app/core/constants";

// Bar
export async function getBarPageData(client = getApollo()) {
  const {
    data: {
      bar,
      histories
    },
  } = await client.query({
    query: barPageQuery,
    context: {
      clientName: "bar",
    },
  });

  const {
    data: { factory },
  } = await client.query({
    query: factoryQuery
  });

  const {
    data: { factory: oneDay },
  } = await client.query({
    query: factoryTimeTravelQuery,
    variables: {
      block: await getOneDayBlock(),
    },
  });

  const {
    data: { dayDatas },
  } = await client.query({
    query: dayDatasQuery
  });

  const {
    data: { token },
  } = await client.query({
    query: tokenQuery,
    variables: {
      id: SUSHI_TOKEN,
    },
  });

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceQuery
  });

  await client.cache.writeQuery({
    query: barPageQuery,
    data: {
      bar,
      histories,
      dayDatas,
      sushiPrice: parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice),
      oneDayVolume: factory?.volumeUSD - oneDay?.volumeUSD,
    },
  });

  return await client.cache.readQuery({
    query: barPageQuery,
  });
}

// Pools
export async function getPoolsPageData(id, client = getApollo()) {
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
    query: poolPageQuery,
    data: {
      pool: {
        ...pool,
        liquidityPair,
      },
      poolHistories,
    },
  });

  return await client.cache.readQuery({
    query: poolPageQuery,
  });
}

// Tokens
export async function getTokenPageData(id, client = getApollo()) {
  const {
    data: { token },
  } = await client.query({
    query: tokenQuery,
    variables: { id },
  });

  const oneDayBlock = await getOneDayBlock();
  const twoDayBlock = await getTwoDayBlock();

  const {
    data: { token: oneDayToken },
  } = await client.query({
    query: tokenTimeTravelQuery,
    variables: {
      id,
      block: oneDayBlock,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { token: twoDayToken },
  } = await client.query({
    query: tokenTimeTravelQuery,
    variables: {
      id,
      block: twoDayBlock,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceQuery,
    fetchPolicy: "no-cache",
  });

  const {
    data: { bundles: oneDayEthPriceBundles },
  } = await client.query({
    query: ethPriceTimeTravelQuery,
    variables: {
      block: oneDayBlock,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs0, pairs1 },
  } = await client.query({ 
    query: tokenPairsQuery, 
    variables: { id },
    fetchPolicy: "no-cache",
  });

  const pairs = [...pairs0, ...pairs1];

  const {
    data: transactions
  } = await client.query({
    query: transactionsQuery,
    variables: {
      pairAddresses: pairs.map((pair) => pair.id).sort(),
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: tokenPageQuery,
    data: {
      token: {
        ...token,
        oneDay: {
          volumeUSD: String(oneDayToken?.volumeUSD),
          derivedETH: String(oneDayToken?.derivedETH),
          liquidity: String(oneDayToken?.liquidity),
          txCount: String(oneDayToken?.txCount),
        },
        twoDay: {
          volumeUSD: String(twoDayToken?.volumeUSD),
          derivedETH: String(twoDayToken?.derivedETH),
          liquidity: String(twoDayToken?.liquidity),
          txCount: String(twoDayToken?.txCount),
        },
      },
      pairs,
      transactions,
      ethPrice: bundles[0]?.ethPrice,
      oneDayEthPrice: oneDayEthPriceBundles[0]?.ethPrice,
    },
  });

  return await client.cache.readQuery({
    query: tokenPageQuery,
  });
}

// Pairs
export async function getPair(id, client = getApollo()) {
  const {
    data: { pair },
  } = await client.query({
    query: pairQuery,
    variables: {
      id,
    },
  });

  const oneDayBlock = await getOneDayBlock();

  const twoDayBlock = await getTwoDayBlock();

  const {
    data: { pair: oneDayPair },
  } = await client.query({
    query: pairTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      id,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pair: twoDayPair },
  } = await client.query({
    query: pairTimeTravelQuery,
    variables: {
      block: twoDayBlock,
      id,
    },
    fetchPolicy: "no-cache",
  });

  // console.log({ oneDayPair, twoDayPair });

  await client.cache.writeQuery({
    query: pairQuery,
    variables: {
      id,
    },
    data: {
      pair: {
        ...pair,
        oneDay: {
          untrackedVolumeUSD: Number(oneDayPair?.untrackedVolumeUSD),
          volumeUSD: Number(oneDayPair?.volumeUSD),
          reserveUSD: Number(oneDayPair?.reserveUSD),
          txCount: Number(oneDayPair?.txCount),
        },
        twoDay: {
          untrackedVolumeUSD: Number(twoDayPair?.untrackedVolumeUSD),
          volumeUSD: Number(twoDayPair?.volumeUSD),
          reserveUSD: Number(twoDayPair?.reserveUSD),
          txCount: Number(twoDayPair?.txCount),
        },
      },
    },
  });

  return await client.cache.readQuery({
    query: pairQuery,
    variables: {
      id,
    },
  });
}

export async function getPairs(client = getApollo()) {
  const {
    data: { pairs },
  } = await client.query({
    query: pairsQuery,
  });

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const oneDayBlock = await getOneDayBlock();

  const sevenDayBlock = await getSevenDayBlock();

  const {
    data: { pairs: oneDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs: sevenDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: sevenDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: pairsQuery,
    data: {
      pairs: pairs.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        const sevenDayPair = sevenDayPairs.find(({ id }) => pair.id === id);
        return {
          ...pair,
          oneDay: {
            untrackedVolumeUSD: String(oneDayPair?.untrackedVolumeUSD),
            volumeUSD: String(oneDayPair?.volumeUSD),
            reserveUSD: String(oneDayPair?.reserveUSD),
            txCount: String(oneDayPair?.txCount),
          },
          sevenDay: {
            untrackedVolumeUSD: String(sevenDayPair?.untrackedVolumeUSD),
            volumeUSD: String(sevenDayPair?.volumeUSD),
            reserveUSD: String(sevenDayPair?.reserveUSD),
            txCount: String(oneDayPair?.txCount),
          },
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: pairsQuery,
  });
}

export async function getTokenPairs(id, client = getApollo()) {
  const {
    data: { pairs0, pairs1 },
  } = await client.query({
    query: tokenPairsQuery,
    variables: { id },
  });

  const pairAddresses = [
    ...pairs0.map((pair) => pair.id),
    ...pairs1.map((pair) => pair.id),
  ].sort();

  const oneDayBlock = await getOneDayBlock();

  const sevenDayBlock = await getSevenDayBlock();

  const {
    data: { pairs: oneDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs: sevenDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: sevenDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: tokenPairsQuery,
    variables: { id },
    data: {
      pairs0: pairs0.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        const sevenDayPair = sevenDayPairs.find(({ id }) => pair.id === id);
        return {
          ...pair,
          oneDay: {
            volumeUSD: String(oneDayPair?.volumeUSD),
            reserveUSD: String(oneDayPair?.reserveUSD),
          },
          sevenDay: {
            volumeUSD: String(sevenDayPair?.volumeUSD),
            reserveUSD: String(sevenDayPair?.reserveUSD),
          },
        };
      }),
      pairs1: pairs1.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        const sevenDayPair = sevenDayPairs.find(({ id }) => pair.id === id);
        return {
          ...pair,
          oneDay: {
            volumeUSD: String(oneDayPair?.volumeUSD),
            reserveUSD: String(oneDayPair?.reserveUSD),
          },
          sevenDay: {
            volumeUSD: String(sevenDayPair?.volumeUSD),
            reserveUSD: String(sevenDayPair?.reserveUSD),
          },
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: tokenPairsQuery,
    variables: { id },
  });
}

export async function getGainers(client = getApollo()) {
  const {
    data: { pairs },
  } = await client.query({
    query: gainersQuery,
  });

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const oneDayBlock = await getOneDayBlock();
  const twoDayBlock = await getTwoDayBlock();

  const {
    data: { pairs: oneDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs: twoDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: twoDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: gainersQuery,
    data: {
      pairs: pairs.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        const twoDayPair = twoDayPairs.find(({ id }) => pair.id === id);
        const volumeUSDGained = pair.volumeUSD - oneDayPair?.volumeUSD;
        const volumeUSDGainedYesterday = oneDayPair?.volumeUSD - twoDayPair?.volumeUSD;
        const feesUSDGained = volumeUSDGained * 0.003;
        const feesUSDGainedYesterday = volumeUSDGainedYesterday * 0.003;
        const reserveUSDGained = pair.reserveUSD - oneDayPair?.reserveUSD;
        const reserveUSDGainedYesterday = oneDayPair?.reserveUSD - twoDayPair?.reserveUSD;
        return {
          ...pair,
          feesUSDGained,
          feesUSDGainedYesterday,
          reserveUSDGained,
          reserveUSDGainedYesterday,
          volumeUSDGained,
          volumeUSDGainedYesterday
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: gainersQuery,
  });
}

export async function getLosers(client = getApollo()) {
  const {
    data: { pairs },
  } = await client.query({
    query: losersQuery,
  });

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const oneDayBlock = await getOneDayBlock();
  const twoDayBlock = await getTwoDayBlock();

  const {
    data: { pairs: oneDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs: twoDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: twoDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: losersQuery,
    data: {
      pairs: pairs.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        const twoDayPair = twoDayPairs.find(({ id }) => pair.id === id);
        const volumeUSDLost = pair.volumeUSD - oneDayPair?.volumeUSD;
        const volumeUSDLostYesterday = oneDayPair?.volumeUSD - twoDayPair?.volumeUSD;
        const feesUSDLost = volumeUSDLost * 0.003;
        const feesUSDLostYesterday = volumeUSDLostYesterday * 0.003;
        const reserveUSDLost = pair.reserveUSD - oneDayPair?.reserveUSD;
        const reserveUSDLostYesterday = oneDayPair?.reserveUSD - twoDayPair?.reserveUSD;
        return {
          ...pair,
          feesUSDLost,
          feesUSDLostYesterday,
          volumeUSDLost,
          volumeUSDLostYesterday,
          reserveUSDLost,
          reserveUSDLostYesterday,
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: losersQuery,
  });
}

// Users
export async function getUserPageData(id, client = getApollo()) {
  const { data: bar } = await client.query({
    query: barUserQuery,
    variables: {
      id: id.toLowerCase(),
    },
    context: {
      clientName: "bar",
    },
  });

  const { data: pool } = await client.query({ 
    query: poolUserQuery,
    variables: {
      address: id.toLowerCase(),
    },
    context: {
      clientName: "masterchef",
    },
  });

  const { data: lockup } = await client.query({
    query: lockupUserQuery,
    variables: {
      address: id.toLowerCase(),
    },
    context: {
      clientName: "lockup",
    },
    fetchPolicy: 'no-cache'
  });

  const { data: blocks } = await client.query({
    query: latestBlockQuery,
    context: {
      clientName: "blocklytics",
    },
  });

  const {
    data: { pairs },
  } = await client.query({
    query: pairsQuery,
  });

  const {
    data: { token },
  } = await client.query({
    query: tokenQuery,
    variables: {
      id: SUSHI_TOKEN,
    },
  });

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceQuery
  });

  await client.cache.writeQuery({
    query: userPageQuery,
    data: {
      bar,
      pool,
      lockup,
      blocks,
      pairs,
      sushiPrice: parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice),
    },
  });

  return await client.cache.readQuery({
    query: userPageQuery,
  });
}
