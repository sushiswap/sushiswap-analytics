import {
  blueGrey,
  deepOrange,
  deepPurple,
  green,
  grey,
  orange,
  purple,
  red,
} from "@material-ui/core/colors";

import { createMuiTheme } from "@material-ui/core/styles";

export const palette = {
  primary: {
    main: deepPurple[400],
  },
  secondary: {
    main: deepPurple.A200,
  },
  error: {
    main: red.A400,
  },
  positive: {
    main: green[500],
  },
  negative: {
    main: red[500],
  },

  seaweed: {
    main: blueGrey[800],
  },
  rice: {
    main: "white",
  },
  filling: {
    main: red.A400,
  },

  // Used by `getContrastText()` to maximize the contrast between
  // the background and the text.
  contrastThreshold: 3,
  // Used by the functions below to shift a color's luminance by approximately
  // two indexes within its tonal palette.
  // E.g., shift from Red 500 to Red 300 or Red 700.
  tonalOffset: 0.2,
};

const fontFamily = [
  "Inter",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Oxygen",
  "Ubuntu",
  "Cantarell",
  "Fira Sans",
  "Droid Sans",
  "Helvetica Neue",
  "sans-serif",
];

const overrides = {
  MuiTable: {
    root: {
      "& > tbody > tr:last-child > *": { border: 0 },
    },
  },
};

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      default: blueGrey[900],
      paper: blueGrey[900],
    },
    ...palette,
  },
  typography: {
    fontFamily,
  },
  overrides,
});

export const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    background: {
      default: grey[50],
    },
    ...palette,
  },
  typography: {
    fontFamily,
  },
  overrides,
});
