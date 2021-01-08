module.exports = {
	webpack: (config) => {
		config.module.rules.push({
			issuer: {
				test: /\.(js|ts)x?$/,
			},
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		})
		return config
	},
}
