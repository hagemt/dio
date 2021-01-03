import React from 'react'

import '../styles/_app.css'

export function reportWebVitals({ id, label, name, startTime, value }) {
	const key = [label, startTime, name].join('_') // each log line is 80 columns
	console.log('@%s [%s] %sms', id, key.padEnd(36), value.toFixed().padStart(10))
}

// eslint-disable-next-line react/prop-types
export default function Page({ Component, pageProps }) {
	return <Component {...pageProps} />
}
