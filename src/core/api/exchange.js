import {
  dayDatasQuery,
  factoryQuery,
  factoryTimeTravelQuery,
  tokenQuery,
  tokenTimeTravelQuery,
  tokensQuery,
  tokensTimeTravelQuery,
} from "../queries/exchange";
import {
  getOneDayBlock,
  getSevenDayBlock,
  getTwoDayBlock,
} from "../api/blocks";

import { getApollo } from "../apollo";
import { FACTORY_ADDRESS, STND_ADDRESS } from "../constants";
import { getNetwork } from "core/state";

export async function getFactory(client = getApollo(), chainId = getNetwork()) {
  const {
    data: { factory },
  } = await client.query({
    query: factoryQuery,
    variables: {
      id: FACTORY_ADDRESS[chainId],
    },
  });

  const {
    data: { factory: oneDay },
  } = await client.query({
    query: factoryTimeTravelQuery,
    variables: {
      id: FACTORY_ADDRESS[chainId],
      block: await getOneDayBlock(),
    },
  });

  const {
    data: { factory: twoDay },
  } = await client.query({
    query: factoryTimeTravelQuery,
    variables: {
      id: FACTORY_ADDRESS[chainId],
      block: await getTwoDayBlock(),
    },
  });

  await client.cache.writeQuery({
    query: factoryQuery,
    variables: {
      id: FACTORY_ADDRESS[chainId],
    },
    data: {
      factory: {
        ...factory,
        oneDay,
        twoDay,
      },
    },
  });

  return await client.cache.readQuery({
    query: factoryQuery,
    variables: {
      id: FACTORY_ADDRESS[chainId],
    },
  });
}

export async function getSushiToken(
  client = getApollo(),
  chainId = getNetwork()
) {
  return await getToken(STND_ADDRESS[chainId], client);
}

export async function getDayData(client = getApollo()) {
  const { data } = await client.query({
    query: dayDatasQuery,
  });

  await client.cache.writeQuery({
    query: dayDatasQuery,
    data,
  });

  return await client.cache.readQuery({
    query: dayDatasQuery,
  });
}

// Tokens

export async function getToken(id, client = getApollo()) {
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
