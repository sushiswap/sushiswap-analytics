import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

export default function BasicTable({ title, headCells, bodyCells, style }) {
  return (
    <div>
      {title && (
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      <TableContainer variant="outlined">
        <Table aria-label="information">
          <TableHead>
            <TableRow key={Date.now()}>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.key}
                  align={cell.align || "left"}
                  style={{ maxWidth: cell.maxWidth || "initial" }}
                >
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={Date.now()}>
              {bodyCells.map((cell, index) => (
                <TableCell
                  key={index}
                  {...(index === 0 ? { component: "th", scope: "row" } : {})}
                  align={headCells[index].align || "left"}
                  style={{ maxWidth: headCells[index].maxWidth || "initial" }}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
