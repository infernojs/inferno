#!/usr/bin/env node

const fs = require('fs');
const { join } = require('path');

const PACKAGES_DIR = join(__dirname, '../../packages');
const INFERNO_VERSION = require(join(__dirname, '../../package.json')).version;
const PACKAGES = fs.readdirSync(PACKAGES_DIR).filter(path => fs.statSync(join(PACKAGES_DIR, path)).isDirectory());

function checkDependencies(name, deps) {
	for (const dep in deps) {
		if (PACKAGES.includes(dep) && deps[dep].indexOf(INFERNO_VERSION) === -1) {
			throw Error(`Version Mismatch: ${name}. ${dep} @ ${deps[dep]}`);
		}
	}
}

let failed = false;
for (let i = 0; i < PACKAGES.length; i += 1) {
	const pkgJSONPath = join(PACKAGES_DIR, PACKAGES[i], 'package.json');
	const pkgJSON = require(pkgJSONPath);

	if (pkgJSON.version !== INFERNO_VERSION) {
		failed = true;
	}

	try {
		checkDependencies(pkgJSON.name, pkgJSON.dependencies);
		checkDependencies(pkgJSON.name, pkgJSON.devDependencies);
	} catch (e) {
		console.error(e.message);
		failed = true;
	}
}

if (failed) {
	process.exit(1);
}
