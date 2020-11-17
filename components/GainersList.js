import { Box, Typography } from "@material-ui/core";
import { Link, PairIcon, SortableTable, TokenIcon } from ".";

import React from "react";
import { formatCurrency } from "app/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
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
        orderBy="reserveUSDGained"
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
            key: "reserveUSDGained",
            label: "Liquidity USD Gained",
            align: "right",
            render: (row, index) => (
              <div className={classes.gained}>
                +{formatCurrency(row.reserveUSDGained)}
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
        ]}
        rows={rows}
      />
    </div>
  );
}
