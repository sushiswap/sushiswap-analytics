import React from "react";
import MuiAvatar from "@material-ui/core/Avatar";
import { toChecksumAddress } from "web3-utils";

export default function Avatar(props) {
  return (  <MuiAvatar
      imgProps={{ loading: "lazy" }}
      src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
        props.address
      )}/logo.png`}
      {...props}
    />)
}
