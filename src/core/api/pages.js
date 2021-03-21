import {
  gainersQuery,
  getApollo,
  getOneDayBlock,
  getTwoDayBlock,
  losersQuery,
  pairsTimeTravelQuery,
} from "app/core";

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
        const volumeUSDLost = pair.volumeUSD - oneDayPair?.volumeUSD;
        const feesUSDLost = volumeUSDLost * 0.003;
        const reserveUSDLost = pair.reserveUSD - oneDayPair?.reserveUSD;
        return {
          ...pair,
          feesUSDLost,
          volumeUSDLost,
          reserveUSDLost,
        };
      }),
    },
  });

  return await client.cache.readQuery({
    query: losersQuery,
  });
}
