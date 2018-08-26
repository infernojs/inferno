const { resolve, join } = require('path');
const alias = require('rollup-plugin-alias');
const ROOT = join(__dirname, '../../../');

module.exports = alias({
  resolve: ['.js'],
  inferno: resolve(ROOT, 'packages/inferno/dist/index.esm.js'),
  'inferno-compat': resolve(ROOT, 'packages/inferno-compat/dist/index.esm.js'),
  'inferno-create-class': resolve(ROOT, 'packages/inferno-create-class/dist/index.esm.js'),
  'inferno-create-element': resolve(ROOT, 'packages/inferno-create-element/dist/index.esm.js'),
  'inferno-hyperscript': resolve(ROOT, 'packages/inferno-hyperscript/dist/index.esm.js'),
  'inferno-mobx': resolve(ROOT, 'packages/inferno-mobx/dist/index.esm.js'),
  'inferno-redux': resolve(ROOT, 'packages/inferno-redux/dist/index.esm.js'),
  'inferno-router': resolve(ROOT, 'packages/inferno-router/dist/index.esm.js'),
  'inferno-server': resolve(ROOT, 'packages/inferno-server/dist/index.esm.js'),
  'inferno-shared': resolve(ROOT, 'packages/inferno-shared/dist/index.esm.js'),
  'inferno-clone-vnode': resolve(ROOT, 'packages/inferno-clone-vnode/dist/index.esm.js'),
  'inferno-hydrate': resolve(ROOT, 'packages/inferno-hydrate/dist/index.esm.js')
});
