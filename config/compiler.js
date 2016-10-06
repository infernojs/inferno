var fs = require('fs');
var path = require('path');
var buble = require('buble');
var babel = require('babel-core');
var convert = require('convert-source-map');
var merge = require('merge-source-map');

var nodeVersion = /(?:0\.)?\d+/.exec(process.version)[0];
var nodeModulesPattern = path.sep === '/' ? /\/node_modules\// : /\\node_modules\\/;
var options = {
	target: {
		node: nodeVersion
	},
	transforms: {
		modules: false,
		classes: true
	}
};

var old = require.extensions['.ts'];
if (!old) {
	throw new Error('ts-node/register or equivalent compiler must be used before this compiler.')
}

require.extensions['.ts'] = function (m, filename) {
	
	if ( nodeModulesPattern.test( filename ) ) return old( m, filename );
	var _compile = m._compile;
	m._compile = function (code, fileName) { 
		var compiled;
		try {
			// extract map from ts-node (ES6) output
			const tsMap = convert.fromMapFileSource(code);

			// ES6 -> ES5 using buble
			const bubleResult = buble.transform(code, Object.assign({source: filename}, options));

			// merge TS and buble maps
			const tsAndBubleMap = merge(tsMap.sourcemap, bubleResult.map);

			// transpile es2015 modules (import/export) using babel
			const transpiledModules = babel.transform(bubleResult.code, {
				sourceMaps: true,
				presets: [],
				plugins: ["transform-es2015-modules-commonjs"]
			});

			// merge babel map with previous map
			const finalMap = merge(tsAndBubleMap, transpiledModules.map);

			// join the final code with the final sourcemap
			const codeWithoutMap = convert.removeMapFileComments(transpiledModules.code);
			const sourceMapComment = convert.fromObject(finalMap).toComment();

			compiled = codeWithoutMap + sourceMapComment;
		} catch (err) {
			if (err.snippet) {
				console.log('Error compiling ' + filename + ':\n---');
				console.log(err.snippet);
				console.log(err.message);
				console.log('')
				process.exit(1);
			}
			throw err;
		}
		return _compile.call(this, compiled, filename);
	}
	return old(m, filename);
};