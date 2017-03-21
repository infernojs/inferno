// for making sure obj properties are letters only
module.exports = {
	parser: 'typescript-eslint-parser',
	parserOptions: {
		sourceType: 'module'
	},
	ext: [ '.ts', '.js', '.jsx', '.tsx' ],
	ecmaVersion: 2017,
	globals: {
		document: true,
		window: true,
		require: true
	},
	ecmaFeatures: {
		jsx: true,
		modules: true,
		es6: true
	},
	env: {
		browser: true,
		es6: true,
		node: true
	},
	rules: {
		'id-match': [ 'error', '^([A-Za-z]+)*$' ]
	}
};
