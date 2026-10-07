import { join } from 'path';
import { readFileSync, cpSync, writeFileSync } from 'fs';
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

  for (let i = 0, len = allTsFiles.length; i < len; ++i) {
    const file = allTsFiles[i];
    cpSync(file.absolutePath, destFolder + file.relativePath, { recursive: true, force: true });
    // The flags package ships runtime enums. Publish ordinary declarations so
    // isolatedModules/verbatimModuleSyntax consumers can import those values.
    // Keep const enums in source so Inferno can still inline its own flags.
    if (pkgJSON.name === 'inferno-vnode-flags') {
      const destination = destFolder + file.relativePath;
      writeFileSync(
        destination,
        readFileSync(destination, 'utf8').replace(/\bdeclare const enum\b/g, 'declare enum')
      );
    }
  }
}
