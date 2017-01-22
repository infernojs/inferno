import fs from 'fs';
import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';

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

const packagePath = (moduleName) => path.join(__dirname, '..', 'packages', moduleName, 'package.json');

function getPackageJSON(moduleName, defaultPackage) {
	try {
		return require(packagePath(moduleName));
	} catch (e) {
		return defaultPackage;
	}
}

export function updatePackageVersion(moduleName, defaultPackage) {
	try {
		const modulePackage = require(packagePath(moduleName));
		modulePackage.version = defaultPackage.version;
		fs.writeFileSync(packagePath(moduleName), JSON.stringify(modulePackage, null, 2), 'utf8');
	} finally {
		return getPackageJSON(moduleName, defaultPackage);
	}
}

export function withNodeResolve(arr, resolveConfig) {
	const newArray = Array.from(arr);
	const index = newArray.findIndex(plugin => plugin.name === 'buble');
	newArray.splice(index, 0, nodeResolve(resolveConfig));
	return newArray;
}
