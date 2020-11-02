import { ethPriceQuery, oneDayEthPriceQuery, tokensQuery } from "../operations";
import { getOneDayEthPrice, getTokens } from "../api";

import Avatar from "./Avatar";
import Box from "@material-ui/core/Box";
import Link from "./Link";
import Paper from "@material-ui/core/Paper";
import Percent from "./Percent";
import React from "react";
import { TOKEN_DENY } from "../constants";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "./TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { currencyFormatter } from "../intl";
import { getApollo } from "../apollo";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import useInterval from "../hooks/useInterval";
import { useQuery } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  avatar: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

function descendingComparator(a, b, orderBy) {
  a = Number.isNaN(parseFloat(a[orderBy]))
    ? a[orderBy]
    : parseFloat(a[orderBy]);
  b = Number.isNaN(parseFloat(b[orderBy]))
    ? b[orderBy]
    : parseFloat(b[orderBy]);

  if (b < a) {
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function TokenTable({ tokens }) {
  const classes = useStyles();

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("totalLiquidityUSD");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const {
    data: { bundles },
  } = useQuery(ethPriceQuery, {
    pollInterval: 60000,
  });

  const { data: oneDayEthPriceData } = useQuery(oneDayEthPriceQuery);

  const rows = tokens
    .filter(({ id }) => {
      return !TOKEN_DENY.includes(id);
    })
    .map((token) => {
      const price =
        parseFloat(token.derivedETH) * parseFloat(bundles[0]?.ethPrice);

      const priceYesterday =
        parseFloat(token.oneDay?.derivedETH) *
        parseFloat(oneDayEthPriceData?.ethPrice);

      const priceChange = ((price - priceYesterday) / priceYesterday) * 100;

      const liquidityUSD =
        parseFloat(token?.liquidity) *
        parseFloat(token?.derivedETH) *
        parseFloat(bundles[0]?.ethPrice);

      const volumeYesterday = token.volumeUSD - token.oneDay?.volumeUSD;

      return {
        ...token,
        price,
        priceYesterday: !Number.isNaN(priceYesterday) ? priceYesterday : 0,
        priceChange,
        liquidityUSD: liquidityUSD || 0,
        volumeYesterday: !Number.isNaN(volumeYesterday) ? volumeYesterday : 0,
      };
    });

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <TableContainer
        component={Paper}
        className={classes.paper}
        variant="outlined"
      >
        <Table className={classes.table} aria-label="pairs table">
          <TableHead
            headCells={[
              {
                id: "name",
                numeric: false,
                label: "Name",
              },
              {
                id: "symbol",
                numeric: false,
                label: "Symbol",
              },
              {
                id: "liquidityUSD",
                numeric: true,
                label: "Liquidity",
              },
              {
                id: "volumeYesterday",
                numeric: true,
                label: "Volume (24h)",
              },
              {
                id: "price",
                numeric: true,
                label: "Price",
              },
              // {
              //   id: "priceYesterday",
              //   numeric: true,
              //   label: "Price (Yesterday)",
              // },
              {
                id: "priceChange",
                numeric: true,
                label: "Price Change (24h)",
              },
            ]}
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy))
              .filter((row) => {
                return !TOKEN_DENY.includes(row.id);
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      <Box display="flex" alignItems="center">
                        <span> {index + 1}. </span>
                        <Avatar
                          className={classes.avatar}
                          alt={row.symbol}
                          address={row.id}
                        />
                        <Link href={`/tokens/${row.id}`}>
                          <Typography variant="body2" noWrap>
                            {row.name}
                          </Typography>
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>{row.symbol}</TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.liquidityUSD)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.volumeYesterday)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.price)}
                    </TableCell>
                    {/* <TableCell align="right">
                      {currencyFormatter.format(row.priceYesterday)}
                    </TableCell> */}
                    <TableCell align="right">
                      <Percent percent={row.priceChange} />
                    </TableCell>
                  </TableRow>
                );
              })}

            {/* {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )} */}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, , { label: "All", value: -1 }]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
}
