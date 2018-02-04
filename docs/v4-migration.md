#### V4 Breaking changes:

`inferno-component` is removed. Inferno.Component (ES6) Class has been moved to `inferno` package.

`findDOMNode` has been moved to `inferno-compat`

string components now require `inferno-compat`

Default exports have been removed from all packages except `inferno-compat`. If you are getting exception for example:
cannot read `Inferno.createComponentVNode` make sure you have babel-plugin-inferno before babel module transformers in your `.babelrc` file. 

Inferno packages are now using peerDependencies to external components to avoid duplicates

`module` entry has been added to package.json for all packages.

NOTE: This points to production build of Inferno. If you are doing development using Inferno you should use `dist/index.dev.js` or use module entry point: `dev:module`

`creatVNode` cannot be used to create Component vNodes anymore. use `createComponentVNode(flags, type, props, key, ref)` instead.

There is no more "noNormalize" parameter for `createVNode` if you have been using it and you need to normalize children use `Inferno.normalizeChildren` method.

inferno-compat users should install all dependencies they use themselves. For example:

```bash
npm install --save inferno
npm install --save inferno-compat
npm install --save inferno-clone-vnode
npm install --save inferno-create-class
npm install --save inferno-create-element
```

- Many JSX flags have changed, see babel-plugin-inferno README for more information

