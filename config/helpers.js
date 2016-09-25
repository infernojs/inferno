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
