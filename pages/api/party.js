// FIXME: load .tsv w/ fs vs. HTTP fetch?
const fs = require('fs')
const path = require('path')
import fetch from 'node-fetch'
//import { pick } from 'lodash'

const minDuration = (text, defaultValue = text) => {
	switch (text) {
		case '': return 22;
		case 'Y': return 4;
		default: return defaultValue;
	}
}

const etaDate = (min, now = NOW) => new Date(min * 60000 + now.getTime())
const THIS_FILE = path.resolve(process.cwd(), 'pages', 'api', 'party.js')
const NOW = fs.statSync(THIS_FILE).mtime // i.e. when CURRENT_VOTES up
const nils = (length = 0) => Array.from({ length }, () => [0, 0])

const CURRENT_VOTES = [].concat(
	nils(6),
	[[5,0], [17,12]],
	nils(1),
	[[7,2], [0, 0], [3, 1], [15, 12], [2, 1], [0, 0]], // nana + 1
)

export default async (req, res) => {
	try {
		const url = `http://${req.headers['host']}/live-anime-today.tsv`
		const text = await fetch(url).then(async response => response.text())
		const tsv = text.split('\r\n').map(row => row.split('\t')); tsv.pop()

		const headers = []
		headers.push('Title (or, 日本語)')
		headers.push('Est. Duration (min)')
		headers.push('Est. Play Time (when)')
		headers.push('Notes (incl. score)')
		const formatDate = eta => eta.toTimeString().split(' ')[0].slice(0, 5)
		const score = ([skip, veto]) => {
			if (isNaN(skip) || isNaN(veto)) return 'in progress'
			if (skip === 0 && veto === 0) return 'not contested'
			return `contested: ${skip - veto} (${skip}-${veto})`
		}
		const timestamps = {
			eta: etaDate(-5, NOW),
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
		console.debug(req.headers['x-forwarded-for'])
		res.json(Object.assign({ err: null, headers, raw: rows }, timestamps))
	} catch (err) {
		console.error(err)
		res.statusCode = 500
		res.json({ err: err.message, eta: NOW, headers: [], now: NOW, raw: [] })
	}
}
