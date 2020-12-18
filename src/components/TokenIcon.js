import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import { useMemo } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(2),
  },
}));

export default function TokenIcon({ id, ...rest }) {
  const classes = useStyles();
  const src = useMemo(
    () =>
      `https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
        id
      )}/logo.png`,
    [id]
  );
  return (
    <Avatar
      classes={{ root: classes.root }}
      imgProps={{ loading: "lazy" }}
      src={src}
      {...rest}
    />
  );
}
