import { Box, Card, CardContent, Grid, Typography } from "@material-ui/core";

import { Percent } from ".";
import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  content: {
    alignItems: "center",
    display: "flex",
  },
  title: {
    fontWeight: 500,
  },
  cardContent: {
    "&:last-child": {
      paddingBottom: 16,
    },
  },
}));

function KPI(props) {
  const classes = useStyles();
  const {
    className,
    title = "",
    difference = "",
    value = "",
    valueUSD = "",
    ...rest
  } = props;
  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
      variant="outlined"
    >
      <CardContent className={classes.cardContent}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>

            <Box display="flex">
              <Typography variant="subtitle1" color="textPrimary">
                {value}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {difference && <Percent marginLeft={1} percent={difference} />}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default KPI;
