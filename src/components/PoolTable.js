import { Box, Divider, Typography } from "@material-ui/core";
import { formatCurrency, formatDecimal } from "app/core";

import Link from "./Link";
import PairIcon from "./PairIcon";
import Percent from "./Percent";
import React from "react";
import SortableTable from "./SortableTable";
import TokenIcon from "./TokenIcon";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

export default function PoolTable({ pools, ...rest }) {
  const classes = useStyles();

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
              const name = `${row.liquidityPair?.token0?.symbol}-${row.liquidityPair?.token1?.symbol}`;
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
            render: (row) =>
              `${Number(row.rewardPerThousand).toFixed(2)} SUSHI per day`,
          },
          {
            key: "roi",
            label: "Yearly / Monthly / Daily ROI",
            render: (row) => (
              <Typography variant="subtitle2" noWrap>
                <Percent
                  percent={Number(row.roiPerYear * 100).toFixed(2)}
                  display="inline"
                />{" "}
                / {Number(row.roiPerMonth * 100).toFixed(2)}% /{" "}
                {Number(row.roiPerDay * 100).toFixed(2)}%
              </Typography>
            ),
          },

          {
            key: "reserve0",
            label: "Base Reserve",
            render: (row) => (
              <Box display="flex">
                <TokenIcon
                  id={row.liquidityPair?.token0?.id}
                  className={classes.small}
                />
                <Typography variant="subtitle2" noWrap>
                  {formatDecimal(row.liquidityPair?.reserve0)}{" "}
                  {row.liquidityPair?.token0?.symbol}
                </Typography>
              </Box>
            ),
          },
          {
            key: "reserve1",
            label: "Quote Reserve",
            render: (row) => (
              <Box display="flex">
                <TokenIcon
                  id={row.liquidityPair?.token1?.id}
                  className={classes.small}
                />
                <Typography variant="subtitle2" noWrap>
                  {formatDecimal(row.liquidityPair?.reserve1)}{" "}
                  {row.liquidityPair?.token1?.symbol}
                </Typography>
              </Box>
            ),
          },
          {
            key: "tvl",
            label: "TVL",
            align: "right",
            render: (row) => formatCurrency(row.tvl),
          },
        ]}
        rows={pools}
        {...rest}
      />
    </div>
  );
}
