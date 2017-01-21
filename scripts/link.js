const { ensureSymlinkSync } = require('fs-extra');
const { resolve } = require('path');
const rimraf = require('rimraf');

// Doing 1 by 1 for now, later it'll be glob
const PACKAGES = [
	'inferno-helpers',
	'inferno-vnode-flags',
];

PACKAGES.forEach(pkg => {
	const location = resolve(__dirname, `../packages/${pkg}`);
	ensureSymlinkSync(resolve(__dirname, '../tsconfig.json'), `${location}/tsconfig.json`);
	ensureSymlinkSync(resolve(__dirname, '../tsconfig.es.json'), `${location}/tsconfig.es.json`);
	ensureSymlinkSync(resolve(__dirname, '../.npmignore'), `${location}/.npmignore`);
});

// Since inferno consumes this
// TODO: Escape hatch for now
ensureSymlinkSync(resolve(__dirname, '../packages/inferno-helpers'), resolve(__dirname, '../node_modules/inferno-helpers'));
// TODO: Remove this once new inferno-vnode-flags is published
rimraf.sync(resolve(__dirname, '../node_modules/inferno'));
rimraf(resolve(__dirname, '../node_modules/inferno-vnode-flags'), () => {
	ensureSymlinkSync(resolve(__dirname, '../packages/inferno-vnode-flags'), resolve(__dirname, '../node_modules/inferno-vnode-flags'));
});

