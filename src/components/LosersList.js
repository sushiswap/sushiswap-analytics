import { Box, Typography } from "@material-ui/core";

import Link from "./Link";
import PairIcon from "./PairIcon";
import React from "react";
import SortableTable from "./SortableTable";
import { formatCurrency } from "app/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
  lost: {
    color: theme.palette.negative.main,
  },
}));

export default function LosersList({ pairs }) {
  const classes = useStyles();
  const rows = pairs;
  return (
    <div className={classes.root}>
      <SortableTable
        title="Losers (24h)"
        orderBy="feesUSDLost"
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
            key: "feesUSDLost",
            label: "Fees USD Lost",
            align: "right",
            render: (row) => (
              <Typography className={classes.lost} noWrap>
                {formatCurrency(row.feesUSDLost - row.feesUSDLostYesterday)}
              </Typography>
            ),
          },
          {
            key: "volumeUSDLost",
            label: "Volume USD Lost",
            align: "right",
            render: (row) => (
              <Typography className={classes.lost} noWrap>
                -{formatCurrency(row.volumeUSDLost)}
              </Typography>
            ),
          },
          {
            key: "reserveUSDLost",
            label: "Liquidity USD Lost",
            align: "right",
            render: (row) => (
              <Typography className={classes.lost} noWrap>
                {formatCurrency(row.reserveUSDLost)}
              </Typography>
            ),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
