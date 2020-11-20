import { Box, Divider, Typography } from "@material-ui/core";
import { Link, PairIcon, Percent, SortableTable, TokenIcon } from ".";

import React from "react";
import { formatCurrency } from "app/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

export default function PoolTable({ pools, ...rest }) {
  const classes = useStyles();

  // const rows = pools.map((pool) => ({
  //   ...pool,
  //   tvl: pool.pair.reserveUSD,
  // }));

  const rows = pools;

  return (
    <div className={classes.root}>
      <SortableTable
        title="Pools"
        // orderBy={orderBy}
        // order={order}
        columns={[
          // {
          //   key: "id",
          //   label: "#",
          // },
          {
            key: "name",
            label: "Name",
            render: (row, index) => {
              const name = `${row.liquidityPair?.token0?.symbol.replace(
                "WETH",
                "ETH"
              )}-${row.liquidityPair?.token1?.symbol.replace("WETH", "ETH")}`;
              return (
                <Box display="flex" alignItems="center">
                  <PairIcon
                    base={row.liquidityPair?.token0?.id}
                    quote={row.liquidityPair?.token1?.id}
                  />
                  <Link href={`/pools/${row.id}`} variant="body2" noWrap>
                    {name}
                  </Link>
                </Box>
              );
            },
          },
          // {
          //   key: "balance",
          //   label: "Staked",
          //   align: "right",
          //   render: (row) => Number(row.staked/1e18).toFixed(2),
          // },
          // {
          //   key: "roiPerHour",
          //   label: "ROI (Hour)",
          //   align: "right",
          //   render: (row) => Number(row.roiPerHour) * 1000,
          // },
          {
            key: "rewardPerThousand",
            label: "Reward per $1000",
            align: "right",
            render: (row) =>
              `${Number(row.rewardPerThousand * 24 * 1000).toFixed(
                2
              )} SUSHI per day`,
          },
          {
            key: "roi",
            label: "ROI",
            align: "right",
            render: (row) => (
              <div>
                <Typography variant="subtitle2">
                  Daily:{" "}
                  <Percent
                    percent={Number(row.roiPerDay * 3 * 100).toFixed(2)}
                    display="inline"
                  />
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Monthly: {Number(row.roiPerMonth * 3 * 100).toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Yearly: {Number(row.roiPerYear * 3 * 100).toFixed(2)}%
                </Typography>
              </div>
            ),
          },
          {
            key: "tvl",
            label: "TVL",
            align: "right",
            render: (row) => formatCurrency(row.tvl),
          },
          {
            key: "tokens",
            label: "Reserves",
            align: "left",
            render: (row) => (
              <div>
                <Box display="flex" alignItems="center">
                  <TokenIcon
                    id={row.liquidityPair?.token0?.id}
                    className={classes.small}
                  />
                  <Typography variant="subtitle2">
                    {Number(row.liquidityPair?.reserve0).toFixed(2)}{" "}
                    {row.liquidityPair?.token0?.symbol}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <TokenIcon
                    id={row.liquidityPair?.token1?.id}
                    className={classes.small}
                  />
                  <Typography variant="subtitle2">
                    {Number(row.liquidityPair?.reserve1).toFixed(2)}{" "}
                    {row.liquidityPair?.token1?.symbol}
                  </Typography>
                </Box>
              </div>
            ),
          },
        ]}
        rows={rows}
        {...rest}
      />
    </div>
  );
}
