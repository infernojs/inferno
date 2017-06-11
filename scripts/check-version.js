#!/usr/bin/env node

const fs = require('fs');
const { join } = require('path');

const PACKAGES_DIR = join(__dirname, '../../packages');
const INFERNO_VERSION = require(join(__dirname, '../../package.json')).version;

fs.readdir(PACKAGES_DIR, (err, paths) => {
	if (err) {
		throw Error(err);
	}

	let allVersionsMatch = true;
	for (let i = 0; i < paths.length; i += 1) {
		const pathStat = fs.statSync(join(PACKAGES_DIR, paths[i]));

		if (pathStat.isDirectory()) {
			const pkgJSON = require(join(PACKAGES_DIR, paths[i], 'package.json'));

			if (pkgJSON.version !== INFERNO_VERSION) {
				allVersionsMatch = false;
				console.log(
					'%s version does not match package.json. Expected %s, saw %s.',
					pkgJSON.name,
					INFERNO_VERSION,
					pkgJSON.version,
				);
			}
		}
	}

	if (!allVersionsMatch) {
		process.exit(1);
	}
});
