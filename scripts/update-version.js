#!/usr/bin/env node

const fs = require("fs");
const { join } = require("path");

const PACKAGES_DIR = join(__dirname, "../packages");
const INFERNO_VERSION = require(join(__dirname, "../package.json")).version;
const PACKAGES = fs.readdirSync(PACKAGES_DIR);

const lernaJSON = require(join(__dirname, "../lerna.json"));
lernaJSON.version = INFERNO_VERSION;
fs.writeFileSync(
  join(__dirname, "../lerna.json"),
  JSON.stringify(lernaJSON, null, 2)
);

function updateDeps(deps, pkgJSON) {
  let res = false;
  for (const dep in deps) {
    if (PACKAGES.indexOf(dep) > -1) {
      if (deps[dep] !== INFERNO_VERSION) {
        res = true;
        deps[dep] = INFERNO_VERSION;
        console.log(
          "%s version in %s does not match package.json. Updating %s, to %s.",
          dep,
          pkgJSON.name,
          pkgJSON.version,
          INFERNO_VERSION
        );
      }
    }
  }
  return res;
}

for (let i = 0; i < PACKAGES.length; i += 1) {
  const pathStat = fs.statSync(join(PACKAGES_DIR, PACKAGES[i]));

  if (pathStat.isDirectory()) {
    let failed = false;
    const pkgJSON = require(join(PACKAGES_DIR, PACKAGES[i], "package.json"));

    if (pkgJSON.version !== INFERNO_VERSION) {
      failed = true;
      pkgJSON.version = INFERNO_VERSION;
      console.log(
        "%s version does not match package.json. Updating %s, to %s.",
        pkgJSON.name,
        pkgJSON.version,
        INFERNO_VERSION
      );
    }

    let resdeps = updateDeps(pkgJSON.dependencies, pkgJSON);
    let resdevdeps = updateDeps(pkgJSON.devDependencies, pkgJSON);

    failed = failed || resdeps || resdevdeps;
    if (failed) {
      fs.writeFileSync(
        join(PACKAGES_DIR, PACKAGES[i], "package.json"),
        JSON.stringify(pkgJSON, null, 2)
      );
    }
  }
}
