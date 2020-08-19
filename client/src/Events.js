import React from "react";
import { Table } from 'react-bootstrap';
import { useTable } from "react-table";

// Creates the table for events
export function EventTable({data}) {
	const columns = React.useMemo(
	() => [
		{
			Header: 'Index',
			accessor: 'index',
		},
		{
			Header: 'Address',
			accessor: 'address',
		},
		{
			Header: 'State',
			accessor: 'state',
		},
	],
		[]
	);

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  // Render the UI for your table
  return (
    <Table striped bordered hover {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  );
}
