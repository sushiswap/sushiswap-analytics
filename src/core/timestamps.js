import { getUnixTime, startOfDay, subMonths, subWeeks } from "date-fns";

export function oneMonth() {
  return getUnixTime(startOfDay(subMonths(Date.now(), 1)));
}

export function oneWeek() {
  return getUnixTime(startOfDay(subWeeks(Date.now(), 1)));
}
