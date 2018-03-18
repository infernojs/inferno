// This file includes all test files including inferno-compat
function requireAll(r) {
  r.keys().forEach(r);
}

requireAll(require.context('../../packages/inferno/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-clone-vnode/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-compat/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-create-class/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-create-element/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-hyperscript/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-mobx/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-redux/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-router/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-test-utils/__tests__', true, /\.jsx?$/));
requireAll(require.context('../../packages/inferno-utils/__tests__', true, /\.jsx?$/));
