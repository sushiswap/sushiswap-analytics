import React from "react";
import { AppShell } from "app/components";
import {
  Grid,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    height: '500px',
    fontWeight: 'bold',
  },
  progress: {
    textAlign: 'center',
    minHeight: '50px',
  },
}));

export default function Loading() {
  const classes = useStyles();

  return (
    <AppShell>
      <Grid
        container
        justify="center"
        alignContent="center"
        direction="column"
        className={classes.container}
      >
        <Grid item className={classes.progress}><CircularProgress /></Grid>
        <Grid item>Loading...</Grid>
      </Grid>
    </AppShell>
  );
}
