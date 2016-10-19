const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports.aliasMapping = {
	'component/es2015': './inferno-component',
	'component/createClass': './inferno-create-class',
	'factories/createElement': './inferno-create-element',
	'DOM/rendering': './inferno'
};

module.exports.aliases = findAliases()
module.exports.compilerAliases = changePaths(module.exports.aliases)

/**
 * Finds aliases inside .babelrc
 * @param plugins
 * @returns {*}
 */
function findAliases(plugins) {
	const babelrcPath = path.join(__dirname, '../.babelrc');
	const babelrc = JSON.parse(fs.readFileSync(babelrcPath, 'utf-8'));

	return _.reduce(babelrc.plugins, (result, plugin) => {
		if (_.isArray(plugin) && plugin[1] && plugin[1].alias) {
			result = plugin[1].alias
		}
		return result;
	}, {})
}

/**
 * Corrects paths relative to compiler.js
 * @param hashmap
 * @returns {*}
 */
function changePaths(hashmap) {
	Object.keys(hashmap).forEach(key => {
		hashmap[key] = hashmap[key].replace('./src', '../../src')
	})
	return hashmap;
}

