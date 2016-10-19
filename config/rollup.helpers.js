import { each } from 'lodash';
import nodeResolve from 'rollup-plugin-node-resolve';
import { aliasMapping } from './aliases';

export class Bundles {
	constructor() {
		this.bundles = [];
		this.skipped = [];
		this._only = [];
	}
	add(bundle) {
		this.bundles.push(bundle);
		return this;
	}
	skip(bundle) {
		return this;
	}
	only(bundle) {
		this._only.push(bundle);
		return this;
	}
	map(predicate) {
		if (this._only.length) {
			return this._only.map(predicate);
		}
		return this.bundles.map(predicate);
	}
}

export function getPackageJSON(moduleName, defaultPackage) {
	try {
		return require('../packages/' + moduleName + '/package.json');
	} catch(e) {
		return defaultPackage
	}
}

export function withNodeResolve(arr, resolveConfig) {
	const newArray = Array.from(arr)
	const index = newArray.findIndex(plugin => plugin.name === 'buble')
	newArray.splice(index + 1, 0, nodeResolve(resolveConfig))
	return newArray
}

const mapping = {
	'component\/es2015': './inferno-component',
	'component\/createClass': './inferno-create-class',
	'factories\/createElement': './inferno-create-element',
	'DOM\/rendering': './inferno'
};

// Try to reduce bundle size by reusing installed module
export function relativeModules() {
	return {
		name: 'rollup-plugin-inferno-packager',
		transformBundle(source, { format }) {
			switch (format) {
				/*case 'umd':
					return source.replace(
						/require\('inferno-([\w-]+)'/g,
						`require('./inferno-$1'`
					);
				case 'cjs':
					return source.replace(
						/interopDefault\(require\('inferno-([\w-]+)'/g,
						`interopDefault(require('./inferno-$1'`
					);*/
				case 'umd':
				case 'cjs':
					Object.keys(aliasMapping).forEach(alias => {
						source = source.replace(new RegExp(`require\\('${alias}'`, 'g'), `require('${aliasMapping[alias]}'`);
					})
					return source
				default:
					return source;
			}
		}
	}
}
