import {
  barHistoriesQuery,
  barQuery,
  barUserQuery,
  blockQuery,
  blocksQuery,
  ethPriceQuery,
  ethPriceTimeTravelQuery,
  gainersQuery,
  getApollo,
  liquidityPositionSubsetQuery,
  losersQuery,
  oneDayEthPriceQuery,
  pairQuery,
  pairSubsetQuery,
  pairTimeTravelQuery,
  pairsQuery,
  pairsTimeTravelQuery,
  poolHistoryQuery,
  poolQuery,
  poolUserQuery,
  poolsQuery,
  sevenDayEthPriceQuery,
  tokenPairsQuery,
  tokenQuery,
  tokenTimeTravelQuery,
  tokensQuery,
  tokensTimeTravelQuery,
  userQuery,
} from "app/core";
import {
  startOfHour,
  startOfMinute,
  subDays,
  subHours,
  subWeeks,
} from "date-fns";

import { POOL_DENY } from "../../constants";

export async function preload() {
  // Pre-load anything that might be needed globally (stuff for search bar etc...)
  await getTokens();
  await getPairs();
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

export async function getAverageBlockTime(client = getApollo()) {
  const now = startOfHour(Date.now());
  const start = Math.floor(startOfMinute(subHours(now, 1)) / 1000);
  const end = Math.floor(now) / 1000;

  const {
    data: { blocks },
  } = await client.query({
    query: blocksQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: "blocklytics",
    },
  });

  const { averageBlockTime } = blocks.reduce(
    (previousValue, currentValue, currentIndex) => {
      if (previousValue.timestamp) {
        const difference = previousValue.timestamp - currentValue.timestamp;

        previousValue.averageBlockTime =
          previousValue.averageBlockTime + difference / currentIndex + 1;
      }

      previousValue.timestamp = currentValue.timestamp;

      return previousValue;
    },
    { timestamp: null, averageBlockTime: 12 }
  );

  return averageBlockTime;
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
    fetchPolicy: "network-only",
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

  const averageBlockTime = (await getAverageBlockTime()) / 100;

  // const averageBlockTime = 12;

  const { bundles } = await getEthPrice();

  const ethPrice = bundles[0].ethPrice;

  const { token } = await getToken(
    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
  );

  const sushiPrice = ethPrice * token.derivedETH;

  const {
    data: { liquidityPositions },
  } = await client.query({
    query: liquidityPositionSubsetQuery,
    variables: { user: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd" },
    fetchPolicy: "network-only",
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

export async function getGainers(client = getApollo()) {
  const {
    data: { pairs },
  } = await client.query({
    query: gainersQuery,
    fetchPolicy: "network-only",
  });

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const oneDayBlock = await getOneDayBlock();

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

  // console.log("one day pairs", oneDayPairs);

  await client.cache.writeQuery({
    query: gainersQuery,
    data: {
      pairs: pairs.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        return {
          ...pair,
          reserveUSDGained: pair.reserveUSD - oneDayPair?.reserveUSD,
          volumeUSDGained: pair.volumeUSD - oneDayPair?.volumeUSD,
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
    fetchPolicy: "network-only",
  });

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const oneDayBlock = await getOneDayBlock();

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

  // console.log("one day pairs", oneDayPairs);

  await client.cache.writeQuery({
    query: losersQuery,
    data: {
      pairs: pairs.map((pair) => {
        const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
        return {
          ...pair,
          reserveUSDLost: pair.reserveUSD - oneDayPair?.reserveUSD,
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: losersQuery,
  });
}

export async function getLiquidityPositionSnapshots(
  user,
  client = getApollo()
) {
  const {
    data: { liquidityPositionSnapshots },
  } = await client.query({
    query: liquidityPositionSnapshotsQuery,
    variables: {
      user,
    },
  });
}

export async function getBar(client = getApollo()) {
  const { data } = await client.query({
    query: barQuery,
    context: {
      clientName: "bar",
    },
  });

  await client.cache.writeQuery({
    query: barQuery,
    data,
  });

  return await client.cache.readQuery({
    query: barQuery,
  });
}

export async function getBarHistories(client = getApollo()) {
  const { data } = await client.query({
    query: barHistoriesQuery,
    context: {
      clientName: "bar",
    },
  });

  await client.cache.writeQuery({
    query: barHistoriesQuery,
    data,
  });

  return await client.cache.readQuery({
    query: barHistoriesQuery,
  });
}

export async function getBarUser(id, client = getApollo()) {
  const { data } = await client.query({
    query: barUserQuery,
    variables: {
      id,
    },
    fetchPolicy: "no-cache",
    context: {
      clientName: "bar",
    },
  });
  return data;
}

export async function getUser(id, client = getApollo()) {
  const {
    data: { user },
  } = await client.query({
    query: userQuery,
    variables: {
      id,
    },
  });

  // const { data: { uniswapUser } } = await client.query({
  //   query: uniswapUserQuery,
  //   variables: {
  //     id,
  //   },
  //   fetchPolicy: 'no-cache',
  //   context: {
  //     clientName: "uniswap",
  //   },
  // });

  // const { data: { liquidityPositionSnapshots } } = await client.query({
  //   query: liquidityPositionSnapshotsQuery,
  //   variables: {
  //     user,
  //   },
  //   fetchPolicy: 'no-cache',
  //   context: {
  //     clientName: "uniswap",
  //   },
  // });

  await client.cache.writeQuery({
    query: userQuery,
    variables: {
      id,
    },
    data: {
      user: {
        ...user,
        // liquidityPositions: [
        //   ...uniswapUser.liquidityPositions,
        //   ...user.liquidityPositions
        // ]
      },
    },
  });

  return await client.cache.readQuery({
    query: userQuery,
    variables: { id },
  });
}

// Blocks
async function getLatestBlock() {
  const date = startOfMinute(Date.now());
  const start = Math.floor(date / 1000);
  const end = Math.floor(date / 1000) - 600;

  const { data: blocksData } = await client.query({
    query: blockQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: "blocklytics",
    },
    fetchPolicy: "network-only",
  });

  return { number: Number(blocksData?.blocks[0].number) };
}

export async function getOneDayBlock(client = getApollo()) {
  const date = startOfMinute(subDays(Date.now(), 1));
  const start = Math.floor(date / 1000);
  const end = Math.floor(date / 1000) + 600;

  const { data: blocksData } = await client.query({
    query: blockQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: "blocklytics",
    },
    fetchPolicy: "network-only",
  });

  return { number: Number(blocksData?.blocks[0].number) };
}

export async function getTwoDayBlock(client = getApollo()) {
  const date = startOfMinute(subDays(Date.now(), 2));
  const start = Math.floor(date / 1000);
  const end = Math.floor(date / 1000) + 600;

  const { data: blocksData } = await client.query({
    query: blockQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: "blocklytics",
    },
    fetchPolicy: "network-only",
  });

  return { number: Number(blocksData?.blocks[0].number) };
}

export async function getSevenDayBlock(client = getApollo()) {
  const date = startOfMinute(subWeeks(Date.now(), 1));
  const start = Math.floor(date / 1000);
  const end = Math.floor(date / 1000) + 600;

  const { data: blocksData } = await client.query({
    query: blockQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: "blocklytics",
    },
    fetchPolicy: "network-only",
  });

  return { number: Number(blocksData?.blocks[0].number) };
}

// Eth Price
export async function getEthPrice(client = getApollo()) {
  const { data } = await client.query({
    query: ethPriceQuery,
  });

  await client.cache.writeQuery({
    query: ethPriceQuery,
    data,
  });

  return await client.cache.readQuery({
    query: ethPriceQuery,
  });
}

export async function getOneDayEthPrice(client = getApollo()) {
  const block = await getOneDayBlock();

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceTimeTravelQuery,
    variables: {
      block,
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: oneDayEthPriceQuery,
    data: {
      ethPrice: bundles[0]?.ethPrice,
    },
  });
}

export async function getSevenDayEthPrice(client = getApollo()) {
  const block = await getSevenDayBlock();

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceTimeTravelQuery,
    variables: {
      block,
    },
    fetchPolicy: "no-cache",
  });

  await client.cache.writeQuery({
    query: sevenDayEthPriceQuery,
    data: {
      ethPrice: bundles[0]?.ethPrice,
    },
  });
}

// Tokens

export async function getToken(id, client = getApollo()) {
  const {
    data: { token },
  } = await client.query({
    query: tokenQuery,
    fetchPolicy: "network-only",
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

  await client.cache.writeQuery({
    query: tokenQuery,
    variables: {
      id,
    },
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
    },
  });

  return await client.cache.readQuery({
    query: tokenQuery,
    variables: { id },
  });
}

export async function getTokens(client = getApollo()) {
  const {
    data: { tokens },
  } = await client.query({
    query: tokensQuery,
    fetchPolicy: "network-only",
  });

  const block = await getOneDayBlock();

  const {
    data: { tokens: oneDayTokens },
  } = await client.query({
    query: tokensTimeTravelQuery,
    variables: {
      block,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { tokens: sevenDayTokens },
  } = await client.query({
    query: tokensTimeTravelQuery,
    variables: {
      block: await getSevenDayBlock(),
    },
    fetchPolicy: "no-cache",
  });

  await client.writeQuery({
    query: tokensQuery,
    data: {
      tokens: tokens.map((token) => {
        const oneDayToken = oneDayTokens.find(({ id }) => token.id === id);
        const sevenDayToken = sevenDayTokens.find(({ id }) => token.id === id);
        return {
          ...token,
          oneDay: {
            volumeUSD: String(oneDayToken?.volumeUSD),
            derivedETH: String(oneDayToken?.derivedETH),
            liquidity: String(oneDayToken?.liquidity),
          },
          sevenDay: {
            volumeUSD: String(sevenDayToken?.volumeUSD),
            derivedETH: String(sevenDayToken?.derivedETH),
            liquidity: String(sevenDayToken?.liquidity),
          },
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: tokensQuery,
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
    fetchPolicy: "network-only",
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

  await client.cache.writeQuery({
    query: pairQuery,
    variables: {
      id,
    },
    data: {
      pair: {
        ...pair,
        oneDay: {
          untrackedVolumeUSD: String(oneDayPair?.untrackedVolumeUSD),
          volumeUSD: String(oneDayPair?.volumeUSD),
          reserveUSD: String(oneDayPair?.reserveUSD),
        },
        twoDay: {
          untrackedVolumeUSD: String(twoDayPair?.untrackedVolumeUSD),
          volumeUSD: String(twoDayPair?.volumeUSD),
          reserveUSD: String(twoDayPair?.reserveUSD),
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
    fetchPolicy: "network-only",
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
          },
          sevenDay: {
            untrackedVolumeUSD: String(sevenDayPair?.untrackedVolumeUSD),
            volumeUSD: String(sevenDayPair?.volumeUSD),
            reserveUSD: String(sevenDayPair?.reserveUSD),
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
