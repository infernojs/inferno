import { join } from 'path';
import { readFileSync, cpSync } from 'fs';
import { readFilesInDir } from './read-files-in-dir.js';

const cwd = process.cwd();
const pkgJSONtext = readFileSync(join(cwd, 'package.json'));
const pkgJSON = JSON.parse(pkgJSONtext);

if (!pkgJSON.private) {
  const allTsFiles = [];
  const srcFolder = join(cwd, '../../build/packages/', pkgJSON.name, 'src');
  const destFolder = join(cwd, 'dist');

  readFilesInDir(srcFolder, (fileName) => {
    if (fileName.endsWith('.ts')) {
      allTsFiles.push({
        absolutePath: fileName,
        relativePath: fileName.substring(srcFolder.length)
      });
    }
  });

  for (const file of allTsFiles) {
    cpSync(file.absolutePath, destFolder + file.relativePath, { recursive: true, force: true });
  }
}
