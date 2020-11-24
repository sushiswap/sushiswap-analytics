import { barHistoriesQuery, barQuery, barUserQuery, getApollo } from "app/core";

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
    context: {
      clientName: "bar",
    },
  });

  await client.cache.writeQuery({
    query: barUserQuery,
    data,
  });

  return await client.cache.readQuery({
    query: barUserQuery,
  });
}
