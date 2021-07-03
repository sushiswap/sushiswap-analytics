import { buryShibHistoriesQuery, buryShibQuery, buryShibUserQuery } from "../queries/bury-shib";

import { getApollo } from "../apollo";

export async function getBuryShib(client = getApollo()) {
  const { data } = await client.query({
    query: buryShibQuery,
    context: {
      clientName: "buryShib",
    },
  });

  await client.cache.writeQuery({
    query: buryShibQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryShibQuery,
  });
}

export async function getBuryShibHistories(client = getApollo()) {
  const { data } = await client.query({
    query: buryShibHistoriesQuery,
    context: {
      clientName: "buryShib",
    },
  });

  await client.cache.writeQuery({
    query: buryShibHistoriesQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryShibHistoriesQuery,
  });
}

export async function getBuryShibUser(id, client = getApollo()) {
  const { data } = await client.query({
    query: buryShibUserQuery,
    variables: {
      id,
    },
    context: {
      clientName: "buryShib",
    },
  });

  await client.cache.writeQuery({
    query: buryShibUserQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryShibUserQuery,
  });
}
