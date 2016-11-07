require('ts-node').register({
	compilerOptions: {
		jsx: 'preserve'
	},
	lazy: true
});

var fs = require('fs');
var path = require('path');
var buble = require('buble');
var babel = require('babel-core');
var convert = require('convert-source-map');
var merge = require('merge-source-map');
var virtuals = require('./aliases');

var nodeModulesPattern = path.sep === '/' ? /\/node_modules\// : /\\node_modules\\/;

var bubleOptions = {
	objectAssign: 'Object.assign',
	target: {
		node: 6
	},
	transforms: {
		modules: false,
		classes: true
	}
};

var babelOptions = {
	babelrc: false,
	sourceMaps: true,
	compact: false,
	presets: [],
	plugins: [
		"transform-es2015-modules-commonjs",
		"babel-plugin-inferno",
		["module-resolver", {
			"alias": virtuals.compilerAliases
		}]
	]
};

registerExtension('.ts');
registerExtension('.tsx');

function registerExtension(ext) {

	var old = require.extensions[ext];
	if (!old) {
		throw new Error('ts-node/register or equivalent compiler must be used before this compiler.')
	}

	require.extensions[ext] = function (m, filename) {

		if (nodeModulesPattern.test(filename)) return old(m, filename);
		var _compile = m._compile;
		m._compile = function (code, fileName) {
			var compiled;
			try {
				// extract map from ts-node (ES6) output
				const tsMap = convert.fromMapFileSource(code);

				// transpile es2015 modules (import/export) using babel
				const babelResult = babel.transform(code, babelOptions);

				// merge TS and babel maps
				const tsAndBabelMap = merge(tsMap.sourcemap, babelResult.map);

				// ES6 -> ES5 using buble
				const bubleResult = buble.transform(babelResult.code, Object.assign({ source: filename }, bubleOptions));

				// merge babel map with previous map
				const finalMap = merge(tsAndBabelMap, bubleResult.map);

				// join the final code with the final sourcemap
				const codeWithoutMap = convert.removeMapFileComments(bubleResult.code);
				const sourceMapComment = convert.fromObject(finalMap).toComment();

				compiled = codeWithoutMap + sourceMapComment;
			} catch (err) {
				if (err.snippet) {
					console.log('Error compiling ' + filename + ':\n---');
					console.log(err.snippet);
					console.log(err.message);
					console.log('');
					process.exit(1);
				}
				throw err;
			}
			return _compile.call(this, compiled, filename);
		};
		return old(m, filename);
	};
}
