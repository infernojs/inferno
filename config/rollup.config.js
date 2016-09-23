import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import pack from '../package.json';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const external = Object.keys(pkg.peerDependencies || {}).concat(Object.keys(pkg.dependencies || {}));

const plugins = [
	typescript({
		typescript: require('typescript')
	}),
	buble({
		objectAssign: 'Object.assign'
	}),
	nodeResolve({
		jsnext: true,
		main: true,
		skip: external
	}),
	commonjs({
		include: 'node_modules/**',
		exclude: ['node_modules/symbol-observable/**', '**/*.css']
	})
];

if (process.env.NODE_ENV === 'production') {
	plugins.push(
		uglify({
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
	);
	plugins.push(
		replace({
			VERSION: pack.version,
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	)
} else {
	plugins.push(
		replace({
			VERSION: pack.version,
			'process.env.NODE_ENV': JSON.stringify('development')
		})
	)
}

// Filesize plugin needs to be last to report correct filesizes when minified
plugins.push(filesize());

const bundles = [
	{
		moduleGlobal: 'Inferno',
		moduleName: 'inferno',
		moduleEntry: 'packages/inferno/src/index.js',
		path: 'packages/inferno/'
	},
	{
		moduleGlobal: 'InfernoDOM',
		moduleName: 'inferno-dom',
		moduleEntry: 'packages/inferno-dom/src/index.js',
		path: 'packages/inferno-dom/'
	},
	{
		moduleGlobal: 'InfernoServer',
		moduleName: 'inferno-server',
		moduleEntry: 'packages/inferno-server/src/index.js',
		path: 'packages/inferno-server/'
	},
	{
		moduleGlobal: 'InfernoComponent',
		moduleName: 'inferno-component',
		moduleEntry: 'packages/inferno-component/src/index.js',
		path: 'packages/inferno-component/'
	},
	{
		moduleGlobal: 'InfernoTestUtils',
		moduleName: 'inferno-test-utils',
		moduleEntry: 'packages/inferno-test-utils/src/index.js',
		path: 'packages/inferno-test-utils/'
	},
	{
		moduleGlobal: 'InfernoCreateElement',
		moduleName: 'inferno-create-element',
		moduleEntry: 'packages/inferno-create-element/src/index.js',
		path: 'packages/inferno-create-element/'
	},
	{
		moduleGlobal: 'InfernoCompat',
		moduleName: 'inferno-compat',
		moduleEntry: 'packages/inferno-compat/src/index.js',
		path: 'packages/inferno-compat/'
	},
	{
		moduleGlobal: 'InfernoRouter',
		moduleName: 'inferno-router',
		moduleEntry: 'packages/inferno-router/src/index.js',
		path: 'packages/inferno-router/'
	},
	{
		moduleGlobal: 'InfernoCreateClass',
		moduleName: 'inferno-create-class',
		moduleEntry: 'packages/inferno-create-class/src/index.js',
		path: 'packages/inferno-create-class/'
	},
	{
		moduleGlobal: 'InfernoRedux',
		moduleName: 'inferno-redux',
		moduleEntry: 'packages/inferno-redux/src/index.js',
		path: 'packages/inferno-redux/'
	},
	{
		moduleGlobal: 'InfernoHyperscript',
		moduleName: 'inferno-hyperscript',
		moduleEntry: 'packages/inferno-hyperscript/src/index.js',
		path: 'packages/inferno-hyperscript/'
	}
];

function createBundle({ moduleGlobal, moduleName, moduleEntry }, path) {
	const pack = getPackageJSON(moduleName, pkg);
	const copyright =
		'/*!\n' +
		' * ' + moduleName + ' v' + pack.version + '\n' +
		' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
		' * Released under the ' + pack.license + ' License.\n' +
		' */';
	const entry = p.resolve(moduleEntry);
	const dest  = p.resolve(`${ path }${ moduleName }.${ process.env.NODE_ENV === 'production' ? 'min.js' : 'js' }`);

	const bundleConfig = {
		dest,
		format: 'umd',
		moduleName: moduleGlobal,
		globals: {
			moduleGlobal: moduleGlobal
		},
		banner: copyright,
		sourceMap: false
	};

	return rollup({ entry, plugins }).then(({ write }) => write(bundleConfig)).catch(err => {
		console.log(err);
	});
}

function getPackageJSON(moduleName, defaultPackage) {
	try {
		return require('../packages/' + moduleName + '/package.json');
	} catch(e) {
		return defaultPackage
	}
}

Promise.all(bundles.map(bundle => createBundle(bundle, 'packages/inferno/dist/')));
