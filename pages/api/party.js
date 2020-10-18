const fs = require('fs')
const path = require('path')
//const querystring = require('querystring')

// FIXME: load .tsv w/ fs vs. HTTP fetch?
import fetch from 'node-fetch'
//import _ from 'lodash'

const minDuration = (text, defaultValue = text) => {
	switch (text) {
		case '': return 22; // standard
		case 'Y': return 4; // short
		default: return defaultValue;
	}
}

const etaDate = (min, now = NOW) => new Date(min * 60000 + now.getTime())
const VOTE_FILE = path.resolve(process.cwd(), 'pages', 'api', 'votes.csv')
const NOW = fs.statSync(VOTE_FILE).mtime // i.e. when CURRENT_VOTES updated

const start = etaDate(+22, NOW) // offset, if VOTE_FILE hit after start of ep
const csv = fs.readFileSync(VOTE_FILE, 'utf8').split('\n'); csv.pop()
const CURRENT_VOTES = Array.from(csv, row => row.split(','))

const formatDate = eta => eta.toTimeString().split(' ')[0].slice(0, 5)
const score = ([skip, veto]) => {
	if (isNaN(skip) || isNaN(veto)) return 'in progress'
	if (skip == '0' && veto == '0') return 'not contested'
	return `contested: ${skip - veto} (${skip}-${veto})`
}

export default async (req, res) => {
	try {
		const url = `http://${req.headers['host']}/live-anime-today.tsv`
		const text = await fetch(url).then(async response => response.text())
		const tsv = text.split('\r\n').map(row => row.split('\t')); tsv.pop()

		const headers = []
		headers.push('Title (or, 日本語)')
		headers.push('Est. Duration (min)')
		headers.push('Est. Done Time (when)')
		headers.push('Notes (incl. score)')
		const timestamps = {
			eta: start,
			now: NOW,
		}

		const rows = []
		for (const row of tsv.slice(1)) {
			const isFuture = CURRENT_VOTES.length < rows.length
			const currentVotes = CURRENT_VOTES[rows.length] || []

			const title = row[1] || row[0] // in Japanese
			const dt = minDuration(row[3]) // isShort=Y? 4 : 22
			const next = isFuture ? etaDate(dt, timestamps.eta) : null
			const when = isFuture ? formatDate(timestamps.eta = next) : ''
			const note = isFuture ? 'TBA' : score(currentVotes)
			rows.push([title, dt, when, note])
		}

		res.statusCode = 200
		console.debug('GET /api:', req.headers['x-forwarded-for'] || 'localhost')
		res.json(Object.assign({ err: null, headers, raw: rows }, timestamps))
	} catch (err) {
		console.error(err)
		res.statusCode = 500
		res.json({ err: err.message, eta: NOW, headers: [], now: NOW, raw: [] })
	}
}
