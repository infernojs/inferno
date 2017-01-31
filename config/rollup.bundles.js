const { Bundles } = require('./rollup.helpers');

// Methods available: add, skip, only
const bundles = new Bundles();

bundles.add({
	moduleGlobal: 'Inferno.Helpers',
	moduleName: 'inferno-helpers',
	moduleEntry: 'packages/inferno-helpers/dist-es/index.js',
	path: 'packages/inferno-helpers/',
	dest: 'packages/inferno-helpers/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.VNodeFlags',
	moduleName: 'inferno-vnode-flags',
	moduleEntry: 'packages/inferno-vnode-flags/dist-es/index.js',
	path: 'packages/inferno-vnode-flags/',
	dest: 'packages/inferno-vnode-flags/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno',
	moduleName: 'inferno',
	moduleEntry: 'packages/inferno/dist-es/index.js',
	path: 'packages/inferno/',
	dest: 'packages/inferno/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.Server',
	moduleName: 'inferno-server',
	moduleEntry: 'packages/inferno-server/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno'
	},
	path: 'packages/inferno-server/',
	dest: 'packages/inferno-server/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.Component',
	moduleName: 'inferno-component',
	moduleEntry: 'packages/inferno-component/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno'
	},
	path: 'packages/inferno-component',
	dest: 'packages/inferno-component/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.TestUtils',
	moduleName: 'inferno-test-utils',
	moduleEntry: 'packages/inferno-test-utils/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno'
	},
	path: 'packages/inferno-test-utils/',
	dest: 'packages/inferno-test-utils/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.createElement',
	moduleName: 'inferno-create-element',
	moduleEntry: 'packages/inferno-create-element/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno'
	},
	path: 'packages/inferno-create-element',
	dest: 'packages/inferno-create-element/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno',
	moduleName: 'inferno-compat',
	moduleEntry: 'packages/inferno-compat/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component'
	},
	path: 'packages/inferno-compat/',
	dest: 'packages/inferno-compat/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.Router',
	moduleName: 'inferno-router',
	moduleEntry: 'packages/inferno-router/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement'
	},
	path: 'packages/inferno-router/',
	dest: 'packages/inferno-router/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.createClass',
	moduleName: 'inferno-create-class',
	moduleEntry: 'packages/inferno-create-class/dist-es/index.js',
	moduleGlobals: {
		'inferno-component': 'Inferno.Component'
	},
	path: 'packages/inferno-create-class',
	dest: 'packages/inferno-create-class/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.Redux',
	moduleName: 'inferno-redux',
	moduleEntry: 'packages/inferno-redux/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-create-class': 'Inferno.createClass',
		'path-to-regexp-es6': 'Inferno.pathToRegExp',
		redux: 'Redux'
	},
	path: 'packages/inferno-redux/',
	dest: 'packages/inferno-redux/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.Mobx',
	moduleName: 'inferno-mobx',
	moduleEntry: 'packages/inferno-mobx/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component',
		'inferno-create-element': 'Inferno.createElement',
		'inferno-create-class': 'Inferno.createClass',
		'path-to-regexp-es6': 'Inferno.pathToRegExp',
		mobx: 'mobx'
	},
	path: 'packages/inferno-mobx/',
	dest: 'packages/inferno-mobx/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.h',
	moduleName: 'inferno-hyperscript',
	moduleEntry: 'packages/inferno-hyperscript/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno'
	},
	path: 'packages/inferno-hyperscript',
	dest: 'packages/inferno-hyperscript/dist/'
});

bundles.add({
	moduleGlobal: 'Inferno.DevTools',
	moduleName: 'inferno-devtools',
	moduleEntry: 'packages/inferno-devtools/dist-es/index.js',
	moduleGlobals: {
		inferno: 'Inferno',
		'inferno-component': 'Inferno.Component'
	},
	path: 'packages/inferno-devtools/',
	dest: 'packages/inferno-devtools/dist/'
});

module.exports = bundles;
