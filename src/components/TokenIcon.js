import { Avatar } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import { useMemo, useState } from "react";
import { ChainId } from "app/core/constants";
import { useNetwork } from "state/network/hooks";
import { getNetwork } from "core/state";

const BAD_SRCS = {};

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(2),
    // background: "transparent",
    color: theme.palette.text.secondary,
  },
}));

const getTokenUrls = (chainId, id, symbol) => {
  const urls = [];
  if (symbol)
    urls.push(
      `https://raw.githubusercontent.com/digitalnativeinc/icons/master/token/${symbol.toLowerCase()}.jpg`
    );
  urls.push(
    `https://raw.githubusercontent.com/digitalnativeinc/assets/master/blockchains/${chainId}/assets/${toChecksumAddress(
      id
    )}/logo.png`
  );
  return urls;
};

export default function TokenIcon({ id, symbol, ...rest }) {
  const [, refresh] = useState(0);
  const srcs = getTokenUrls(chainId, id, symbol);
  const src = srcs.find((src) => !BAD_SRCS[src]);
  const classes = useStyles();
  const chainId = useNetwork();

  const errorHandler = () => {
    if (src) BAD_SRCS[src] = true;
    refresh((i) => i + 1);
  };

  return (
    <Avatar
      classes={{ root: classes.root }}
      src={src}
      imgProps={{
        onError: errorHandler,
      }}
      {...rest}
    />
  );
}
