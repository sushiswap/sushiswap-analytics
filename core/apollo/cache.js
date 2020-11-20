import { InMemoryCache } from "@apollo/client";
import { darkModeVar } from "./variables";

export default new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        darkMode() {
          return darkModeVar();
        },
      },
    },
  },
});
