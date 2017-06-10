const fs = require('fs');
const { join } = require('path');

const infernoBuildVersion = require('../../package.json').version;
console.log(`Inferno Build @ ${infernoBuildVersion}`);

const PACKAGE_ROOT = join(__dirname, '../../packages');
fs.readdir(PACKAGE_ROOT, (err, packages) => {
	if (err) {
		throw Error(err);
	}

	for (let i = 0, n = packages.length; i < n; i += 1) {
		const pkg = packages[i];
		if (fs.statSync(join(PACKAGE_ROOT, pkg)).isDirectory()) {
			const pkgJSON = require(join(PACKAGE_ROOT, pkg, 'package.json'));

			if (infernoBuildVersion !== pkgJSON.version) {
				console.error(`${pkgJSON.name} mismatch version @ ${pkgJSON.version}`);
				pkgJSON.version = infernoBuildVersion;
				try {
					const newPkgJSON = JSON.stringify(pkgJSON, null, 2);
					fs.writeFileSync(join(PACKAGE_ROOT, pkg, 'package.json'), newPkgJSON);
				} catch (e) {
					console.warn(`Skipping writing ${pkgJSON.name}: ${e}`);
				}
			}
		}
	}
});
