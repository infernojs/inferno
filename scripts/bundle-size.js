#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const { promisify } = require('util');
const { join, basename } = require('path');
const fileSize = require('filesize');
const gzipSize = require('gzip-size');
const Table = require('cli-table');
require('colors');

const PACKAGES_DIR = join(__dirname, '../packages');
const INFERNO_VERSION = require(join(__dirname, '../package.json')).version;
const readFileAsync = promisify(fs.readFile);
const globAsync = promisify(glob);

async function printFileSizes() {
  const dirs = await globAsync(PACKAGES_DIR + '/*');

  // Exclude private packages
  const packages = dirs.filter(d => !require(join(d, 'package.json')).private).map(file => basename(file));

  const table = new Table({
    head: [
      `INFERNO - ${INFERNO_VERSION}`.cyan,
      'Browser'.cyan + ' (gzip)'.green,
      'Browser prod (min)'.cyan + ' (gzip)'.green,
      '(es2015)'.cyan + ' (gzip)'.green,
      'cjs'.cyan + ' (gzip)'.green,
      'cjs prod'.cyan + ' (gzip)'.green
    ],
    colWidth: [100, 200, 200, 200, 200]
  });

  for (const name of packages.sort()) {
    const filesToStat = [name + '.js', name + '.min.js', 'index.esm.js', 'index.cjs.js', 'index.cjs.min.js'];
    const row = [name];

    for (const file of filesToStat) {
      const sizes = await getFileSize(`${PACKAGES_DIR}/${name}/dist/${file}`);

      row.push(`${sizes.fileSize}/${sizes.gzipSize.green}`);
    }
    table.push(row);
  }

  console.log(table.toString());
}

printFileSizes().catch(err => {
  console.error(err);
});

// ------------- Helpers

async function getFileSize(file) {
  const data = await readFileAsync(file, 'utf-8');
  return {
    fileSize: fileSize(Buffer.byteLength(data)),
    gzipSize: fileSize(await gzipSize(data))
  };
}
