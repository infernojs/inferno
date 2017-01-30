/* global module */
/* tslint:disable */

const webpack = require('webpack');
const path = require('path');
const base = require('./karma.base.conf');

module.exports = function (config) {
	base(config);

	config.set({
		files: [
			'packages/*/__benchmarks__/**/*.js*'
		],
		frameworks: [
			'benchmark'
		],
		reporters: [
			'benchmark',
			'json-result'
		],
		jsonResultReporter: {
			outputFile: path.join(__dirname, '..', 'data', 'result.json')
		},
		webpack: {
			plugins: [
				new webpack.DefinePlugin({
					'process.env': {
						NODE_ENV: '"production"'
					}
				}),
				new webpack.optimize.UglifyJsPlugin({
					warnings: false,
					compress: {
						screw_ie8: true,
						dead_code: true,
						unused: true,
						drop_debugger: true, //
						booleans: true // various optimizations for boolean context, for example !!a ? b : c → a ? b : c
					},
					mangle: {
						screw_ie8: true
					}
				})
			]
		}
	});
};
