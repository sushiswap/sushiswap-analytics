import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(3),
  },
}));

export default function PageHeader({ children }) {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
}
