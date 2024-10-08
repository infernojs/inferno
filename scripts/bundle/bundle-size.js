import { readFileSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import Table from 'cli-table';
import { gzipSize } from 'gzip-size';
import { filesize } from 'filesize';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = join(__dirname, '../../packages/');
const INFERNO_VERSION = JSON.parse(readFileSync(join(__dirname, '../../package.json'))).version;

async function getFileSize(file) {
  const data = await readFile(file, 'utf-8');
  return {
    fileSize: filesize(Buffer.byteLength(data)),
    gzipSize: filesize(await gzipSize(data))
  };
}

async function printFileSizes() {
  const files = await readdir(PACKAGES_DIR, { withFileTypes: true });
  const dirs = files.filter((f) => f.isDirectory).map((dirent) => dirent.name);

  // Exclude private packages
  const packages = dirs.filter((d) => !JSON.parse(readFileSync(join(PACKAGES_DIR, d, 'package.json'))).private).map((file) => basename(file));

  const table = new Table({
    head: [
      `INFERNO - ${INFERNO_VERSION}`,
      'Browser' + ' (gzip)',
      'Browser prod (min)' + ' (gzip)',
      'mjs' + ' (gzip)',
      'cjs' + ' (gzip)',
      'cjs prod' + ' (gzip)'
    ],
    colWidth: [100, 200, 200, 200, 200]
  });

  for (const name of packages.sort()) {
    const filesToStat = [name + '.js', name + '.min.js', 'index.mjs', 'index.cjs', 'index.min.cjs'];
    const row = [name];

    for (const file of filesToStat) {
      const sizes = await getFileSize(`${PACKAGES_DIR}/${name}/dist/${file}`);

      row.push(`${sizes.fileSize}/${sizes.gzipSize}`);
    }
    table.push(row);
  }

  console.log(table.toString());
}

printFileSizes().catch((err) => {
  console.error(err);
});
