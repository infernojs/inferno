#!/usr/bin/env node

const fs = require('fs');
const { join } = require('path');

const PACKAGES_DIR = join(__dirname, '../packages');
const INFERNO_VERSION = require(join(__dirname, '../package.json')).version;

const lernaJSON = require(join(__dirname, '../lerna.json'));
lernaJSON.version = INFERNO_VERSION;
fs.writeFileSync(join(__dirname, '../lerna.json'), JSON.stringify(lernaJSON, null, 2));

function updateDeps(deps, pkgJSON) {
  for (const dep in deps) {
    if (dep === 'inferno' || dep.indexOf('inferno-') === 0) {
      if (deps[dep] !== INFERNO_VERSION) {
        deps[dep] = INFERNO_VERSION;
        console.log(
          '%s version does not match package.json. Updating %s, to %s.',
          pkgJSON.name,
          pkgJSON.version,
          INFERNO_VERSION,
        );
      }
    }
  }
}

fs.readdir(PACKAGES_DIR, (err, paths) => {
  if (err) {
    throw Error(err);
  }

  for (let i = 0; i < paths.length; i += 1) {
    const pathStat = fs.statSync(join(PACKAGES_DIR, paths[i]));

    if (pathStat.isDirectory()) {
      const pkgJSON = require(join(PACKAGES_DIR, paths[i], 'package.json'));

      if (pkgJSON.version !== INFERNO_VERSION) {
        console.log(
          '%s version does not match package.json. Updating %s, to %s.',
          pkgJSON.name,
          pkgJSON.version,
          INFERNO_VERSION,
        );

        pkgJSON.version = INFERNO_VERSION;
        updateDeps(pkgJSON.dependencies, pkgJSON);
        updateDeps(pkgJSON.devDependencies, pkgJSON);

        fs.writeFileSync(join(PACKAGES_DIR, paths[i], 'package.json'), JSON.stringify(pkgJSON, null, 2));
      }
    }
  }
});
