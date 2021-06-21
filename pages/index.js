//import { URL } from 'url'

import Head from 'next/head'
import Konami from 'konami'
import React from 'react'
import Types from 'prop-types'
import useSWR from 'swr'

import {
	Alert,
	Badge,
	//Button,
	Container,
	Image,
	Nav,
	Navbar,
	OverlayTrigger,
	Table,
	Toast,
	Tooltip,
} from 'react-bootstrap-v5'

//import SVG from '../public/Konami_Code.svg'

const ALL_BORDER_CSS = '1px solid black'
const REFRESH_API_MS = 2000

const bg = (idx, border = ALL_BORDER_CSS) => ({
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
	const [show, setShow] = React.useState(false) // for Toast
	const eggAndToast = () => {
		if (!egg) {
			return null
		}
		new Konami(async () => {
			// https://en.wikipedia.org/wiki/Konami_Code + Anime shitpoasts
			try {
				await Promise.resolve()
					.then(async () => new Audio('/Loud_Noise.mp3').play())
					.then(async () => {
						await new Promise((done) => setTimeout(done, 15000))
						const audio = new Audio('/dio.mp3')
						audio.loop = true // ew
						await audio.play()
					})
			} catch (error) {
				console.error(error)
			}
			// extra secret
			const amv = 'https://www.youtube.com/embed/orsYHTkgZBc?autoplay=1&controls=0&loop=1&rel=0'
			const answer = prompt('OMAE WA MO SHINDEIRU', 'NANI!?')
			window.location = answer === 'KONO DIO DA!' ? amv : egg
		})
		const style = {
			position: 'absolute',
			right: 0,
			top: 0,
		}
		return (
			<div aria-atomic="true" aria-live="polite" style={{ minHeight: '100px', position: 'relative' }}>
				<Toast autohide delay={1000} onClose={() => setShow(false)} show={show} style={style}>
					<Toast.Header>
						<img alt="" className="mr-2 rounded" src="holder.js/20x20?text=%20" />
						<strong className="mr-auto">Easter egg</strong>
						<small>KONO DIO DA!</small>
					</Toast.Header>
					<Toast.Body>
						<span>Ready or not, here I come!</span>
					</Toast.Body>
				</Toast>
			</div>
		)
	}

	const navBranding = (dio, src = egg ? '/Konami_Code.svg' : null) => {
		if (!src) {
			return <Navbar.Brand href="/">{dio}</Navbar.Brand>
		}
		const delay = {
			hide: 400,
			show: 250,
		}
		const renderTooltip = (props) => (
			<Tooltip id="svg" {...props}>
				<Image alt={src} src={src} style={{ height: '15px', width: '160px' }} />
			</Tooltip>
		)
		return (
			<OverlayTrigger delay={delay} overlay={renderTooltip} placement="bottom">
				<Navbar.Brand href="/">{dio}</Navbar.Brand>
			</OverlayTrigger>
		)
	}

	const { data, error } = useSWR(api, jsonRequest, {
		refreshInterval,
	})
	if (error) {
		console.error(error)
		return (
			<Container className="p-3" fluid="sm">
				<Alert variant="warning">Oops! (please wait a minute, then refresh)</Alert>
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
	const when = jsonRequest.justBefore || new Date() // yuck
	const took = 1 + (new Date() - when) // load duration in ms

	return (
		<>
			<Head>
				<title>Dio</title>
			</Head>
			<Navbar bg="light" expand="md">
				{navBranding('Dio')}
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
				{eggAndToast()}
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
