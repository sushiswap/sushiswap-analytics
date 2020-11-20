import { Avatar } from "@material-ui/core";
import { deepPurple } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  avatar: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
    marginRight: theme.spacing(2),
  },
}));

export default function AddressAvatar(props) {
  const classes = useStyles();
  return (
    <Avatar variant="rounded" className={classes.avatar}>
      {props.address.slice(0, 3)}
    </Avatar>
  );
}
