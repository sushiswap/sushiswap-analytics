import {
  gainersQuery,
  getApollo,
  getOneDayBlock,
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
