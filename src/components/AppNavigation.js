import {
  AccountTreeOutlined,
  AppsOutlined,
  Brightness4,
  Brightness4Outlined,
  Brightness7,
  CloseOutlined,
  DashboardOutlined,
  DetailsOutlined,
  ExpandLess,
  ExpandMore,
  FastfoodOutlined,
  FiberNewOutlined,
  HistoryOutlined,
  LinkOutlined,
  ListAltOutlined,
  Menu,
  MoneyOutlined,
  RadioButtonUncheckedOutlined,
  ReorderOutlined,
  SettingsEthernetOutlined,
  StarBorder,
  TrendingDownOutlined,
  TrendingUpOutlined,
  ViewStreamOutlined,
  WavesOutlined,
} from "@material-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Sushi from "./Sushi";
import { useRouter } from "next/router";
import LandscapeIcon from '@material-ui/icons/Landscape';
import StarIcon from '@material-ui/icons/Star';
import PetsIcon from '@material-ui/icons/Pets';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import TripOriginIcon from '@material-ui/icons/TripOrigin';
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import AppsIcon from '@material-ui/icons/Apps';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {},
  list: {
    // "& > *": {
    //   paddingLeft: theme.spacing(3),
    // },
  },
  nested: {
    paddingLeft: theme.spacing(3),
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
}));

