import { Avatar, Box } from "@material-ui/core";
import { currencyFormatter, decimalFormatter } from "app/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import AddressAvatar from "./AddressAvatar";
import Link from "./Link";
import React from "react";
import SortableTable from "./SortableTable";
import { deepPurple } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    margin: theme.spacing(3, 0),
  },
  avatar: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
    marginRight: theme.spacing(2),
  },
}));

export default function LiquidityProviderList({
  pool,
  title = "Liquidity Providers",
}) {
  const classes = useStyles();
  const theme = useTheme();
  const pair = pool.liquidityPair;
  const shareValueUSD = pair.reserveUSD / pair.totalSupply;
  return (
    <div className={classes.root}>
      <SortableTable
        title={title}
        orderBy="amount"
        columns={[
          {
            key: "address",
            label: "Liquidity Provider",
            render: (row) => (
              <Box display="flex" alignItems="center">
                <AddressAvatar address={row.address} />

                <Link
                  href={`https://etherscan.io/address/${row.address}`}
                  target="_blank"
                >
                  {row.address}
                </Link>
              </Box>
            ),
          },
          {
            key: "share",
            label: "Pool Share",
            align: "right",
            render: (row) =>
              `${((row.amount / pool.balance) * 100).toFixed(4)}%`,
          },
          {
            key: "amount",
            label: "Liquidity Tokens Staked",
            align: "right",
            render: (row) =>
              `${decimalFormatter.format(row.amount / 1e18)} SLP`,
          },
          {
            key: "value",
            label: "Liquidity Tokens Staked USD",
            align: "right",
            render: (row) =>
              currencyFormatter.format((row.amount / 1e18) * shareValueUSD),
          },
        ]}
        rows={pool.users}
      />
    </div>
  );
}
