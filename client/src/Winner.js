import React from "react";
import { Table } from 'react-bootstrap';
import { useTable } from "react-table";

export function WinnerTable({data}) {
	const columns = React.useMemo(
		() => [
			{
				Header: 'Index',
				accessor: 'index',
			},
			{
				Header: 'Verified',
				accessor: 'verified',
			},
			{
				Header: 'Winner',
				accessor: 'winner',
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

	if (!data.length)
		return (
			<></>
		);

	// Render the UI for your table
	return (
		<>
			<h4>Leaderboard</h4>
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
		</>
	);
}