export default function AppNavigation() {
  const classes = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [address, setAddress] = React.useState("");

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <div classes={classes.root}>
      <div className={classes.toolbar}>
        <Hidden smUp implementation="css">
          <Box display="flex" alignItems="center" py={0.5}>
            {/* <IconButton edge={false} onClick={() => router.push("/")}>
              <Sushi />
            </IconButton> */}
            <Typography variant="subtitle1" color="textPrimary" noWrap>
              Bone Analytics
            </Typography>
          </Box>
        </Hidden>
      </div>
      <List
        className={classes.list}
        // aria-labelledby="nested-list-subheader"
        // subheader={
        //   <ListSubheader component="div" id="nested-list-subheader">
        //     Overview
        //   </ListSubheader>
        // }
        direction="horizontal"
      >
        <ListItem
          key="/"
          button
          selected={router.pathname === "/"}
          onClick={() => router.push("/")}
        >
          <ListItemIcon>
            <LandscapeIcon />
          </ListItemIcon>
          <ListItemText primary="Dog Park" />
        </ListItem>

        <ListItem
          key="/bury-shib"
          button
          selected={router.pathname === "/bury-shib"}
          onClick={() => router.push("/bury-shib")}
        >
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Bury Shib" />
          {/* {open ? <ExpandLess /> : <ExpandMore />} */}
        </ListItem>

        <ListItem
          key="/bury-leash"
          button
          selected={router.pathname === "/bury-leash"}
          onClick={() => router.push("/bury-leash")}
        >
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Bury Leash" />
          {/* {open ? <ExpandLess /> : <ExpandMore />} */}
        </ListItem>


        <ListItem
          key="/bury-bone"
          button
          selected={router.pathname === "/bury-bone"}
          onClick={() => router.push("/bury-bone")}
        >
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Bury Bone" />
          {/* {open ? <ExpandLess /> : <ExpandMore />} */}
        </ListItem>

        {/*<ListItem*/}
        {/*  key="/bury-bone"*/}
        {/*  button*/}
        {/*  selected={router.pathname === "/bury-bone"}*/}
        {/*  onClick={() => router.push("/bury-bone")}*/}
        {/*>*/}
        {/*  <ListItemIcon>*/}
        {/*    <StarIcon />*/}
        {/*  </ListItemIcon>*/}
        {/*  <ListItemText primary="Bury Bone" />*/}
        {/*  /!* {open ? <ExpandLess /> : <ExpandMore />} *!/*/}
        {/*</ListItem>*/}

        {/* <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              key="/bar"
              button
              selected={router.pathname === "/bar"}
              onClick={() => router.push("/bar")}
              className={classes.nested}
            >
              <ListItemIcon>
                <ViewStreamOutlined />
              </ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItem>
            <ListItem button className={classes.nested}>
              <ListItemIcon>
                <HistoryOutlined />
              </ListItemIcon>
              <ListItemText primary="Past Servings" />
            </ListItem>
          </List>
        </Collapse> */}

        <ListItem button>
          <ListItemIcon>
            <PetsIcon />
          </ListItemIcon>
          <ListItemText primary="WOOF Pools" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              selected={router.pathname === "/pools/recent"}
              onClick={() => router.push("/pools/recent")}
              className={classes.nested}
            >
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
              <ListItemText primary="Recent" />
            </ListItem>
            <ListItem
              button
              selected={router.pathname === "/pools"}
              onClick={() => router.push("/pools")}
              className={classes.nested}
            >
              <ListItemIcon>
                <TripOriginIcon />
              </ListItemIcon>
              <ListItemText primary="All" />
            </ListItem>

            {/* <ListItem
              button
              selected={router.pathname === "/pools/gainers"}
              onClick={() => router.push("/pools/gainers")}
              className={classes.nested}
            >
              <ListItemIcon>
                <TrendingUpOutlined />
              </ListItemIcon>
              <ListItemText primary="Gainers" />
            </ListItem>
            <ListItem
              button
              selected={router.pathname === "/pools/losers"}
              onClick={() => router.push("/pools/losers")}
              className={classes.nested}
            >
              <ListItemIcon>
                <TrendingDownOutlined />
              </ListItemIcon>
              <ListItemText primary="Losers" />
            </ListItem> */}
          </List>
        </Collapse>

        <ListItem button>
          <ListItemIcon>
            <ViewAgendaIcon />
          </ListItemIcon>
          <ListItemText primary="Pairs" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              selected={router.pathname === "/pairs/recent"}
              onClick={() => router.push("/pairs/recent")}
              className={classes.nested}
            >
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
              <ListItemText primary="Recent" />
            </ListItem>
            <ListItem
              button
              selected={router.pathname === "/pairs"}
              onClick={() => router.push("/pairs")}
              className={classes.nested}
            >
              <ListItemIcon>
                <TripOriginIcon />
              </ListItemIcon>
              <ListItemText primary="All" />
            </ListItem>

            <ListItem
              button
              selected={router.pathname === "/pairs/gainers"}
              onClick={() => router.push("/pairs/gainers")}
              className={classes.nested}
            >
              <ListItemIcon>
                <TrendingUpIcon />
              </ListItemIcon>
              <ListItemText primary="Doggos" />
            </ListItem>
            <ListItem
              button
              selected={router.pathname === "/pairs/losers"}
              onClick={() => router.push("/pairs/losers")}
              className={classes.nested}
            >
              <ListItemIcon>
                <TrendingDownIcon />
              </ListItemIcon>
              <ListItemText primary="Puppies" />
            </ListItem>
          </List>
        </Collapse>
        <ListItem
          key="/tokens"
          button
          selected={router.pathname.includes("tokens")}
          onClick={() => router.push("/tokens")}
        >
          <ListItemIcon>
            <AppsIcon />
          </ListItemIcon>
          <ListItemText primary="Tokens" />
        </ListItem>
        <ListItem
          button
          key="/portfolio"
          selected={router.pathname.includes("/portfolio")}
          onClick={() => {
            const defaultAddress = localStorage.getItem("defaultAddress");
            if (defaultAddress) {
              router.push("/users/" + defaultAddress);
            } else {
              handleClickOpen();
            }
          }}
        >
          <ListItemIcon>
            <RemoveRedEyeIcon />
          </ListItemIcon>
          <ListItemText primary="Portfolio" />
        </ListItem>
      </List>
      <Dialog
        maxWidth="sm"
        open={dialogOpen}
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
              localStorage.setItem("defaultAddress", address);
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
