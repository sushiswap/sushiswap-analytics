import { makeVar } from "@apollo/client";

export const darkModeVar = makeVar(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("darkMode") === "true"
    : false
);
