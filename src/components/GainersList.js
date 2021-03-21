import { Box, Typography } from "@material-ui/core";

import Link from "./Link";
import PairIcon from "./PairIcon";
import React from "react";
import SortableTable from "./SortableTable";
import TokenIcon from "./TokenIcon";
import { formatCurrency } from "app/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
  gained: {
    color: theme.palette.positive.main,
  },
}));

export default function GainersList({ pairs }) {
  const classes = useStyles();
  const rows = pairs;
  return (
    <div className={classes.root}>
      <SortableTable
        title="Gainers (24h)"
        orderBy="feesUSDGained"
        order="desc"
        columns={[
          {
            key: "name",
            label: "Name",
            render: (row, index) => (
              <Box display="flex" alignItems="center">
                <PairIcon base={row.token0.id} quote={row.token1.id} />
                <Link href={`/pairs/${row.id}`} variant="body2" noWrap>
                  {`${row.token0.symbol.replace(
                    "WETH",
                    "ETH"
                  )}-${row.token1.symbol.replace("WETH", "ETH")}`}
                </Link>
              </Box>
            ),
          },
          {
            key: "feesUSDGained",
            label: "Fees USD Gained",
            align: "right",
            render: (row, index) => (
              <div className={classes.gained}>
                +{formatCurrency(row.feesUSDGained - row.feesUSDGainedYesterday)}
              </div>
            ),
          },
          {
            key: "volumeUSDGained",
            label: "Volume USD Gained",
            align: "right",
            render: (row, index) => (
              <div className={classes.gained}>
                +{formatCurrency(row.volumeUSDGained)}
              </div>
            ),
          },
          {
            key: "reserveUSDGained",
            label: "Liquidity USD Gained",
            align: "right",
            render: (row, index) => (
              <div className={classes.gained}>
                +{formatCurrency(row.reserveUSDGained)}
              </div>
            ),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
