import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { pairsQuery, tokensQuery } from "../operations";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";

export default function Search() {
  const router = useRouter();
  const {
    data: { pairs },
    loading: pairsLoading,
  } = useQuery(pairsQuery);

  const {
    data: { tokens },
    loading: tokensLoading,
  } = useQuery(tokensQuery);

  // const [offset, setOffset] = useState(0);

  // const [limit, setLimit] = useState(200);

  const options = [
    // ...pairs.slice(offset, limit),
    // ...tokens.slice(offset, limit),
    ...pairs,
    ...tokens,
  ].map((option) => {
    return {
      __typename: option.__typename,
      id: option.id,
      text: option.name
        ? `${option.name} ${option.symbol}`
        : `${option.token0?.symbol}-${option.token1?.symbol}`,
    };
  });

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option) => option.text,
  });

  return (
    <Autocomplete
      id="search"
      filterOptions={filterOptions}
      options={options.sort((a, b) => {
        if (a.__typename === "Token" && b.__typename === "Pair") {
          return -1;
        }
      })}
      groupBy={(option) => option.__typename}
      getOptionLabel={(option) => option.text}
      style={{ width: "100%" }}
      onChange={(e, v) => {
        router.push(`/${v.__typename.toLowerCase()}s/${v.id}`);
      }}
      loading={pairsLoading || tokensLoading}
      renderInput={(params) => (
        <TextField {...params} label="Search" variant="outlined" size="small" />
      )}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.text, inputValue);
        const parts = parse(option.text, matches);
        return (
          <div>
            {parts.map((part, index) => (
              <span
                key={index}
                style={{ fontWeight: part.highlight ? 700 : 400 }}
              >
                {part.text}
              </span>
            ))}
          </div>
        );
      }}
    />
  );
}
