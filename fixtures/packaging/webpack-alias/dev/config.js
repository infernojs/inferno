var path = require('path');

module.exports = {
	entry: './input',
	output: {
		filename: 'output.js'
	},
	resolve: {
		alias: {
			inferno: 'inferno/dist/inferno',
			'inferno-create-element': 'inferno-create-element/dist/inferno-create-element'
		},
		root: path.resolve('../../../../packages')
	}
};
