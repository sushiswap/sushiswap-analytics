import React, { useCallback, useEffect, useRef, useState } from "react";

import Chart from "./Chart";
import Typography from "@material-ui/core/Typography";
import { currencyFormatter } from "../intl";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    height: 300,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  legend: {
    position: "absolute",
    padding: theme.spacing(1),
    textAlign: "left",
    zIndex: 1000,
    pointerEvents: "none",
  },
}));

const Legend = React.forwardRef(function Legend({ title, price, date }, ref) {
  const classes = useStyles();
  return (
    <div ref={ref} className={classes.legend}>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h5" component="strong" color="textPrimary">
        {price}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {date}
      </Typography>
    </div>
  );
});

export default function DashboardChart({ data, type, title, numeric }) {
  const classes = useStyles();
  const chart = useRef();

  const [legendPrice, setLegendPrice] = useState("");
  const [legendDate, setLegendDate] = useState("");

  const dataRef = useRef();

  useEffect(() => {
    dataRef.current = data;
  });

  function setLegend(price, time) {
    setLegendPrice(
      numeric ? price.toFixed(2) : currencyFormatter.format(price)
    );
    setLegendDate(`${time.year}-${time.month}-${time.day}`);
  }

  React.useEffect(() => {
    setLegend(data[data.length - 1].value, data[data.length - 1].time);
  }, [data]);

  const onCrosshairMove = useCallback(
    (param, price) => {
      const data = dataRef.current;
      if (
        param === undefined ||
        param.time === undefined ||
        param.point.x < 0 ||
        param.point.x > chart.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chart.current.clientHeight
      ) {
        setLegend(data[data.length - 1].value, data[data.length - 1].time);
      } else {
        setLegend(price, param.time);
      }
    },
    [dataRef]
  );

  return (
    <div className={classes.root}>
      <Legend
        title={title}
        price={legendPrice}
        date={legendDate}
        className={classes.legend}
      />
      <Chart
        ref={chart}
        data={data}
        type={type}
        onCrosshairMove={onCrosshairMove}
      />
    </div>
  );
}
