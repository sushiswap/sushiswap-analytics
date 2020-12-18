import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
}));

export default function PageHeader({ children }) {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
}
