import nodeResolve from 'rollup-plugin-node-resolve';

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

// Try to reduce bundle size by reusing installed module
export function relativeModules() {
	return {
		name: 'rollup-plugin-inferno-packager',
		transformBundle(source, { format }) {
			switch (format) {
				case 'umd':
					return source.replace(
						/require\('inferno-([\w-]+)'/g,
						`require('./inferno-$1'`
					);
				case 'cjs':
					return source.replace(
						/interopDefault\(require\('inferno-([\w-]+)'/g,
						`interopDefault(require('./inferno-$1'`
					);
				default:
					return source;
			}
		}
	}
}
