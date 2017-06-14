const bublePlugin = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replacePlugin = require('rollup-plugin-replace');
const tsPlugin = require('rollup-plugin-typescript2');
const uglify = require('rollup-plugin-uglify');

const aliasPlugin = require('./alias');
const optJSPlugin = require('./optimize');

module.exports = function(version, options) {
	const plugins = [
		aliasPlugin,
		nodeResolve({
			extensions: ['.ts', '.js', '.json'],
			jsnext: true
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		tsPlugin({
			abortOnError: false,
			cacheRoot: `.rpt2_cache_${options.env}`,
			check: false,
			clean: true,
			exclude: [
				'*.spec*',
				'**/*.spec*'
			]
		}),
		bublePlugin()
	];

	const replaceValues = {
		'process.env.INFERNO_VERSION': JSON.stringify(options.version)
	};

	if (options.replace) {
		replaceValues['process.env.NODE_ENV'] = JSON.stringify(options.env);
	}

	if (options.uglify) {
		plugins.push(
			uglify({
				compress: {
					// compress options
					booleans: true,
					dead_code: true,
					drop_debugger: true,
					unused: true
				},
				ie8: false,
				parse: {
					// parse options
					html5_comments: false,
					shebang: false
				},
				sourceMap: false,
				toplevel: false,
				warnings: false
			})
		);
	}

	plugins.push(replacePlugin(replaceValues));

	if (options.optimize) {
		plugins.push(optJSPlugin);
	}

	return plugins;
};
