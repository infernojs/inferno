require('ts-node').register({
	compilerOptions: {
		jsx: 'preserve'
	},
	lazy: true
});

const fs = require('fs');
const path = require('path');
const buble = require('buble');
const babel = require('babel-core');
const convert = require('convert-source-map');
const merge = require('merge-source-map');

const nodeModulesPattern = path.sep === '/' ? /\/node_modules\// : /\\node_modules\\/;

const bubleOptions = {
	objectAssign: 'Object.assign',
	target: {
		node: 6
	},
	transforms: {
		modules: false,
		classes: true
	}
};

const babelOptions = {
	babelrc: false,
	sourceMaps: true,
	compact: false,
	presets: [],
	plugins: [
		'transform-es2015-modules-commonjs',
		[ 'babel-plugin-inferno', { imports: true }]
	]
};

registerExtension('.ts');
registerExtension('.tsx');

function registerExtension(ext) {

	const old = require.extensions[ext];
	if (!old) {
		throw new Error('ts-node/register or equivalent compiler must be used before this compiler.');
	}

	require.extensions[ext] = function (m, filename) {

		if (nodeModulesPattern.test(filename)) {
			return old(m, filename);
		}
		let _compile = m._compile;
		m._compile = function (code, fileName) {
			let compiled;
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
