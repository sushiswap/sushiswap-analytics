import { buryLeashHistoriesQuery, buryLeashQuery, buryLeashUserQuery } from "../queries/bury-leash";

import { getApollo } from "../apollo";

export async function getBuryLeash(client = getApollo()) {
  const { data } = await client.query({
    query: buryLeashQuery,
    context: {
      clientName: "buryLeash",
    },
  });

  await client.cache.writeQuery({
    query: buryLeashQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryLeashQuery,
  });
}

export async function getBuryLeashHistories(client = getApollo()) {
  const { data } = await client.query({
    query: buryLeashHistoriesQuery,
    context: {
      clientName: "buryLeash",
    },
  });

  await client.cache.writeQuery({
    query: buryLeashHistoriesQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryLeashHistoriesQuery,
  });
}

export async function getBuryLeashUser(id, client = getApollo()) {
  const { data } = await client.query({
    query: buryLeashUserQuery,
    variables: {
      id,
    },
    context: {
      clientName: "buryLeash",
    },
  });

  await client.cache.writeQuery({
    query: buryLeashUserQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryLeashUserQuery,
  });
}
