const { ensureSymlinkSync } = require('fs-extra');
const { resolve, join } = require('path');
const rimraf = require('rimraf');

const PROJECT_FOLDER = resolve(__dirname, '..');

// Doing 1 by 1 for now, later it'll be glob
const PACKAGES = [
	'inferno',
	'inferno-helpers',
	'inferno-vnode-flags',
	'inferno-create-element',
	'inferno-create-class',
	'inferno-component',
	'inferno-hyperscript'
];

// TODO: Remove this once new inferno-vnode-flags is published
rimraf.sync(join(PROJECT_FOLDER, 'node_modules', 'inferno'));
rimraf.sync(join(PROJECT_FOLDER, 'node_modules', 'inferno-vnode-flags'));

PACKAGES.forEach(pkg => {
	const location = join(PROJECT_FOLDER, 'packages', pkg);
	ensureSymlinkSync(join(PROJECT_FOLDER, 'tsconfig.json'), join(location, 'tsconfig.json'));
	ensureSymlinkSync(join(PROJECT_FOLDER, 'tsconfig.es.json'), join(location, 'tsconfig.es.json'));
	ensureSymlinkSync(join(PROJECT_FOLDER, '.npmignore'), join(location, '.npmignore'));
	ensureSymlinkSync(join(PROJECT_FOLDER, 'packages', pkg), join(PROJECT_FOLDER, 'node_modules', pkg));
});
