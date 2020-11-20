import {
  AppBar,
  Box,
  Container,
  Hidden,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Brightness4, Brightness7 } from "@material-ui/icons";
import { Link, Sushi } from ".";
import { gql, useQuery, useReactiveVar } from "@apollo/client";

import React from "react";
import { darkModeVar } from "app/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRouter } from "next/router";

// import useDarkMode from "../hooks/useDarkMode.js.bk";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    // flexGrow: 1,
    marginRight: theme.spacing(4),
  },
  links: {
    flexGrow: 1,
    "& > * + *": {
      marginLeft: theme.spacing(4),
    },
  },
}));

export default function ButtonAppBar() {
  const classes = useStyles();

  const darkMode = useReactiveVar(darkModeVar);
  const router = useRouter();
  function toggleDarkMode() {
    // console.log("toggleDarkMode");
    const value = !darkModeVar();
    darkModeVar(value);
    if (!value) {
      document.documentElement.classList.remove("dark-theme");
      // document.documentElement.style.background = "#fafafa";
      document.documentElement.style.color = "rgba(0, 0, 0, 0.87)";
      // document.body.style.background = "#fafafa";
      // document.body.style.color = "rgba(0, 0, 0, 0.87)";
    } else {
      document.documentElement.classList.add("dark-theme");
      // document.documentElement.style.background = "#303030";
      document.documentElement.style.color = "#FFFFFF";
      // document.body.style.background = "#303030";
      // document.body.style.color = "#FFFFFF";
    }
    // Last
    localStorage.setItem("darkMode", value);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={() => router.push("/")}
            >
              <Sushi />
            </IconButton>

            <Hidden smDown implementation="css">
              <Box className={classes.title}>SushiSwap Analytics</Box>
            </Hidden>

            <Box className={classes.links}>
              <Link href="/">Dashboard</Link>
              <Link href="/pairs">Pairs</Link>
              <Link href="/tokens">Tokens</Link>
            </Box>
            <Tooltip title="Toggle theme" enterDelay={300}>
              <IconButton
                edge="end"
                onClick={toggleDarkMode}
                color="default"
                aria-label="theme toggle"
              >
                {!darkMode ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}
