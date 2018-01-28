const { resolve, join } = require('path');
const alias = require('rollup-plugin-alias');
const ROOT = join(__dirname, '../../../');

module.exports = alias({
  resolve: ['.mjs', '.js'],
  inferno: resolve(ROOT, 'packages/inferno/dist/index.mjs'),
  'inferno-compat': resolve(ROOT, 'packages/inferno-compat/dist/index.mjs'),
  'inferno-create-class': resolve(ROOT, 'packages/inferno-create-class/dist/index.mjs'),
  'inferno-create-element': resolve(ROOT, 'packages/inferno-create-element/dist/index.mjs'),
  'inferno-hyperscript': resolve(ROOT, 'packages/inferno-hyperscript/dist/index.mjs'),
  'inferno-mobx': resolve(ROOT, 'packages/inferno-mobx/dist/index.mjs'),
  'inferno-redux': resolve(ROOT, 'packages/inferno-redux/dist/index.mjs'),
  'inferno-router': resolve(ROOT, 'packages/inferno-router/dist/index.mjs'),
  'inferno-server': resolve(ROOT, 'packages/inferno-server/dist/index.mjs'),
  'inferno-shared': resolve(ROOT, 'packages/inferno-shared/dist/index.mjs'),
  'inferno-clone-vnode': resolve(ROOT, 'packages/inferno-clone-vnode/dist/index.mjs')
});
