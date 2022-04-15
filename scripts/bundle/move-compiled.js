const join = require('path').join;
const cwd = process.cwd();
const pkgJSON = require(join(cwd, 'package.json'));
const { copySync } = require('fs-extra/lib/copy');

if (pkgJSON.private) {
  return;
}

copySync(join(cwd, '../../build/packages/', pkgJSON.name, 'src'), join(cwd, 'tmpDist'), { overwrite: true });
