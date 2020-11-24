import { blockQuery, blocksQuery, getApollo, latestBlockQuery } from "app/core";
import {
  differenceInSeconds,
  getUnixTime,
  parseISO,
  startOfHour,
  startOfMinute,
  startOfSecond,
  subDays,
  subHours,
  subWeeks,
} from "date-fns";

export async function getLatestBlock(client = getApollo()) {
  const { data } = await client.query({
    query: latestBlockQuery,
    context: {
      clientName: "blocklytics",
    },
  });
  return data;
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
  // Course timestamps used to make better use of the cache (startOfHour + startOfMinuite + startOfSecond)
  const now = startOfSecond(startOfMinute(startOfHour(Date.now())));
  const start = getUnixTime(subHours(now, 6));
  const end = getUnixTime(now);
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

  const averageBlockTime = blocks.reduce(
    (previousValue, currentValue, currentIndex) => {
      if (previousValue.timestamp) {
        const difference = previousValue.timestamp - currentValue.timestamp;

        previousValue.difference = previousValue.difference + difference;
      }

      previousValue.timestamp = currentValue.timestamp;

      if (currentIndex === blocks.length - 1) {
        return previousValue.difference / blocks.length;
      }

      return previousValue;
    },
    { timestamp: null, difference: 0 }
  );

  return averageBlockTime;
}
