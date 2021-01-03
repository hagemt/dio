/* eslint-env node */
module.exports = {
	env: {
		browser: true,
		es2021: true,
	},

	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/recommended',
		'plugin:prettier/recommended',
		'plugin:react/recommended',
		'prettier',
	],

	ignorePatterns: ['!.eslintrc.js'],

	parser: '@typescript-eslint/parser',

	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2021,
		sourceType: 'module',
	},

	plugins: [
		// TODO: adopt .tsx?
		'@typescript-eslint',
		'import',
		'prettier',
		'react',
	],

	root: true,

	rules: {
		'sort-keys': 'warn',
	},

	settings: {
		react: {
			version: 'detect',
		},
	},
}
