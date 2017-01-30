const { ensureSymlinkSync } = require('fs-extra');
const { resolve, join } = require('path');
const { executeSync } = require('./packages')();
const rimraf = require('rimraf');

const PROJECT_FOLDER = resolve(__dirname, '..');
// TODO: Remove this once new inferno-vnode-flags is published
rimraf.sync(join(PROJECT_FOLDER, 'node_modules', 'inferno'));
rimraf.sync(join(PROJECT_FOLDER, 'node_modules', 'inferno-vnode-flags'));

executeSync(({ location }) => {
	ensureSymlinkSync(join(PROJECT_FOLDER, 'tsconfig.json'), join(location, 'tsconfig.json'));
	ensureSymlinkSync(join(PROJECT_FOLDER, '.npmignore'), join(location, '.npmignore'));
});

ensureSymlinkSync(join(PROJECT_FOLDER, 'packages', 'inferno-vnode-flags'), join(PROJECT_FOLDER, 'node_modules', 'inferno-vnode-flags'));
// ensureSymlinkSync(join(PROJECT_FOLDER, 'packages', 'inferno'), join(PROJECT_FOLDER, 'node_modules', 'inferno'));
