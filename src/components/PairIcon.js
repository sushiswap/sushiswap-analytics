import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import TokenIcon from "./TokenIcon";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import { useMemo } from "react";

const useStyles = makeStyles((theme) => ({
  root: {},
  token: {
    marginRight: 0,
  },
  tokens: {
    marginRight: theme.spacing(2),
  },
}));

export default function PairIcon({ base, quote }) {
  const classes = useStyles();
  return (
    <AvatarGroup className={classes.tokens}>
      {[base, quote].map((id) => (
        <TokenIcon key={id} id={id} className={classes.token} />
      ))}
    </AvatarGroup>
  );
}
