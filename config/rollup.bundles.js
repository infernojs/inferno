import { Bundles } from './rollup.helpers';

// Methods available: add, skip, only
const bundles = new Bundles();

bundles.add({
	moduleGlobal: 'Inferno',
	moduleName: 'inferno',
	moduleEntry: 'packages/inferno/src/index.js',
	path: 'packages/inferno/'
});

bundles.add({
	moduleGlobal: 'InfernoServer',
	moduleName: 'inferno-server',
	moduleEntry: 'packages/inferno-server/src/index.js',
	path: 'packages/inferno-server/'
});

bundles.add({
	moduleGlobal: 'InfernoComponent',
	moduleName: 'inferno-component',
	moduleEntry: 'packages/inferno-component/src/index.js',
	path: 'packages/inferno-component/'
});

bundles.add({
	moduleGlobal: 'InfernoTestUtils',
	moduleName: 'inferno-test-utils',
	moduleEntry: 'packages/inferno-test-utils/src/index.js',
	path: 'packages/inferno-test-utils/'
});

bundles.add({
	moduleGlobal: 'InfernoCreateElement',
	moduleName: 'inferno-create-element',
	moduleEntry: 'packages/inferno-create-element/src/index.js',
	path: 'packages/inferno-create-element/'
});

bundles.add({
	moduleGlobal: 'InfernoCompat',
	moduleName: 'inferno-compat',
	moduleEntry: 'packages/inferno-compat/src/index.js',
	path: 'packages/inferno-compat/'
});

bundles.add({
	moduleGlobal: 'InfernoRouter',
	moduleName: 'inferno-router',
	moduleEntry: 'packages/inferno-router/src/index.js',
	path: 'packages/inferno-router/'
});

bundles.add({
	moduleGlobal: 'InfernoCreateClass',
	moduleName: 'inferno-create-class',
	moduleEntry: 'packages/inferno-create-class/src/index.js',
	path: 'packages/inferno-create-class/'
});

bundles.add({
	moduleGlobal: 'InfernoRedux',
	moduleName: 'inferno-redux',
	moduleEntry: 'packages/inferno-redux/src/index.js',
	path: 'packages/inferno-redux/'
});

bundles.add({
	moduleGlobal: 'InfernoMobx',
	moduleName: 'inferno-mobx',
	moduleEntry: 'packages/inferno-mobx/src/index.js',
	path: 'packages/inferno-mobx/'
});

bundles.add({
	moduleGlobal: 'InfernoHyperscript',
	moduleName: 'inferno-hyperscript',
	moduleEntry: 'packages/inferno-hyperscript/src/index.js',
	path: 'packages/inferno-hyperscript/'
});

export default bundles;
