// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as _ from 'lodash'

const columns = [
	//'English Title (or, 日本語)',
	//'Est. Schedule (start time)',
	//'Est. Duration (minutes)',
	'Name',
	'Score = skip - veto',
	'Notes',
]

const data = [
	['300 Slimes', 'not contested', 'funny'],
	['Cestvs: The Roman Fighter', 'skip (2 = 2 - 0)', 'at 14:53'],
	['Ijiranaide, Nagatoro-san', 'not contested', 'sausy'],
	['Seven Knights Revolution', 'skip (1 = 1 - 0)', 'at 10:08'],
	['Osananajimi ga Zettai ni Makenai Love Come', 'skip (1 = 1 - 0)', 'at 09:40'],
	['Shakunetsu (Burning) Kabaddi', 'not contested', 'sport'],
	['86: Eighty Six', 'skip (1 = 1 - 0)', 'at 14:27'],
	['Tokyo Revengers', 'not contested', 'cute'],
	['Hige wo Soru; JK daddy', 'contested (0 = 2 - 2)', 'controversy!'],
	['Those Snow White Notes', 'skip (1 = 1 - 0)', 'at 08:50'],
	['Backflip!!', 'skip (1 = 1 - 0)', 'at 05:10'],
	['Combatants Will Be Dispatched', 'skip (1 = 1 - 0)', 'at 11:42; shitty GANTZ'],
	['To Your Eternity: Fumetsu no Anata e', 'not contested', 'Mu shi shi shi'],
	['Vivy: Fluorite Eye’s Song', 'not contested', '(a wild Ross appears)'],
	['Shadows House', 'not contested', 'better than expected'],
	['Seijo no Maryoku wa Bannou desu', 'contested (0 = 1 - 1)', 'Saints Magic Power'],
	['Fairy Ranmaru: Anata no Kokoro Otasuke Shimasu', 'skip (1 = 1 - 0)', 'at 04:00'],
	['Odd Taxi', 'uncontested', 'odd'],
	['Bishounen Tanteidan', 'skip (2 = 2 - 0)', 'at 06:27'],
	['Subarashiki Kono Sekai (WEW/you) The Animation', 'contested (1 = 2 - 1)', 'at 12:35'],
	['BLUE REFLECTION RAY', 'not contested', 'despite a lot of bitching from ZAK'],
	['MARS RED', 'not contested', 'vampires'],
	['Kyuukyoku Shinka Shita Full Dive RPG', 'skip (1 = 1 - 0)', 'isekai'],
	['Dragon, Ie wo Kau', 'not contested', 'wholesome'],
	['Super Cub', 'not contested', 'ZOOMERS'],
	['Sayonara Watashi no Cramer', 'skip (1 = 1 - 0)', 'at 05:48; futbol'],
	['EDENS ZERO', 'skip (1 = 1 - 0)', 'at 04:00'],
	['SHAMAN KING (2021)', 'contested (-1 = 1 - 2)', 'nostalgia bait'],
	['Mazica Party', 'skipped (no source)', 'eh'],
]

const handleButton = async (req, ctx) => {
	ctx.statusCode = 200
	ctx.body = {
		message: 'Got button push',
	}
}

const handleLookup = async (req, ctx) => {
	const href = `https://${req.headers.host}${req.url}`
	const ts = new Date()
	ctx.statusCode = 200
	ctx.body = {
		columns,
		date: '2021-04-17',
		err: null,
		eta: ts.toISOString(),
		now: ts.toISOString(),
		raw: data,
		url: href,
	}
}

export default async (req, res) => {
	try {
		const ctx = {}
		switch (req.method || 'GET') {
			case 'POST':
				await handleButton(req, ctx)
				break
			case 'GET':
			default:
				await handleLookup(req, ctx)
		}
		const body = ctx.body || {
			message: _.get(ctx, 'err.message', 'Unknown error'),
		}
		res.statusCode = ctx.statusCode || 400
		res.json(body)
	} catch (err) {
		res.statusCode = 500
		res.json({
			error: err.message,
		})
	}
}
