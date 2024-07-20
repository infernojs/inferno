import { join } from 'path';
import { readdirSync, lstatSync, existsSync } from 'fs';

export function readFilesInDir(startPath, callback) {
  if (!existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }

  const files = readdirSync(startPath);

  for (let i = 0; i < files.length; i++) {
    const filename = join(startPath, files[i]);
    const stat = lstatSync(filename);
    if (stat.isDirectory()) {
      readFilesInDir(filename, callback); //recurse
    } else {
      callback(filename);
    }
  }
}
