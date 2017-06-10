/* global module */
/* tslint:disable */

const path = require('path');
const base = require('./karma.base.conf');

module.exports = function (config) {
	base(config);

	config.set({
		frameworks: [
			'mocha',
			'chai'
		],
		files: [
			require.resolve('es5-shim'),
			require.resolve('es6-shim'),
			require.resolve('babel-polyfill/dist/polyfill'),
			require.resolve('sinon/pkg/sinon'),
			`packages/${process.env.PKG_FILTER || '*'}/__tests__/**/*.js*`
		],
		reporters: [
			'progress',
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
