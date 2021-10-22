import { Box } from "@material-ui/core";
import Link from "./Link";
import PairIcon from "./PairIcon";
import Percent from "./Percent";
import React from "react";
import SortableTable from "./SortableTable";
import { currencyFormatter, decimalFormatter } from "app/core";
import { makeStyles } from "@material-ui/core/styles";

// const useStyles = makeStyles((theme) => ({
//   root: {},
// }));

export default function PairTable({ pairs: rows, ethPrice, title, ...rest }) {
  //   const classes = useStyles();

  return (
    <div>
      <SortableTable
        orderBy="reserveUSD"
        title={title}
        {...rest}
        columns={[
          {
            key: "displayName",
            numeric: false,
            render: (row) => {
              const name = `${row.pair?.token0?.symbol}-${row.pair?.token1?.symbol}`;
              return (
                <Box display="flex" alignItems="center">
                  <PairIcon base={row.pair?.token0} quote={row.pair?.token1} />
                  <Link href={`/dividend/${row.id}`} variant="body2" noWrap>
                    {name}
                  </Link>
                </Box>
              );
            },
            label: "Name",
          },
          {
            key: "remainingReward",
            render: (row) =>
              !Number.isNaN(row.remainingReward)
                ? parseInt(row.remainingReward)
                : 0,
            align: "right",
            label: "Remaining Reward (LTR)",
          },
          {
            key: "remainingRewardUSD",
            render: (row) => currencyFormatter.format(row.remainingRewardUSD),
            align: "right",
            label: "Remaining Reward (USD)",
          },
          {
            key: "claimedReward",
            render: (row) =>
              !Number.isNaN(row.claimedReward)
                ? parseInt(row.claimedReward)
                : 0,
            align: "right",
            label: "Claimed Reward (LTR)",
          },
          {
            key: "claimedRewardUSD",
            render: (row) => currencyFormatter.format(row.claimedRewardUSD),
            align: "right",
            label: "Claimed Reward (USD)",
          },
          {
            key: "totalRewardShare",
            render: (row) => <Percent percent={row.totalRewardShare * 100} />,
            align: "right",
            label: "Total Reward Shsare",
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
