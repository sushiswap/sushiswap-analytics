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
import {BONE_TOKEN_ADDRESS} from "app/core/constants";

export async function getFactory(client = getApollo()) {
  const {
    data: { factory },
  } = await client.query({
    query: factoryQuery,
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
    data: { factory: twoDay },
  } = await client.query({
    query: factoryTimeTravelQuery,
    variables: {
      block: await getTwoDayBlock(),
    },
  });

  await client.cache.writeQuery({
    query: factoryQuery,
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
  });
}

export async function getSushiToken(client = getApollo()) {
  return await getToken(BONE_TOKEN_ADDRESS, client);
}

export async function getShibToken(client = getApollo()) {
  return await getToken("0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", client);
}

export async function getBoneToken(client = getApollo()) {
  return await getToken(BONE_TOKEN_ADDRESS, client);
}

export async function getLeashToken(client = getApollo()) {
  return await getToken("0x27c70cd1946795b66be9d954418546998b546634", client);
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
