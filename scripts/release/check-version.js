const fs = require('fs');
const { join } = require('path');

const infernoBuildVersion = require('../../package.json').version;
console.log(`Inferno Build @ ${infernoBuildVersion}`);

const PACKAGE_ROOT = join(__dirname, '../../packages');
fs.readdir(PACKAGE_ROOT, (err, packages) => {
	if (err) {
		throw Error(err);
	}

	let fail = false;
	for (let i = 0, n = packages.length; i < n; i += 1) {
		const package = packages[i];
		if (fs.statSync(join(PACKAGE_ROOT, package)).isDirectory()) {
			const pkgJSON = require(join(PACKAGE_ROOT, package, 'package.json'));

			if (infernoBuildVersion !== pkgJSON.version) {
				console.error(`${pkgJSON.name} mismatch version @ ${pkgJSON.version}`);
				fail = true;
			}
		}
	}
	if (fail) {
		console.error('Inferno Version Check Failed');
	} else {
		console.log('Inferno Version Check Passed');
	}
});
