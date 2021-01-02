import fetch from 'node-fetch'

import fs from 'fs'
import path from 'path'

const etaDate = (min, now = NOW) => new Date(min * 60000 + now.getTime())
const formatDate = (eta) => eta.toTimeString().split(' ')[0].slice(0, 5)

const minDuration = (text, defaultValue = text) => {
	switch (text) {
		case '':
			return 22 // standard
		case 'Y':
			return 4 // short
		default:
			return defaultValue
	}
}

const noteVotes = ([skip, veto]) => {
	if (isNaN(skip) || isNaN(veto)) return 'in progress'
	if (skip == '0' && veto == '0') return 'not contested'
	return `contested: ${skip - veto} (${skip}-${veto})`
}

const sepValues = (utf8, ifs, eol = '\n') => {
	const lines = utf8.split(eol)
	lines.pop()
	return Array.from(lines, (line) => line.trim().split(ifs))
}

const VOTE_FILE = path.resolve('pages', 'api', 'votes.csv')
const csv = fs.readFileSync(VOTE_FILE, 'utf8')
const CURRENT_VOTES = sepValues(csv, ',')
const NOW = fs.statSync(VOTE_FILE).mtime
const start = etaDate(+22, NOW)
// VOTE_FILE is touched N min past ep op
// NOW when CURRENT_VOTES last updated
// start is offset in minutes (+/-N)

// eslint-disable-next-line
export default async (req, res) => {
	try {
		const url = `http://${req.headers['host']}/live-anime-today.tsv`
		const text = await fetch(url).then(async (res) => res.ok && res.text())
		const tsv = sepValues(text, '\t')

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
			const when = isFuture ? formatDate((timestamps.eta = next)) : ''
			const note = isFuture ? 'TBA' : noteVotes(currentVotes)
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
