/* global module */
/* tslint:disable */

const path = require('path');
const base = require('./karma.base.conf');

module.exports = function (config) {
	base(config);

	config.set({
		frameworks: [
			'chai',
			'mocha'
		],
		files: [
			'node_modules/es5-shim/es5-shim.js',
			'node_modules/es6-shim/es6-shim.js',
			'node_modules/babel-polyfill/dist/polyfill.js',
			'node_modules/sinon/pkg/sinon.js',
			'src/**/__tests__/**/*.ts',
			'src/**/__tests__/**/*.tsx',
			'src/**/__tests__/**/*.jsx'
		],
		reporters: [
			'failed'
		]
	});

	const {
		CI,
		TRAVIS_BRANCH,
		TRAVIS_BUILD_NUMBER,
		TRAVIS_JOB_NUMBER,
		TRAVIS_PULL_REQUEST
	} = process.env;

	const ci = String(CI).match(/^(1|true)$/gi);
	const pullRequest = !String(TRAVIS_PULL_REQUEST).match(/^(0|false|undefined)$/gi);
	const masterBranch = String(TRAVIS_BRANCH).match(/^master$/gi);
	const sauce = ci && !pullRequest && masterBranch;

	if (ci) {
		config.set({
			reporters: [
				'failed'
			]
		});
	}

	const varToBool = (sVar) => !!String(sVar).match('true');
	if (sauce) {
		const sauceLaunchers = require('./sauce');
		config.set({
			sauceLabs: {
				testName: 'Inferno Browser Karma Tests: ' + TRAVIS_JOB_NUMBER,
				build: (TRAVIS_JOB_NUMBER || 'Local'),
				tags: [(TRAVIS_BRANCH || 'master')]
			},
			customLaunchers: sauceLaunchers.launchers,
			browsers: sauceLaunchers.browsers,
			reporters: [
				'failed',
				'saucelabs'
			]
		});
	}
};
