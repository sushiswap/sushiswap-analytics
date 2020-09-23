import { deepPurple, purple } from "@material-ui/core/colors";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { darkModeVar } from "../apollo/variables";
import { fade } from "@material-ui/core/styles/colorManipulator";
import millify from "millify";
import { palette } from "../theme";
import usePrevious from "../hooks/usePrevious";
import { useReactiveVar } from "@apollo/client";

function Chart(
  {
    data,
    options = {
      chart: {
        localization: {
          priceFormatter: (value) => "$" + millify(value, { precision: 2 }),
        },
        layout: {
          backgroundColor: "rgba(255,255,255, 0)",
        },
        priceScale: {
          autoScale: true,
          mode: 0,
          invertScale: false,
          alignLabels: true,
          borderVisible: false,
          entireTextOnly: true,
          position: "right",
          visible: true,
          drawTicks: true,
          scaleMargins: {
            bottom: 0,
            top: 0.3,
          },
        },
        overlayPriceScales: {
          visible: true,
        },
        timeScale: {
          autoScale: true,
          borderVisible: false,
          visible: true,
          timeVisible: false,
          secondsVisible: false,
        },
        crosshair: {
          mode: 0,
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            visible: false,
            style: 0,
            width: 3,
            color: fade(palette.primary.main, 0.1),
            labelVisible: false,
          },
        },
        grid: {
          horzLines: {
            color: fade(palette.primary.main, 0.05),
            visible: false,
          },
          vertLines: {
            color: fade(palette.primary.main, 0.05),
            visible: false,
          },
        },
        handleScroll: false,
        handleScale: false,
      },
      area: {
        lastValueVisible: false,
        autoscaleInfoProvider: (original) => {
          const res = original();
          if (res.priceRange !== null) {
            res.priceRange.minValue = 0;
          }
          return res;
        },
        topColor: fade(palette.primary.main, 0.5),
        bottomColor: fade(palette.primary.main, 0.01),
        lineColor: palette.primary.main,
      },
      histogram: {
        lastValueVisible: false,
        color: palette.primary.main,
      },
    },
    type,
    onCrosshairMove = undefined,
  },
  forwardedRef
) {
  const darkMode = useReactiveVar(darkModeVar);

  const container = useRef(null);
  const chart = useRef(null);
  const series = useRef(null);
  const timeScale = useRef(null);
  const ref = useRef(null);

  const prevData = usePrevious(data);
  const prevType = usePrevious(type);

  var darkTheme = {
    chart: {
      layout: {
        textColor: "#fff",
      },
    },
  };

  const lightTheme = {
    chart: {
      layout: {
        textColor: "rgba(0, 0, 0, 0.87)",
      },
    },
  };

  var themesData = {
    dark: darkTheme,
    light: lightTheme,
  };

  function syncToTheme(theme) {
    try {
      chart.current.applyOptions(themesData[theme].chart);
      // areaSeries.applyOptions(themesData[theme].series);
    } catch (error) {
      // silence
    }
  }

  useEffect(() => {
    syncToTheme(darkMode ? "dark" : "light");
  }, [darkMode]);

  useImperativeHandle(forwardedRef, () => ({
    series: series.current,
    chart: chart.current,
    timeScale: timeScale.current,
    el: ref.current,
  }));

  function onMove(param) {
    onCrosshairMove(param, param.seriesPrices.get(series.current));
  }

  useEffect(() => {
    const { createChart } = require("lightweight-charts");

    options.chart.layout.textColor = document.documentElement.style.color;

    chart.current = createChart(ref.current, {
      ...options.chart,
      width: ref.current.parentNode.clientWidth,
      height: ref.current.parentNode.offsetHeight,
      // rightPriceScale: {
      //   ...options.chart.rightPriceScale,
      //   scaleMargins: {
      //     top: 0.25,
      //     bottom: type === "area" ? 0.25 : 0,
      //   },
      // },
    });

    if (type === "area") {
      series.current = chart.current.addAreaSeries(options.area);
    } else if (type === "histogram") {
      series.current = chart.current.addHistogramSeries(options.histogram);
    }

    series.current.setData(data);

    timeScale.current = chart.current.timeScale();

    chart.current.timeScale().fitContent();
    chart.current.timeScale().resetTimeScale();
    chart.current.timeScale().scrollToPosition(0, false);

    function onResize(entries) {
      chart.current.resize(
        entries[0].contentRect.width,
        entries[0].contentRect.height
      );
      chart.current.timeScale().fitContent();
    }

    if (onCrosshairMove) {
      // console.log("subscribe crosshair move");
      chart.current.subscribeCrosshairMove(onMove);
    }

    const resizeObserver = new ResizeObserver(onResize);

    resizeObserver.observe(container.current);

    return function () {
      if (container.current !== null) {
        resizeObserver.unobserve(container.current);
      }

      if (onCrosshairMove) {
        chart.current.unsubscribeCrosshairMove(onMove);
      }

      chart.current.remove();
    };
  }, []);

  useEffect(() => {
    if (chart.current && data !== prevData) {
      // console.log(
      //   "This should change when chartApi available, and data changes"
      // );

      if (series.current) {
        chart.current.removeSeries(series.current);

        if (type === "area") {
          // console.log("Add area series");
          series.current = chart.current.addAreaSeries(options.area);
          // chart.current.timeScale().setVisibleLogicalRange({
          //   from: 0.5,
          //   to: data.length - 1.5,
          // });
        } else if (type === "histogram") {
          // console.log("Add histogram series");
          series.current = chart.current.addHistogramSeries(options.histogram);
        }

        series.current.setData(data);
      }

      // chartApi.applyOptions({
      //   rightPriceScale: {
      //     ...options.chart.rightPriceScale,
      //     // scaleMargins: {
      //     //   top: 0.25,
      //     //   bottom: type === "area" ? 0.25 : 0,
      //     // },
      //   },
      // });

      chart.current.timeScale().fitContent();
      chart.current.timeScale().resetTimeScale();
      chart.current.timeScale().scrollToPosition(0, false);
    }
  }, [chart, prevData, data]);

  return (
    <div
      ref={container}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 250,
        height: "100%",
      }}
    >
      <div ref={ref} />
    </div>
  );
}

export default forwardRef(Chart);
