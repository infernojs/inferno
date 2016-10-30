import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import pack from '../package.json';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import { withNodeResolve, relativeModules, getPackageJSON, outputFileSize } from './rollup.helpers';
import bundles from './rollup.bundles';
import { aliases } from './aliases';

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const dependencies = Object.keys(pkg.peerDependencies || {})
													 .concat(Object.keys(pkg.dependencies || {}))
													 .concat(Object.keys(pkg.devDependencies || {}));

let plugins = [
	typescript({
		typescript: require('typescript')
	}),
	buble({
		objectAssign: 'Object.assign'
	}),
	relativeModules(),
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
			//
			// Setting NODE_ENV: 'development' replaces production checks from bundle making
			// it impossible for end user to build their own bundle without minified code
			//
			// 'process.env.NODE_ENV': JSON.stringify('development')
		})
	)
}

// Filesize plugin needs to be last to report correct filesizes when minified
plugins.push(filesize());

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

	const external = dependencies.concat(Object.keys(pack.dependencies || {}));
	const virtuals = Object.keys(aliases);

	// Skip bundling dependencies of each package
	plugins = withNodeResolve(plugins, {
		module: true,
		jsnext: true,
		main: true,
		skip: external.concat(virtuals)
	});

	return rollup({ entry, plugins, external }).then(({ write }) => write(bundleConfig)).catch(err => {
		console.log(err)
	});
}

Promise.all(bundles.map(bundle => createBundle(bundle, 'packages/inferno/dist/')));
