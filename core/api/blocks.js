import { blockQuery, blocksQuery, getApollo } from "app/core";
import {
  startOfHour,
  startOfMinute,
  subDays,
  subHours,
  subWeeks,
} from "date-fns";

export async function getLatestBlock() {
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

export async function getAverageBlockTime(client = getApollo()) {
  const now = startOfHour(Date.now());
  const start = Math.floor(startOfMinute(subHours(now, 1)) / 1000);
  const end = Math.floor(now) / 1000;

  const {
    data: { blocks },
  } = await client.query({
    query: blocksQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: "blocklytics",
    },
  });

  const { averageBlockTime } = blocks.reduce(
    (previousValue, currentValue, currentIndex) => {
      if (previousValue.timestamp) {
        const difference = previousValue.timestamp - currentValue.timestamp;

        previousValue.averageBlockTime =
          previousValue.averageBlockTime + difference / currentIndex + 1;
      }

      previousValue.timestamp = currentValue.timestamp;

      return previousValue;
    },
    { timestamp: null, averageBlockTime: 12 }
  );

  return averageBlockTime;
}
