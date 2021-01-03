import fetch from 'node-fetch'

import fs from 'fs'
import os from 'os'
import path from 'path'

const formatDate = (now = NOW) => now.toTimeString().split(' ')[0].slice(0, 5) // HH:MM
const etaDate = (delta, now = NOW) => new Date(delta * 60000 + now.getTime()) // in MMs

// the .tsv indicates "isShort?" :Boolean w/ 'Y'
const minDuration = (text, defaultValue = text) => {
	switch (text) {
		case '':
			return +22 // avg. episode length in minutes
		case 'Y':
			return +4 // short (good enough for estimate)
		default:
			return defaultValue
	}
}

// the .csv has an optional third column
const noteVotes = ([skip, veto, note]) => {
	if (isNaN(skip) || isNaN(veto)) return 'in progress'
	if (skip == '0' && veto == '0') return 'not contested'
	return `${note || 'contested'}: ${skip - veto} (${skip}-${veto})`
}

const sepValues = (utf8, ifs, eol = os.EOL) => {
	// skip empty and "comment" lines (ignores blank space)
	const keepLine = (line) => !!line && !line.startsWith('#')
	const lines = utf8.split(eol).filter((line) => keepLine(line.trim()))
	//lines.pop() // trailing newlines are easier to filter above
	return Array.from(lines, (line) => line.trim().split(ifs))
}

const VOTES_CSV = process.env.VOTES_CSV || 'votes.csv'
const VOTE_FILE = path.resolve('public', VOTES_CSV)
const csv = fs.readFileSync(VOTE_FILE, 'utf8')

const CURRENT_VOTES = sepValues(csv, ',')
const NOW = fs.statSync(VOTE_FILE).mtime
const start = etaDate(-1) // XXX: tweak

// VOTE_FILE is touched N min "after OP"
// NOW = when CURRENT_VOTES last updated
// number is an offset in minutes (+/-N)

export default async (req, res) => {
	// eslint-disable-next-line prettier/prettier -- FIXME: find best way to extract the YYYY-MM-DD (of now)
	const date = VOTES_CSV.replace(/\.?votes\.csv$/, '').split('/').pop() || NOW.toISOString().split('T')[0]
	const url = `http://${req.headers['host']}/${process.env.ANIME_TSV || 'anime.tsv'}` // see /public folder
	try {
		const text = await fetch(url).then(async (res) => res.ok && res.text())
		const tsv = sepValues(text, '\t') // TODO: can compute this more lazily

		const columns = []
		columns.push('English Title (or, 日本語)')
		columns.push('Est. Schedule (start time)')
		columns.push('Est. Duration (minutes)')
		columns.push('Score (votes to skip - veto)')
		const timestamps = {
			eta: start,
			now: NOW,
		}

		const rows = []
		for (const row of tsv.slice(1)) {
			const currentVotes = CURRENT_VOTES[rows.length] || []
			const isFuture = CURRENT_VOTES.length <= rows.length

			const title = row[1] || row[0] // (name in English, or Japanese)
			const dt = minDuration(row[3]) // isShort=Y? 4 : 22 (in minutes)
			const next = isFuture ? etaDate(dt, timestamps.eta) : null
			const when = isFuture ? formatDate(timestamps.eta) : ''
			const note = isFuture ? 'TBA' : noteVotes(currentVotes)
			rows.push([title, when, dt.toFixed(), note])
			if (isFuture) timestamps.eta = next
		}

		console.debug(new Date().toISOString(), 'GET /api via:', req.headers['x-forwarded-for'] || 'localhost')
		res.statusCode = 200
		res.json(Object.assign({ columns, date, err: null, raw: rows, url }, timestamps))
	} catch (err) {
		console.error(err)
		res.statusCode = 500
		res.json({ columns: [], date, err: err.message, eta: NOW, now: NOW, raw: [], url })
	}
}
