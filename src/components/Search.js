import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { Box, TextField } from "@material-ui/core";
/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { pairsQuery, tokensQuery } from "../core";

import PairIcon from "./PairIcon";
import { TokenIcon } from "app/components";
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
      token0: option.token0 ? option.token0.id : "",
      token1: option.token1 ? option.token1.id : "",
      text: option.name
        ? ` ${option.symbol} ${option.name}`
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
        <TextField
          {...params}
          label="Looking for something?"
          variant="outlined"
          size="small"
        />
      )}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.text, inputValue);
        const parts = parse(option.text, matches);
        return (
          <Box display="flex" alignItems="center">
            {option.__typename === "Token" ? (
              <TokenIcon id={option.id} />
            ) : (
              <PairIcon base={option.token0} quote={option.token1} />
            )}
            {parts.map((part, index) => (
              <span
                key={index}
                style={{ fontWeight: part.highlight ? 700 : 400 }}
              >
                {part.text}
              </span>
            ))}
          </Box>
        );
      }}
    />
  );
}
