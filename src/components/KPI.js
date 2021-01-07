import { Box, Card, CardContent, Grid, Typography } from "@material-ui/core";

import Percent from "./Percent";
import React from "react";
import clsx from "clsx";
import { formatCurrency } from "app/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },

  cardContent: {
    // textAlign: "center",
    "&:last-child": {
      paddingBottom: 16,
    },
  },
  title: {
    fontWeight: 500,
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
}));

const formatters = {
  none: (value) => value,
  percent: (value) => (!Number.isNaN(value) ? `${value.toFixed(2)}%` : `0%`),
  integer: (value) => (!Number.isNaN(value) ? parseInt(value) : 0),
  currency: (value) => (!Number.isNaN(value) ? formatCurrency(value) : `$0`),
};

function KPI({
  className,
  title = "",
  difference = "",
  value = "",
  valueUSD = "",
  format = "none",
  ...rest
}) {
  const classes = useStyles();

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
      variant="outlined"
    >
      <CardContent className={classes.cardContent}>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          gutterBottom
          noWrap
          className={classes.title}
        >
          {title}
        </Typography>
        <div className={classes.content}>
          <Typography variant="h6" color="textPrimary" noWrap>
            {/* {!Number.isNaN(value) ? value : 0} */}
            {formatters[format](value)}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" noWrap>
            {difference && !Number.isNaN(difference) ? (
              <Percent marginLeft={1} percent={difference} />
            ) : null}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}

export default KPI;
