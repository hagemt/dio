//import { URL } from 'url'

import Head from 'next/head'
import Konami from 'konami'
import React from 'react'
import Types from 'prop-types'
import useSWR from 'swr'

import { Alert, Badge, Container, Nav, Navbar, Table } from 'react-bootstrap'

const ALL_BORDER_CSS = '1px solid black'
const REFRESH_API_MS = 2000

//const [zero, odd, even] = ['snow', 'ivory', 'linen']
const bg = (idx, border = ALL_BORDER_CSS) => ({
	//backgroundColor: idx ? (idx % 2 == 0 ? even : odd) : zero,
	border: border,
})

const jsonRequest = async (...args) => {
	jsonRequest.justBefore = new Date()
	const response = await fetch(...args)
	return response.ok && response.json()
}

const AnimeTable = ({ columns, raw }) => {
	const renderCell = (text) => {
		const isEmpty = !text || String(text).trim() === ''
		return isEmpty ? <tt>&nbsp;</tt> : <tt>{text}</tt>
	}
	const renderZero = (all = []) => {
		return (
			<tr style={bg(0)}>
				<th>&#35;</th>
				{Array.from(all, (one, index) => (
					<th key={`h${index + 1}`}>{one}</th>
				))}
			</tr>
		)
	}
	const renderData = (all = []) => {
		return Array.from(all, (one, index) => (
			<tr key={`r${index + 1}`} style={bg(index + 1)}>
				<td>{renderCell(index + 1)}</td>
				{Array.from(one || [], (text, cell) => (
					<td key={9000 + index * 1000 + cell}>{renderCell(text)}</td>
				))}
			</tr>
		))
	}

	return (
		<Table bordered hover striped>
			<thead>{renderZero(columns)}</thead>
			<tbody>{renderData(raw)}</tbody>
			<tfoot>{renderZero(columns)}</tfoot>
		</Table>
	)
}

AnimeTable.propTypes = {
	columns: Types.arrayOf(Types.string),
	raw: Types.arrayOf(Types.arrayOf(Types.string)),
}

const AnimeParty = ({ api, csv, egg, refreshInterval, tsv }) => {
	const { data, error } = useSWR(api, jsonRequest, {
		refreshInterval,
	})
	if (error) {
		console.error(error)
		return (
			<Container className="p-3" fluid="sm">
				<Alert variant="warning">Oops! (please refresh)</Alert>
			</Container>
		)
	}
	if (!data) {
		return (
			<Container className="p-3" fluid="sm">
				<Alert variant="light">Loading...</Alert>
			</Container>
		)
	}
	const when = jsonRequest.justBefore || new Date()
	const took = 1 + (new Date() - when) // load duration in ms
	if (egg) new Konami(egg) // https://en.wikipedia.org/wiki/Konami_Code

	return (
		<>
			<Head>
				<title>Dio</title>
			</Head>
			<Navbar bg="light" expand="md">
				<Navbar.Brand href="/">Dio</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse>
					<Nav activeKey="#">
						<Nav.Item>
							<Nav.Link href="https://github.com/hagemt/dio">Code (.git)</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link href="#">Home (live)</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link href={csv}>Votes (.csv)</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link href={api}>API (json)</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link href={tsv}>Anime (.tsv)</Nav.Link>
						</Nav.Item>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
			<main className="container">
				<Container className="pt-3">
					<h1>
						Anime Party <Badge variant="secondary">{data.date}</Badge>
					</h1>
					<p>
						<span>This page will GET /api every {refreshInterval}ms...</span>
					</p>
				</Container>
				<AnimeTable {...data} />
				{/*
				<p>
					<tt>Raw: {data.raw}</tt>
				</p>
				*/}
				<footer>
					<p>
						<span>
							Data loaded within {took}ms at: {when.toString()}
						</span>
					</p>
				</footer>
			</main>
		</>
	)
}

AnimeParty.propTypes = {
	api: Types.string,
	csv: Types.string,
	egg: Types.string,
	refreshInterval: Types.number,
	tsv: Types.string,
}

AnimeParty.getInitialProps = async ({ req }) => {
	const base = process.env.BASE_URL || `//${req.headers.host}/`
	const csv = process.env.VOTES_CSV || 'votes.csv'
	const list = process.env.ANIME_TSV || base + 'anime.tsv'
	const uri = process.env.EASTER_EGG // optional
	return {
		api: base + 'api', // same as GET /api/party
		csv: base + csv,
		egg: uri ? `${base}${uri}` : null,
		refreshInterval: REFRESH_API_MS,
		tsv: list.split('/').pop(),
	}
}

export default AnimeParty
