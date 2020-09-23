import React, { useState } from "react";

import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import Link from "./Link";
import { PAIR_DENY } from "../constants";
import Paper from "@material-ui/core/Paper";
import Percent from "./Percent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "./TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import { currencyFormatter } from "../intl";
import { getApollo } from "../apollo";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
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
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  avatar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
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

export default function PairTable({ pairs }) {
  const classes = useStyles();

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("reserveUSD");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const rows = pairs
    .filter((row) => {
      return !PAIR_DENY.includes(row.id);
    })
    .map((pair) => {
      const oneDayVolume = pair?.volumeUSD - pair?.oneDay?.volumeUSD;
      const oneDayFees = oneDayVolume * 0.003;
      const oneYearFees = (oneDayVolume * 0.003 * 365 * 100) / pair.reserveUSD;
      const sevenDayVolume = pair?.volumeUSD - pair?.sevenDay?.volumeUSD;
      return {
        ...pair,
        displayName: `${pair.token0.symbol.replace(
          "WETH",
          "ETH"
        )}-${pair.token1.symbol.replace("WETH", "ETH")}`,
        oneDayVolume: !Number.isNaN(oneDayVolume) ? oneDayVolume : 0,
        sevenDayVolume: !Number.isNaN(sevenDayVolume) ? sevenDayVolume : 0,
        oneDayFees: !Number.isNaN(oneDayFees) ? oneDayFees : 0,
        oneYearFees,
      };
    });

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <TableContainer
        className={classes.paper}
        component={Paper}
        variant="outlined"
      >
        <Table className={classes.table} aria-label="pairs table">
          <TableHead
            headCells={[
              {
                id: "displayName",
                numeric: false,
                label: "Name",
              },
              {
                id: "reserveUSD",
                numeric: true,
                label: "Liquidity",
              },
              {
                id: "oneDayVolume",
                numeric: true,
                label: "Volume (24h)",
              },
              {
                id: "sevenDayVolume",
                numeric: true,
                label: "Volume (7d)",
              },
              {
                id: "oneDayFees",
                numeric: true,
                label: "Fees (24h)",
              },
              {
                id: "oneYearFees",
                numeric: true,
                label: "Fees (Yearly)",
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
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow key={row.id}>
                    <TableCell component="th" id={labelId} scope="row">
                      <Box display="flex" alignItems="center">
                        {index + 1}.
                        <AvatarGroup className={classes.avatar}>
                          <Avatar
                            imgProps={{ loading: "lazy" }}
                            alt={row.token0.symbol}
                            src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                              row.token0.id
                            )}/logo.png`}
                          />
                          <Avatar
                            imgProps={{ loading: "lazy" }}
                            alt={row.token1.symbol}
                            src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
                              row.token1.id
                            )}/logo.png`}
                          />
                        </AvatarGroup>
                        <Link href={`/pairs/${row.id}`} variant="body2" noWrap>
                          {row.displayName}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.reserveUSD)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.oneDayVolume)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.sevenDayVolume)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.oneDayFees)}
                    </TableCell>
                    <TableCell align="right">
                      <Percent percent={row.oneYearFees} />
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
