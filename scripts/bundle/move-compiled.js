import { readFileSync } from 'fs';
import { join } from 'path';
import { copySync } from 'fs-extra/esm';

const cwd = process.cwd();
const pkgJSONtext = readFileSync(join(cwd, 'package.json'));
const pkgJSON = JSON.parse(pkgJSONtext);

if (!pkgJSON.private) {
  copySync(join(cwd, '../../build/packages/', pkgJSON.name, 'src'), join(cwd, 'tmpDist'), { overwrite: true });
}
