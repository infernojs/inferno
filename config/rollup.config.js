import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import pack from '../package.json';
import commonjs from 'rollup-plugin-commonjs';
import { withNodeResolve, relativeModules, updatePackageVersion, outputFileSize } from './rollup.helpers';
import bundles from './rollup.bundles';
import { aliases } from './aliases';

const infernoPackage = JSON.parse(fs.readFileSync('./package.json'));
const dependencies = Object.keys(infernoPackage.peerDependencies || {});

let plugins = [
	buble({
		objectAssign: 'Object.assign'
	}),
	relativeModules(),
	commonjs({
		include: 'node_modules/**',
		exclude: [ 'node_modules/symbol-observable/**', '**/*.css' ]
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
	);
} else if (process.env.NODE_ENV === 'browser') {
	plugins.push(
		replace({
			VERSION: pack.version,
			'process.env.NODE_ENV': JSON.stringify('development')
		})
	);
} else {
	plugins.push(
		replace({
			VERSION: pack.version
		})
	);
}

// Filesize plugin needs to be last to report correct filesizes when minified
plugins.push(filesize());

function createBundle({ moduleGlobal, moduleName, moduleEntry, moduleGlobals }, path) {
	const pack = updatePackageVersion(moduleName, infernoPackage);
	const copyright =
		'/*!\n' +
		' * ' + moduleName + ' v' + pack.version + '\n' +
		' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
		' * Released under the ' + pack.license + ' License.\n' +
		' */';
	const entry = p.resolve(moduleEntry);
	const dest = p.resolve(`${ path }${ moduleName }.${ process.env.NODE_ENV === 'production' ? 'min.js' : 'js' }`);

	const bundleConfig = {
		dest,
		format: 'umd',
		moduleName: moduleGlobal,
		globals: Object.assign({
			moduleGlobal: moduleGlobal
		}, moduleGlobals),
		banner: copyright,
		sourceMap: false
	};

	const external = dependencies.concat(getDependenciesArray(pack));
	const virtuals = Object.keys(aliases);

	// Skip bundling dependencies of each package
	plugins = withNodeResolve(plugins, {
		module: true,
		jsnext: true,
		main: true,
		skip: external.concat(virtuals)
	});

	return rollup({ entry, plugins, external }).then(({ write }) => write(bundleConfig)).catch(err => {
		console.log(err);
	});
}

/**
 * Get dependencies from package.json
 * So we can exclude them from the bundle
 * @param pack
 * @returns {Array.<String>}
 */
function getDependenciesArray(pack) {
	return Object.keys(pack.dependencies || {});
}

if (process.env.NODE_ENV === 'development') {
	Promise.all(bundles.map(bundle => createBundle(bundle, 'packages/inferno/dist/')));
} else {
	Promise.all(bundles.map(bundle => createBundle(bundle, 'dist/')));
}