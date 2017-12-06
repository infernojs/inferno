#!/usr/bin/env node

const fs = require("fs");
const { join } = require("path");
const fileSize = require("filesize");
const gzipSize = require("gzip-size");
const Table = require('cli-table');
const colors = require('colors');

const PACKAGES_DIR = join(__dirname, "../packages");
const INFERNO_VERSION = require(join(__dirname, "../package.json")).version;
const PACKAGES = fs.readdirSync(PACKAGES_DIR);

const FILE_SIZES = [];
let remainingFiles = PACKAGES.length * 4;
let emptyFirstBox = "                                  ";

function printFileSizes() {
  const table = new Table({
    head: [`INFERNO - ${INFERNO_VERSION}`.cyan, 'Browser'.cyan, 'Minified'.cyan, 'ES6'.cyan, 'Common-JS'.cyan],
    colWidth: [100, 200, 200, 200, 200]
  });

  FILE_SIZES.forEach((data) => {
    const sizes = data.sizes;

    table.push([data.name, `${sizes[0]}/${sizes[1].green}`, `${sizes[2]}/${sizes[3].green}`, `${sizes[4]}/${sizes[5].green}`, `${sizes[6]}/${sizes[7].green}`]);
  });

  console.log(table.toString());
}

for (let i = 0; i < PACKAGES.length; i++) {
  const pkgJSON = require(join(PACKAGES_DIR, PACKAGES[i], 'package.json'));
  // Ignore private packages
  if (pkgJSON.private) {
    remainingFiles -= 4;
    continue;
  }
  const pathStat = fs.statSync(join(PACKAGES_DIR, PACKAGES[i], "dist"));

  if (pathStat.isDirectory()) {
    const bundleSizes = [];
    FILE_SIZES.push({
      name: PACKAGES[i],
      sizes: bundleSizes
    });

    [PACKAGES[i] + ".js", PACKAGES[i] + ".min.js", "index.es.js", "index.js"].forEach((file) => {
      fs.readFile(join(PACKAGES_DIR, PACKAGES[i], "dist", file), 'utf-8', (err, data) => {
        bundleSizes.push(fileSize(Buffer.byteLength(data)));
        bundleSizes.push(fileSize(gzipSize.sync(data)));
        remainingFiles--;
        if (remainingFiles === 0) {
          printFileSizes();
        }
      });
    });
  }
}
