const p = require('path');
const fs = require('fs');
const { rollup } = require('rollup');
const buble = require('rollup-plugin-buble');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const filesize = require('rollup-plugin-filesize');
const pack = require('../package.json');
const commonjs = require('rollup-plugin-commonjs');
const { withNodeResolve, updatePackageVersion, outputFileSize } = require('./rollup.helpers');
const bundles = require('./rollup.bundles');

const infernoPackage = JSON.parse(fs.readFileSync('./package.json'));
const dependencies = Object.keys(infernoPackage.peerDependencies || {});

const EXTERNAL_BLACKLISTS = new Map();
EXTERNAL_BLACKLISTS.set('inferno-helpers', true);
EXTERNAL_BLACKLISTS.set('inferno-vnode-flags', true);

const plugins = [
	commonjs({
		include: 'node_modules/**'
	}),
	buble({
		objectAssign: 'Object.assign'
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
	const dest = p.resolve(`${ path }${ moduleName }.${ process.env.NODE_ENV === 'production' ? 'min.js' : process.env.NODE_ENV === 'development' ? 'node.js' : 'js' }`);

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

	// HACK: For now don't treat certain inferno-* as external dep, package them together
	// for backwards compat in dist files. Remove this after lerna transition is completed
	const external = dependencies.concat(getDependenciesArray(pack)).filter(n => !EXTERNAL_BLACKLISTS.has(n));

	// Skip bundling dependencies of each package
	const _plugins = withNodeResolve(plugins, {
		jsnext: true,
		skip: external
	});
	return rollup({ entry, plugins: _plugins, external }).then(({ write }) => write(bundleConfig)).catch(console.error);
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

Promise.all(bundles.map(bundle => createBundle(bundle, bundle.dest || 'packages/inferno/dist/')));
