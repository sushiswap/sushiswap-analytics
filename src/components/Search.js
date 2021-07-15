import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ListSubheader from '@material-ui/core/ListSubheader';
import { FixedSizeList } from 'react-window';
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import PairIcon from "./PairIcon";
import TokenIcon from "./TokenIcon";
import { useRouter } from "next/router";
import { Box } from '@material-ui/core';

const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 55;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 60;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={itemSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

export default function Search({ pairs, tokens }) {
  const router = useRouter();

  const options = [
    // ...pairs.slice(offset, limit),
    // ...tokens.slice(offset, limit),
    ...pairs,
    ...tokens
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
  })

  return (
    <Autocomplete
      id="search"
      style={{ width: "100%" }}
      disableListWrap
      ListboxComponent={ListboxComponent}
      renderGroup={renderGroup}
      onChange={(e, v) => {
        router.push(`/${v.__typename.toLowerCase()}s/${v.id}`);
      }}
      options={options.sort((a, b) => {
        if (a.__typename === "Token" && b.__typename === "Pair") {
          return -1;
        }
      })}
      groupBy={(option) => option.__typename}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Looking for something?"
          variant="outlined"
          size="small"
        />
      )}
      getOptionLabel={(option) => option.text}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.text, inputValue);
        const parts = parse(option.text, matches);
        return (
          <Box display="flex" alignItems="center">
            {option.__typename === "Token" ? <TokenIcon id={option.id} /> : <PairIcon base={option.token0} quote={option.token1} />}
            {parts.map((part, index) => {
              return (
                <span
                  key={index}
                  style={{ fontWeight: part.highlight ? 700 : 400, whiteSpace: "pre-wrap" }}
                >
                  {part.text}
                </span>
              )
            })}
          </Box>
        );
      }}
    />
  );
}