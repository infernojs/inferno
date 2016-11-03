import nodeResolve from 'rollup-plugin-node-resolve';
import { aliases } from './aliases';

export class Bundles {
	constructor() {
		this.bundles = [];
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
	const newArray = Array.from(arr);
	const index = newArray.findIndex(plugin => plugin.name === 'buble');
	newArray.splice(index + 1, 0, nodeResolve(resolveConfig));
	return newArray
}

// Try to reduce bundle size by reusing installed module
// Maps inferno modules to a relative path
export function relativeModules() {
	return {
		name: 'rollup-plugin-inferno-packager',
		transformBundle(source, { format }) {
			switch (format) {
				case 'umd':
				case 'cjs':
					Object.keys(aliases).forEach(alias => {
						source = source.replace(new RegExp(`require\\('${alias}'`, 'g'), `require('./${alias}'`);
					});
					return source;
				default:
					return source;
			}
		}
	}
}
