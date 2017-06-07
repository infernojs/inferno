#!/usr/bin/env node

const fs = require('fs');
const { join } = require('path');

const PACKAGES_DIR = join(__dirname, '../../packages');
const INFERNO_VERSION = require(join(__dirname, '../../package.json')).version;
const PACKAGES = fs.readdirSync(PACKAGES_DIR).filter(path => fs.statSync(join(PACKAGES_DIR, path)).isDirectory());

function updateDependencies(name, deps) {
	for (const dep in deps) {
		if (PACKAGES.includes(dep)) {
			deps[dep] = `^${INFERNO_VERSION}`;
		}
	}
}

let failedToUpdate = false;
for (let i = 0; i < PACKAGES.length; i += 1) {
	const pkgJSONPath = join(PACKAGES_DIR, PACKAGES[i], 'package.json');
	const pkgJSON = require(pkgJSONPath);

	if (pkgJSON.version !== INFERNO_VERSION) {
		pkgJSON.version = INFERNO_VERSION;
	}

	updateDependencies(pkgJSON.name, pkgJSON.dependencies);
	updateDependencies(pkgJSON.name, pkgJSON.devDependencies);

	const pkgJSONStr = JSON.stringify(pkgJSON, null, 2);
	try {
		fs.writeFileSync(pkgJSONPath, pkgJSONStr);
	} catch (e) {
		failedToUpdate = true;
		console.error('Failed to update %s: %s', pkgJSON.name, e);
	}
}

if (failedToUpdate) {
	process.exit(1);
}
