import {
  Box,
  Container,
  Drawer,
  Hidden,
  IconButton,
  AppBar as MuiAppBar,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import {
  Brightness4Outlined,
  Brightness7Outlined,
  CloseOutlined,
  Menu,
} from "@material-ui/icons";
import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import Sushi from "./Sushi";
import clsx from "clsx";
import { darkModeVar } from "app/core";
import useDetect from "../core/hooks/useDetect";
import { useReactiveVar } from "@apollo/client";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up("sm")]: {
      // width: `calc(100% - ${drawerWidth}px)`,
      // marginLeft: drawerWidth,
    },
    borderBottom:
      theme.palette.type === "light"
        ? "1px solid rgba(5, 7, 9, 0.12)"
        : "1px solid rgba(255, 255, 255, 0.12)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    // margin: "0 auto",
    justifyContent: "flex-start",
    // textAlign: "center",
    // [theme.breakpoints.up("sm")]: {
    //   justifyContent: "flex-center",
    // },
    [theme.breakpoints.up("sm")]: {
      justifyContent: "start",
    },
  },

  logoCentered: {
    justifyContent: "center",
  },

  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

export default function AppBar({
  children,
  onToggleSidebar,
  open,
  mobileOpen,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const darkMode = useReactiveVar(darkModeVar);
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  function onToggleDarkMode() {
    // console.log("toggleDarkMode");
    const value = !darkModeVar();
    darkModeVar(value);
    if (!value) {
      document.documentElement.classList.remove(["dark-theme"]);
      // document.documentElement.style.background = "#fafafa";
      document.documentElement.style.color = "rgba(0, 0, 0, 0.87)";
      // document.body.style.background = "#fafafa";
      // document.body.style.color = "rgba(0, 0, 0, 0.87)";
    } else {
      document.documentElement.classList.add(["dark-theme"]);
      // document.documentElement.style.background = "#303030";
      document.documentElement.style.color = "#FFFFFF";
      // document.body.style.background = "#303030";
      // document.body.style.color = "#FFFFFF";
    }
    // Last
    localStorage.setItem("darkMode", value);
  }

  const page =
    router.pathname === "/" ? "Dashboard" : router.pathname.split("/")[1];
  const { isDesktop } = useDetect();
  return (
    <MuiAppBar
      position="fixed"
      color="transparent"
      color="inherit"
      elevation={0}
      className={classes.root}
    >
      <Toolbar>
        <IconButton
          color="default"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          className={classes.menuButton}
        >
          {(open && isDesktop) || (mobileOpen && !matches) ? (
            <CloseOutlined />
          ) : (
            <Menu />
          )}
          {/* {!matches && open ? <CloseOutlined /> : <Menu />} */}
        </IconButton>
        <div
          className={clsx(classes.logo, {
            [classes.logoCentered]: !open && matches,
          })}
        >
          <Hidden xsDown implementation="css">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-around"
            >
              <IconButton edge={false} onClick={() => router.push("/")}>
                <Sushi />
              </IconButton>
              <Typography variant="subtitle1" color="textPrimary" noWrap>
                SushiSwap Analytics
              </Typography>
            </Box>
          </Hidden>
          <Typography
            variant="h6"
            color="textPrimary"
            noWrap
            style={{ marginLeft: 8, marginRight: 8 }}
          >
            /
          </Typography>
          <Typography variant="subtitle1" color="textPrimary" noWrap>
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </Typography>
        </div>
        <Tooltip title="Toggle theme" enterDelay={300}>
          <IconButton
            edge="end"
            onClick={onToggleDarkMode}
            color="default"
            aria-label="theme toggle"
          >
            {!darkMode ? <Brightness4Outlined /> : <Brightness7Outlined />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </MuiAppBar>
  );
}
