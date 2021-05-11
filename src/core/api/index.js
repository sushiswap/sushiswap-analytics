import {
  ethPriceQuery,
  ethPriceTimeTravelQuery,
  getApollo,
  getOneDayBlock,
  getSevenDayBlock,
  oneDayEthPriceQuery,
  sevenDayEthPriceQuery,
  getTokens,
  getPairs,
} from "app/core";

export * from "./bar";
export * from "./blocks";
export * from "./exchange";
export * from "./masterchef";
export * from "./pages";

export async function preload() {
  // Pre-load anything that might be needed globally (stuff for search bar etc...)
  await getTokens();
  await getPairs();
}

export async function getLiquidityPositionSnapshots(
  user,
  client = getApollo()
) {
  await client.query({
    query: liquidityPositionSnapshotsQuery,
    variables: {
      user,
    },
  });
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
