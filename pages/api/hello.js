// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { URL } from 'url'

const parseArray = (req, name, defaultValues = []) => {
	const origin = `http://${req.headers.host}`
	const parsed = new URL(req.url, origin)
	const values = parsed.searchParams.getAll(name)
	return values.length > 0 ? values : defaultValues
}

// eslint-disable-next-line
export default (req, res) => {
	const name = parseArray(req, 'name', ['John', 'Doe']).join(' ')
	const body = {
		name,
	}
	res.statusCode = 200
	res.json(body)
}
