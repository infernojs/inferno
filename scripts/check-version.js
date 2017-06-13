#!/usr/bin/env node

const fs = require('fs');
const { join } = require('path');

const PACKAGES_DIR = join(__dirname, '../packages');
const INFERNO_VERSION = require(join(__dirname, '../package.json')).version;
const PACKAGES = fs.readdirSync(PACKAGES_DIR);

const lernaJSON = require(join(__dirname, '../lerna.json'));
lernaJSON.version = INFERNO_VERSION;
fs.writeFileSync(join(__dirname, '../lerna.json'), JSON.stringify(lernaJSON, null, 2));

function checkDeps(deps, pkgJSON) {
  for (const dep in deps) {
    if (PACKAGES.indexOf(dep) > -1) {
      if (deps[dep] !== INFERNO_VERSION) {
        console.log(
          '%s version does not match package.json. Expected %s, saw %s.',
          pkgJSON.name,
          INFERNO_VERSION,
          pkgJSON.version
        );
      }
    }
  }
}

for (let i = 0; i < PACKAGES.length; i += 1) {
  const pathStat = fs.statSync(join(PACKAGES_DIR, PACKAGES[i]));

  if (pathStat.isDirectory()) {
    const pkgJSON = require(join(PACKAGES_DIR, PACKAGES[i], 'package.json'));

    if (pkgJSON.version !== INFERNO_VERSION) {
      console.log(
        '%s version does not match package.json. Expected %s, saw %s.',
        pkgJSON.name,
        INFERNO_VERSION,
        pkgJSON.version
      );

    }

    checkDeps(pkgJSON.dependencies, pkgJSON);
    checkDeps(pkgJSON.devDependencies, pkgJSON);
  }
}
