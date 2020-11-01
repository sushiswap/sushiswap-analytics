import {
  blockQuery,
  ethPriceTimeTravelQuery,
  oneDayEthPriceQuery,
  pairQuery,
  pairTimeTravelQuery,
  pairsQuery,
  pairsTimeTravelQuery,
  tokenPairsQuery,
  tokenQuery,
  tokenTimeTravelQuery,
  tokensQuery,
  tokensTimeTravelQuery,
  uniswapUserQuery,
  userQuery,
} from "../operations";
import { startOfMinute, subDays, subWeeks } from "date-fns";

import { getApollo } from "../apollo";

export async function getLiquidityPositionSnapshots(user, client = getApollo()) {
  const { data: { liquidityPositionSnapshots } } = await client.query({
    query: liquidityPositionSnapshotsQuery,
    variables: {
      user,
    },
  });
}

export async function getUser(id, client = getApollo()) {
  const { data: { user } } = await client.query({
    query: userQuery,
    variables: {
      id,
    },
  });

  const { data: { uniswapUser } } = await client.query({
    query: uniswapUserQuery,
    variables: {
      id,
    },
    fetchPolicy: 'no-cache',
    context: {
      clientName: "uniswap",
    },
  });

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
async function getEthPrice(client = getApollo()) {
  await client.query({
    query: ethPriceQuery,
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

  await client.writeQuery({
    query: tokensQuery,
    data: {
      tokens: tokens.map((token) => {
        const oneDayToken = oneDayTokens.find(({ id }) => token.id === id);
        return {
          ...token,
          oneDay: {
            volumeUSD: String(oneDayToken?.volumeUSD),
            derivedETH: String(oneDayToken?.derivedETH),
            liquidity: String(oneDayToken?.liquidity),
          },
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: tokensQuery,
  });
}

async function getOneDayTokens() {}

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
          volumeUSD: String(oneDayPair?.volumeUSD),
          reserveUSD: String(oneDayPair?.reserveUSD),
        },
        twoDay: {
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
