import { buryBoneHistoriesQuery, buryBoneQuery, buryBoneUserQuery } from "../queries/bury-bone";

import { getApollo } from "../apollo";

export async function getBuryBone(client = getApollo()) {
  const { data } = await client.query({
    query: buryBoneQuery,
    context: {
      clientName: "buryBone",
    },
  });

  await client.cache.writeQuery({
    query: buryBoneQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryBoneQuery,
  });
}

export async function getBuryBoneHistories(client = getApollo()) {
  const { data } = await client.query({
    query: buryBoneHistoriesQuery,
    context: {
      clientName: "buryBone",
    },
  });

  await client.cache.writeQuery({
    query: buryBoneHistoriesQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryBoneHistoriesQuery,
  });
}

export async function getBuryBoneUser(id, client = getApollo()) {
  const { data } = await client.query({
    query: buryBoneUserQuery,
    variables: {
      id,
    },
    context: {
      clientName: "buryBone",
    },
  });

  await client.cache.writeQuery({
    query: buryBoneUserQuery,
    data,
  });

  return await client.cache.readQuery({
    query: buryBoneUserQuery,
  });
}
