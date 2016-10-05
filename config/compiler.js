var fs = require('fs');
var path = require('path');
var buble = require('buble');

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
			compiled = buble.transform(code, options);
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
		return _compile.call(this, compiled.code, filename);
	}
	return old(m, filename);
};