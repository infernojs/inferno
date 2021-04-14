const { resolve, join } = require('path');
const alias = require('@rollup/plugin-alias');
const ROOT = join(__dirname, '../../../');

module.exports = alias({
  resolve: ['.js'],
  entries: [
    { find: 'inferno', replacement: resolve(ROOT, 'packages/inferno/tmpDist/index.js') },
    { find: 'inferno-animation', replacement: resolve(ROOT, 'packages/inferno-animation/tmpDist/index.js') },
    { find: 'inferno-compat', replacement: resolve(ROOT, 'packages/inferno-compat/tmpDist/index.js') },
    { find: 'inferno-create-class', replacement: resolve(ROOT, 'packages/inferno-create-class/tmpDist/index.js') },
    { find: 'inferno-create-element', replacement: resolve(ROOT, 'packages/inferno-create-element/tmpDist/index.js') },
    { find: 'inferno-hyperscript', replacement: resolve(ROOT, 'packages/inferno-hyperscript/tmpDist/index.js') },
    { find: 'inferno-mobx', replacement: resolve(ROOT, 'packages/inferno-mobx/tmpDist/index.js') },
    { find: 'inferno-redux', replacement: resolve(ROOT, 'packages/inferno-redux/tmpDist/index.js') },
    { find: 'inferno-router', replacement: resolve(ROOT, 'packages/inferno-router/tmpDist/index.js') },
    { find: 'inferno-server', replacement: resolve(ROOT, 'packages/inferno-server/tmpDist/index.js') },
    { find: 'inferno-shared', replacement: resolve(ROOT, 'packages/inferno-shared/tmpDist/index.js') },
    { find: 'inferno-clone-vnode', replacement: resolve(ROOT, 'packages/inferno-clone-vnode/tmpDist/index.js') },
    { find: 'inferno-hydrate', replacement: resolve(ROOT, 'packages/inferno-hydrate/tmpDist/index.js') }
  ]
});
