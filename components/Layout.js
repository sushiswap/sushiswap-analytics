import {} from "@material-ui/core";

import {
  AccountTreeOutlined,
  Brightness4,
  Brightness4Outlined,
  Brightness7,
  DashboardOutlined,
  FastfoodOutlined,
  FiberNewOutlined,
  Menu,
  RadioButtonUncheckedOutlined,
  SettingsEthernetOutlined,
  TrendingDownOutlined,
  TrendingUpOutlined,
  WavesOutlined,
} from "@material-ui/icons";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { AppFooter, Sushi } from ".";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import React from "react";
import TextField from "@material-ui/core/TextField";
import { darkModeVar } from "app/core";
import { useReactiveVar } from "@apollo/client";
import { useRouter } from "next/router";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },

  logo: {
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-center",
    [theme.breakpoints.up("sm")]: {
      justifyContent: "flex-center",
    },
  },

  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    [theme.breakpoints.up("sm")]: {
      // width: `calc(100% - ${drawerWidth}px)`,
      // marginLeft: drawerWidth,
    },
    borderBottom:
      theme.palette.type === "light"
        ? "1px solid rgba(0, 0, 0, 0.12)"
        : "1px solid rgba(255, 255, 255, 0.12)",
  },
  title: {
    flexGrow: 1,
    textAlign: "center",
    [theme.breakpoints.up("sm")]: {
      textAlign: "left",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    background: "transparent",
    width: drawerWidth,
    border: 0,
  },
  drawerPaperMobile: {
    width: drawerWidth,
    border: 0,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    width: `calc(100% - ${drawerWidth}px)`,
  },
}));

function ResponsiveDrawer(props) {
  const { window, children } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const darkMode = useReactiveVar(darkModeVar);
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

  const [open, setOpen] = React.useState(false);

  const [address, setAddress] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <Hidden smUp implementation="css">
          <Box display="flex" alignItems="center" py={0.5}>
            <IconButton edge={false} onClick={() => router.push("/")}>
              <Sushi />
            </IconButton>
            <Typography variant="subtitle1" color="textPrimary" noWrap>
              SushiSwap Analytics
            </Typography>
          </Box>
        </Hidden>
      </div>
      <List direction="horizontal">
        {[
          { text: "Dashboard", icon: <DashboardOutlined />, url: "/" },
          {
            text: "Portfolio",
            icon: <AccountTreeOutlined />,
            url: "/portfolio",
          },
          { text: "Bar", icon: <FastfoodOutlined />, url: "/bar" },
          { text: "Pools", icon: <WavesOutlined />, url: "/pools" },
          { text: "Pairs", icon: <SettingsEthernetOutlined />, url: "/pairs" },
          {
            text: "Tokens",
            icon: <RadioButtonUncheckedOutlined />,
            url: "/tokens",
          },
          {
            text: "Gainers",
            icon: <TrendingUpOutlined />,
            url: "/gainers",
          },
          {
            text: "Losers",
            icon: <TrendingDownOutlined />,
            url: "/losers",
          },
          {
            text: "Recent",
            icon: <FiberNewOutlined />,
            url: "/recent",
          },
        ].map((item, index) => (
          <ListItem
            button
            key={item.text}
            selected={item.url === router.pathname}
            onClick={() => {
              if (item.url === "/portfolio") {
                handleClickOpen();
              } else {
                router.push(item.url);
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {/* <Divider /> */}
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const matches = useMediaQuery("(min-width:600px)");

  const page =
    router.pathname === "/" ? "Dashboard" : router.pathname.split("/")[1];

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        color="transparent"
        color="inherit"
        elevation={0}
        className={classes.appBar}
      >
        <Toolbar>
          <IconButton
            color="default"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <Menu />
          </IconButton>
          <div className={classes.logo}>
            <Hidden xsDown implementation="css">
              <Box display="flex" alignItems="center">
                <IconButton
                  edge={matches ? "start" : false}
                  onClick={() => router.push("/")}
                >
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
              onClick={toggleDarkMode}
              color="default"
              aria-label="theme toggle"
            >
              {!darkMode ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaperMobile,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Container maxWidth="xl">{children}</Container>
        <AppFooter />
      </main>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Portfolio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter an address and click load.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="address"
            label="Address"
            type="text"
            onChange={(event) => {
              setAddress(event.target.value);
            }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              router.push("/users/" + address);
              handleClose();
            }}
            color="primary"
          >
            Load
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ResponsiveDrawer;
