import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  TablePagination,
  SxProps,
  Theme,
} from '@mui/material';
import get from 'lodash/get';
import React, { ReactNode } from 'react';

export interface Column<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  pagination?: boolean;
  title?: string;
  sx?: SxProps<Theme>;
  rowSx?: (item: T) => SxProps<Theme> | undefined;
}

export const DataTable = <T,>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  keyExtractor,
  onRowClick,
  pagination = false,
  title,
  sx,
  rowSx,
}: DataTableProps<T>) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const displayData = pagination
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: pagination ? 440 : undefined }}>
        <Table stickyHeader aria-label={title || 'data table'}>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.length > 0 ? (
              displayData.map((row, index) => {
                const key = keyExtractor(row);
                const reactKey = typeof key === 'symbol' ? `symbol-${index}` : String(key);
                return (
                  <TableRow
                    hover
                    key={reactKey}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:last-child td, &:last-child th': { border: 0 },
                      ...(rowSx ? rowSx(row) : {}),
                    }}
                  >
                    {columns.map(column => {
                      const value = get(row, column.id);
                      return (
                        <TableCell key={`${reactKey}-${String(column.id)}`} align={column.align}>
                          {column.format
                            ? column.format(value, row)
                            : value != null
                              ? typeof value === 'symbol'
                                ? value.toString()
                                : String(value)
                              : ''}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default DataTable;
