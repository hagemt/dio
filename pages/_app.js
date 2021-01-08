import React from 'react'

import '../styles/_app.css'

export function reportWebVitals({ id, label, name, startTime, value }) {
	// ignores custom (framework) metrics for the time being
	if (label !== 'web-vital') return
	console.log('@%s [%s:%s] %sms (-%s)', id, label, name, value, startTime)
}

// eslint-disable-next-line react/prop-types
export default function Page({ Component, pageProps }) {
	return <Component {...pageProps} />
}
