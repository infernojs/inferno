const {resolve, join} = require('path');
const alias = require('@rollup/plugin-alias');
const ROOT = join(__dirname, '../../../');

module.exports = alias({
  resolve: ['.js'],
  entries: [
    {find: 'inferno', replacement: resolve(ROOT, 'packages/inferno/dist/index.esm.js')},
    {find: 'inferno-compat', replacement: resolve(ROOT, 'packages/inferno-compat/dist/index.esm.js')},
    {find: 'inferno-create-class', replacement: resolve(ROOT, 'packages/inferno-create-class/dist/index.esm.js')},
    {find: 'inferno-create-element', replacement: resolve(ROOT, 'packages/inferno-create-element/dist/index.esm.js')},
    {find: 'inferno-hyperscript', replacement: resolve(ROOT, 'packages/inferno-hyperscript/dist/index.esm.js')},
    {find: 'inferno-mobx', replacement: resolve(ROOT, 'packages/inferno-mobx/dist/index.esm.js')},
    {find: 'inferno-redux', replacement: resolve(ROOT, 'packages/inferno-redux/dist/index.esm.js')},
    {find: 'inferno-router', replacement: resolve(ROOT, 'packages/inferno-router/dist/index.esm.js')},
    {find: 'inferno-server', replacement: resolve(ROOT, 'packages/inferno-server/dist/index.esm.js')},
    {find: 'inferno-shared', replacement: resolve(ROOT, 'packages/inferno-shared/dist/index.esm.js')},
    {find: 'inferno-clone-vnode', replacement: resolve(ROOT, 'packages/inferno-clone-vnode/dist/index.esm.js')},
    {find: 'inferno-hydrate', replacement: resolve(ROOT, 'packages/inferno-hydrate/dist/index.esm.js')}
  ]
});
