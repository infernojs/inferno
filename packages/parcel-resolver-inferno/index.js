const fs = require('fs');
const path = require('node:path');
const { Resolver } = require('@parcel/plugin');

module.exports = new Resolver({
  async resolve(opts) {
    const { specifier, dependency } = opts;

    const module = specifier.endsWith(':esm')
      ? specifier.split(':')[1]
      : specifier;

    // We don't handle non-Inferno packages
    if (isNotInfernoPackage(module)) return null;
    
    const modulePath = _findPathToModule(dependency.resolveFrom, module);
    const filePath = process.env.NODE_ENV === 'production'
      ? path.join(modulePath, '/dist/index.esm.js')
      : path.join(modulePath, '/dist/index.dev.esm.js')

    return { filePath };
  }
});


function _removeLeaf(pathIn) {
  let tmp = pathIn.split(path.sep);
  // Check if empty
  if (!tmp.pop()) return undefined;
  // return a new path
  return tmp.join(path.sep);
}

function _findPathToModule(startAtPath, moduleName) {
  let tmp = _removeLeaf(startAtPath);
  let outPath = '';
  while (tmp !== undefined) {
    outPath = path.join(tmp, 'node_modules', moduleName);
    if (fs.existsSync(outPath)) {
      return outPath;
    }
    tmp = _removeLeaf(tmp);
  }
  throw new Error(`The module ${moduleName} could not be found`);
}

const _infernoPackages = [
  'inferno',
  'inferno-animation',
  'inferno-clone-vnode',
  'inferno-compat',
  'inferno-create-class',
  'inferno-create-element',
  'inferno-extras',
  'inferno-hydrate',
  'inferno-hyperscript',
  'inferno-mobx',
  'inferno-redux',
  'inferno-router',
  'inferno-server',
  'inferno-shared',
  'inferno-test-utils',
  'inferno-utils',
  'inferno-vnode-flags',
]
function isNotInfernoPackage(module) {
  return _infernoPackages.indexOf(module) < 0;
}