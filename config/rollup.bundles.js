import { Bundles } from './rollup.helpers';

// Methods available: add, skip, only
const bundles = new Bundles();

bundles.add({
	moduleGlobal: 'Inferno',
	moduleName: 'inferno',
	moduleEntry: 'packages/inferno/lib/index.js',
	moduleGlobals: {
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno/'
});

bundles.add({
	moduleGlobal: 'Inferno.Helpers',
	moduleName: 'inferno-helpers',
	moduleEntry: 'packages/inferno-helpers/lib/index.js',
	moduleGlobals: {},
	path: 'packages/inferno-helpers/'
});

bundles.add({
	moduleGlobal: 'Inferno.Server',
	moduleName: 'inferno-server',
	moduleEntry: 'packages/inferno-server/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-server/'
});

bundles.add({
	moduleGlobal: 'Inferno.Component',
	moduleName: 'inferno-component',
	moduleEntry: 'packages/inferno-component/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-component/'
});

bundles.add({
	moduleGlobal: 'Inferno.TestUtils',
	moduleName: 'inferno-test-utils',
	moduleEntry: 'packages/inferno-test-utils/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-test-utils/'
});

bundles.add({
	moduleGlobal: 'Inferno.createElement',
	moduleName: 'inferno-create-element',
	moduleEntry: 'packages/inferno-create-element/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-create-element/'
});

bundles.add({
	moduleGlobal: 'Inferno',
	moduleName: 'inferno-compat',
	moduleEntry: 'packages/inferno-compat/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-compat/'
});

bundles.add({
	moduleGlobal: 'Inferno.Router',
	moduleName: 'inferno-router',
	moduleEntry: 'packages/inferno-router/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-router/'
});

bundles.add({
	moduleGlobal: 'Inferno.createClass',
	moduleName: 'inferno-create-class',
	moduleEntry: 'packages/inferno-create-class/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-create-class/'
});

bundles.add({
	moduleGlobal: 'Inferno.Redux',
	moduleName: 'inferno-redux',
	moduleEntry: 'packages/inferno-redux/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-create-class': 'Inferno.createClass',
		'inferno-helpers': 'Inferno.Helpers',
		'path-to-regexp-es6': 'Inferno.pathToRegExp',
		redux: 'Redux'
	},
	path: 'packages/inferno-redux/'
});

bundles.add({
	moduleGlobal: 'Inferno.Mobx',
	moduleName: 'inferno-mobx',
	moduleEntry: 'packages/inferno-mobx/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-create-class': 'Inferno.createClass',
		'inferno-helpers': 'Inferno.Helpers',
		'path-to-regexp-es6': 'Inferno.pathToRegExp',
		mobx: 'mobx'
	},
	path: 'packages/inferno-mobx/'
});

bundles.add({
	moduleGlobal: 'Inferno.h',
	moduleName: 'inferno-hyperscript',
	moduleEntry: 'packages/inferno-hyperscript/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-hyperscript/'
});

bundles.add({
	moduleGlobal: 'Inferno.VNodeFlags',
	moduleName: 'inferno-vnode-flags',
	moduleEntry: 'packages/inferno-vnode-flags/lib/index.js',
	path: 'packages/inferno-vnode-flags/'
});

bundles.add({
	moduleGlobal: 'Inferno.DevTools',
	moduleName: 'inferno-devtools',
	moduleEntry: 'packages/inferno-devtools/lib/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-helpers': 'Inferno.Helpers',
	},
	path: 'packages/inferno-devtools/'
});

export default bundles;
