import { readFileSync, cpSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();
const pkgJSONtext = readFileSync(join(cwd, 'package.json'));
const pkgJSON = JSON.parse(pkgJSONtext);
if (!pkgJSON.private) {
  cpSync(join(cwd, '../../build/packages/', pkgJSON.name, 'src'), join(cwd, 'tmpDist'), { recursive: true, force: true });
}
