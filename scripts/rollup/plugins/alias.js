const { resolve, join } = require('path');
const alias = require('@rollup/plugin-alias');
const ROOT = join(__dirname, '../../../');

module.exports = alias({
  resolve: ['.js'],
  entries: [
    { find: 'inferno', replacement: resolve(ROOT, 'packages/inferno/lib/index.js') },
    { find: 'inferno-animation', replacement: resolve(ROOT, 'packages/inferno-animation/lib/index.js') },
    { find: 'inferno-compat', replacement: resolve(ROOT, 'packages/inferno-compat/lib/index.js') },
    { find: 'inferno-create-class', replacement: resolve(ROOT, 'packages/inferno-create-class/lib/index.js') },
    { find: 'inferno-create-element', replacement: resolve(ROOT, 'packages/inferno-create-element/lib/index.js') },
    { find: 'inferno-hyperscript', replacement: resolve(ROOT, 'packages/inferno-hyperscript/lib/index.js') },
    { find: 'inferno-mobx', replacement: resolve(ROOT, 'packages/inferno-mobx/lib/index.js') },
    { find: 'inferno-redux', replacement: resolve(ROOT, 'packages/inferno-redux/lib/index.js') },
    { find: 'inferno-router', replacement: resolve(ROOT, 'packages/inferno-router/lib/index.js') },
    { find: 'inferno-server', replacement: resolve(ROOT, 'packages/inferno-server/lib/index.js') },
    { find: 'inferno-shared', replacement: resolve(ROOT, 'packages/inferno-shared/lib/index.js') },
    { find: 'inferno-clone-vnode', replacement: resolve(ROOT, 'packages/inferno-clone-vnode/lib/index.js') },
    { find: 'inferno-hydrate', replacement: resolve(ROOT, 'packages/inferno-hydrate/lib/index.js') }
  ]
});
