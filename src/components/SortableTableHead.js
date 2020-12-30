import {
  Hidden,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@material-ui/core";

import React from "react";

export default function SortableTableHead({
  classes,
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  columns,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.key}
            align={column.align || "left"}
            padding={column.disablePadding ? "none" : "default"}
            // variant="head"
            sortDirection={orderBy === column.key ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.key}
              direction={orderBy === column.key ? order : "asc"}
              onClick={createSortHandler(column.key)}
            >
              {column.label}

              {orderBy === column.key ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
