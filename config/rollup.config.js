import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
// TODO: There is issue in this plugin, it does not ship file specified in main opened issue in their github:
// https://github.com/ritz078/rollup-plugin-filesize/issues/3
// import filesize from 'rollup-plugin-filesize';
import pack from '../package.json';
import stub from 'rollup-plugin-stub';

const plugins = [
	babel({
		babelrc: false,
		presets: 'es2015-rollup',
		plugins: [
			'transform-inline-environment-variables',
			'transform-undefined-to-void',
			'babel-plugin-syntax-jsx',
			'babel-plugin-inferno',
			'transform-object-rest-spread'
		]
	}),
	nodeResolve({
		jsnext: true,
		main: true
	}),
	stub(),
	// filesize(),
	replace({
		'process.env.NODE_ENV': JSON.stringify('production'),
		VERSION: pack.version
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
}

const bundles = [
	{
		moduleGlobal: 'Inferno',
		moduleName: 'inferno',
		moduleEntry: 'packages/inferno/src/index.js'
	},
	{
		moduleGlobal: 'InfernoDOM',
		moduleName: 'inferno-dom',
		moduleEntry: 'packages/inferno-dom/src/index.js'
	},
	{
		moduleGlobal: 'InfernoServer',
		moduleName: 'inferno-server',
		moduleEntry: 'packages/inferno-server/src/index.js'
	},
	{
		moduleGlobal: 'InfernoComponent',
		moduleName: 'inferno-component',
		moduleEntry: 'packages/inferno-component/src/index.js'
	},
	{
		moduleGlobal: 'InfernoTestUtils',
		moduleName: 'inferno-test-utils',
		moduleEntry: 'packages/inferno-test-utils/src/index.js'
	},
	{
		moduleGlobal: 'InfernoCreateElement',
		moduleName: 'inferno-create-element',
		moduleEntry: 'packages/inferno-create-element/src/index.js'
	}
];

function createBundle({moduleGlobal, moduleName, moduleEntry}) {
	const copyright =
		'/*!\n' +
		' * ' + moduleName + ' v' + pack.version + '\n' +
		' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
		' * Released under the ' + pack.license + ' License.\n' +
		' */';
	const entry = p.resolve(moduleEntry);
	const dest  = p.resolve(`packages/inferno/dist/${ moduleName }.${ process.env.NODE_ENV === 'production' ? 'min.js' : 'js' }`);

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

	return rollup({entry, plugins}).then(({write}) => write(bundleConfig)).catch(err => {
		console.log(err)
	});
}

Promise.all(bundles.map(bundle => createBundle(bundle))).then(_ => console.log('Bundles created!'));
