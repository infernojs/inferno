/* global module */
/* tslint:disable */

const path = require('path');
const base = require('./karma.base.conf');

module.exports = function (config) {
	base(config);

	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		files: [
			'src/**/__benchmarks__/**/*.js',
			'src/**/__benchmarks__/**/*.jsx'
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
		}
	});
};
