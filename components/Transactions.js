import { currencyFormatter, decimalFormatter } from "../intl";

import Link from "./Link";
import Paper from "@material-ui/core/Paper";
import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "./TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import formatDistance from "date-fns/formatDistance";
import { makeStyles } from "@material-ui/core/styles";

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

export default function Transactions({ transactions, txCount }) {
  const classes = useStyles();

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("timestamp");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const rows = [
    ...transactions.swaps,
    ...transactions.mints,
    ...transactions.burns,
  ].map((transaction) => {
    if (transaction.__typename === "Swap") {
      return {
        ...transaction,
        amount0:
          transaction.amount0In === "0"
            ? transaction.amount1In
            : transaction.amount0In,
        amount1:
          transaction.amount1Out === "0"
            ? transaction.amount0Out
            : transaction.amount1Out,
      };
    }

    return transaction;
  });

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, txCount - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const now = new Date();

  return (
    <div className={classes.root}>
      <Typography variant="h6" component="h2" gutterBottom>
        Transactions
      </Typography>
      <TableContainer
        className={classes.paper}
        component={Paper}
        variant="outlined"
      >
        <Table className={classes.table} aria-label="transactions table">
          <TableHead
            headCells={[
              {
                id: "__typename",
                numeric: false,
                label: "Type",
              },
              {
                id: "amountUSD",
                numeric: true,
                label: "Value",
              },
              {
                id: "amount0",
                numeric: true,
                label: "In",
              },
              {
                id: "amount1",
                numeric: true,
                label: "Out",
              },
              {
                id: "to",
                numeric: false,
                label: "To",
              },
              {
                id: "timestamp",
                numeric: true,
                label: "Time",
              },
            ]}
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={txCount}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow key={row.id}>
                    <TableCell component="th" id={labelId} scope="row">
                      <Typography variant="body2" noWrap>
                        {row.__typename}{" "}
                        {row.amount0In === "0"
                          ? row.pair.token1.symbol
                          : row.pair.token0.symbol}{" "}
                        for{" "}
                        {row.amount1Out === "0"
                          ? row.pair.token0.symbol
                          : row.pair.token1.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(row.amountUSD)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" noWrap>
                        {decimalFormatter.format(row.amount0)}{" "}
                        {row.amount1In === "0"
                          ? row.pair.token0.symbol
                          : row.pair.token1.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" noWrap>
                        {decimalFormatter.format(row.amount1)}{" "}
                        {row.amount0Out === "0"
                          ? row.pair.token1.symbol
                          : row.pair.token0.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        <Link href={`https://etherscan.io/address/${row.to}`}>
                          {row.to}
                        </Link>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" noWrap>
                        {formatDistance(now, new Date(row.timestamp * 1000))}{" "}
                        ago
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, , { label: "All", value: -1 }]}
        component="div"
        count={Number(txCount)}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
}
