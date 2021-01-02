import Head from 'next/head'
import React from 'react'
import useSWR from 'swr'

const [zero, odd, even] = ['snow', 'ivory', 'linen']
const bg = (idx, border = '1px solid black') => ({
	backgroundColor: idx ? (idx % 2 == 0 ? even : odd) : zero,
	border: border,
})

const REFRESH_API_MS = 2000

const jsonRequest = async (...args) => {
	const response = await fetch(...args)
	return response.ok && response.json()
}

// eslint-disable-next-line
function AnimeCells({ datum, index }) {
	const renderCell = (text) => {
		const nbsp = String(text) === ''
		return nbsp ? <tt>&nbsp;</tt> : <tt>{text}</tt>
	}
	return (
		<React.Fragment>
			<td>{renderCell(index)}</td>
			{Array.from(datum || [], (text, cell) => (
				<td key={9000 + index * 1000 + cell}>{renderCell(text)}</td>
			))}
		</React.Fragment>
	)
}

const table = ({ headers, raw }) => {
	const tableHeaded = (all = []) => {
		return (
			<tr style={bg(0)}>
				<th>&#35;</th>
				{Array.from(all, (one, index) => (
					<th key={`h${index + 1}`}>{one}</th>
				))}
			</tr>
		)
	}
	const tableHeadedRows = (all = []) => {
		return Array.from(all, (one, index) => (
			<tr key={`r${index + 1}`} style={bg(index + 1)}>
				<AnimeCells datum={one} index={index + 1} />
			</tr>
		))
	}

	return (
		<table style={{ border: '1px solid black' }}>
			<thead>{tableHeaded(headers)}</thead>
			<tbody>{tableHeadedRows(raw)}</tbody>
			<tfoot>{tableHeaded(headers)}</tfoot>
		</table>
	)
}

// eslint-disable-next-line
function Anime() {
	const { data, error } = useSWR('/api/party', jsonRequest, {
		refreshInterval: REFRESH_API_MS,
	})
	if (error) {
		console.error(error)
		return (
			<main>
				<span>Error! (please refresh)</span>
			</main>
		)
	}
	if (!data) {
		return (
			<main>
				<p>Loading...</p>
			</main>
		)
	}

	return (
		<>
			<Head>
				<title>Dio</title>
			</Head>
			<main id='container'>
				<h1>Anime Party 2020-10-17</h1>
				<p>
					<span>This page hits GET /api every {REFRESH_API_MS}ms...</span>
				</p>
				{table(data)}
				{/*
				<p>
					<tt>Raw: {data.raw}</tt>
				</p>
				*/}
				<footer>
					<p>
						<span>CSS not polished yet, sorry. Loaded: {new Date().toISOString()}</span>
					</p>
				</footer>
			</main>
		</>
	)
}

export default Anime
