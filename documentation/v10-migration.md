# InfernoJS v10.0.0

## Breaking changes

### Use version 10 of the JSX plugins

Inferno 10 needs JSX compiled by version 10 of its JSX plugins:

| Plugin                 | Inferno 9 and older | Inferno 10 |
| ---------------------- | ------------------- | ---------- |
| `babel-plugin-inferno` | 7.x                 | 10.x       |
| `ts-plugin-inferno`    | 7.x                 | 10.x       |
| `swc-plugin-inferno`   | 3.x                 | 10.x       |

Version 10 of `babel-plugin-inferno` and `ts-plugin-inferno` requires Node.js 24 or newer to compile JSX. `ts-plugin-inferno` depends on TypeScript 6.

- **JSX compiled by an older plugin does not work with Inferno 10.** The vNode flags have new values (see [below](#vnodeflags-have-new-values)), so elements such as `<svg>`, `<input>`, `<select>` and `<textarea>` would render wrong. Compile all JSX again with the v10 plugins. Dependencies that ship precompiled JSX need versions built for Inferno 10 too.
- The v10 plugins compile JSX to the new factories `newVNode`, `newComponentVNode`, `newFragment` and `newTextVNode`, see [below](#jsx-plugins).
- Update Inferno and the JSX plugin together. The v10 plugins do not declare an Inferno peer dependency, so package managers do not enforce their compatibility.
- The v10 plugins report JSX that Inferno 10 would render wrong as a build error that shows the source code: `$ReCreate`, a `ref` without a value, and a child flag that the children cannot have, such as `$HasVNodeChildren` on several children.
- **From version 10 on, the major version of each JSX plugin matches the major version of Inferno.** Use plugin 10.x with Inferno 10.x, plugin 11.x with Inferno 11.x, and so on.

### `vNode.childFlags` and `vNode.isValidated` have been removed

A vNode has one field less: its `ChildFlags` are stored in bits of `vNode.flags`. Each vNode is 4 bytes smaller in Chrome and 32 bytes smaller in Firefox, where the object drops to a smaller size class.

The deprecated `createVNode` and `createFragment` still take a separate `childFlags` argument. It is a `ChildFlags` value as in v9, while their `flags` argument has the `VNodeFlags` values of v10 (see [below](#vnodeflags-have-new-values)). The new `new*` factories take the child bit in `flags`, see [below](#the-vnode-factories-take-the-child-bit-in-flags). Code that read the property tests the matching bit of `flags` instead. `getChildFlags` gives the `ChildFlags` value, for passing it on to a deprecated factory:

```js
import { createFragment, getChildFlags, newFragment } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

// v9: vNode.childFlags === ChildFlags.HasKeyedChildren
(vNode.flags & VNodeFlags.HasKeyedChildren) !== 0;

// v9: createFragment(children, vNode.childFlags)
newFragment(
  VNodeFlags.Fragment | (vNode.flags & VNodeFlags.ChildFlagsMask),
  children,
);
// or, with the deprecated factory
createFragment(children, getChildFlags(vNode));
```

- Don't write `vNode.flags` from constants. Combine the new bits with `vNode.flags & VNodeFlags.ChildFlagsMask` so the children keep their shape.
- `vNode.flags` also has bits for the shape of the children and for Inferno's own state. Test it with masks and never compare the whole value to a constant.
- The development-only `vNode.isValidated` property is the `VNodeFlags.Validated` bit now.

### `VNodeFlags` have new values

The JSX plugins write the flags of each vNode into the compiled code as one number, and Inferno's own code tests them with numbers too, so the bits that compiled apps and Inferno use most have the smallest values.

**JSX compiled by the v9 plugins does not work with Inferno 10.** Compile it again with the [v10 plugins](#use-version-10-of-the-jsx-plugins). This includes packages on npm that ship JSX compiled for Inferno 9.

| Flag                           | v9    | v10     |
| ------------------------------ | ----- | ------- |
| `ComponentUnknown`             | 2     | 0       |
| `HtmlElement`                  | 1     | 1       |
| `HasTextChildren`              | -     | 2       |
| `HasNonKeyedChildren`          | -     | 4       |
| `HasVNodeChildren`             | -     | 8       |
| `HasInvalidChildren`           | -     | 16      |
| `HasKeyedChildren`             | -     | 32      |
| `SvgElement`                   | 32    | 64      |
| `ComponentClass`               | 4     | 128     |
| `Fragment`                     | 8192  | 256     |
| `InputElement`                 | 64    | 512     |
| `Text`                         | 16    | 1024    |
| `TextareaElement`              | 128   | 2048    |
| `SelectElement`                | 256   | 4096    |
| `ComponentFunction`            | 8     | 8192    |
| `Portal`                       | 1024  | 16384   |
| `ForwardRef`                   | 32768 | 32768   |
| `InUse`                        | 16384 | 65536   |
| `ContentEditable`              | 4096  | 131072  |
| `Validated` (development only) | -     | 262144  |
| `Normalized`                   | 65536 | 524288  |
| `ReCreate`                     | 2048  | removed |

- Code that creates vNodes or reads `vNode.flags` by name, for example to test `VNodeFlags.Text` or `VNodeFlags.ComponentClass`, must use `inferno-vnode-flags` 10. How it gets the values depends on how it is compiled:
  - `tsc` replaces the names of a `const enum` with their numbers, so code compiled against `inferno-vnode-flags` 9 has the old numbers in it. Compile it again against version 10.
  - Babel, SWC, esbuild and other compilers that see one file at a time import `VNodeFlags` at runtime. The code gets the new values once it depends on `inferno-vnode-flags` `^10.0.0`, without a rebuild, but an older nested copy of the package keeps the old values.
- Never write flag numbers by hand; they can change between major versions.
- `ChildFlags` keep their values, so the deprecated `createVNode` and `createFragment` take the same `childFlags` as before.
- `ComponentUnknown` has no bit: `newComponentVNode` replaces it with the type it finds, so a vNode never has it. `VNodeFlags.Component` is `ComponentClass | ComponentFunction`.
- The child bits are not in the order of `ChildFlags`, so a `ChildFlags` value can't be shifted into place. Use the `VNodeFlags` bit of the same name.

### `$ReCreate` and `VNodeFlags.ReCreate` have been removed

A new key re-creates an element the same way: when the key of a vNode changes, Inferno unmounts the old element and mounts a new one.

```jsx
// v9
<div $ReCreate>{content}</div>

// v10: change the key whenever the element must be re-created
<div key={version}>{content}</div>
```

The v10 JSX plugins throw an error for `$ReCreate`.

### Delegated event handlers are stored on the element

This only matters to tools that read Inferno's internal DOM properties. An element's `$EV` is now a number with a bit set for each delegated event the element registered, and the handler itself is in a property of the element: `$onClick`, `$onKeyDown` and so on. In v9 `$EV` was an object that held the handlers. Without that object, an element with one delegated handler takes 16 bytes less in Chrome.

### Move hooks need `inferno-animation`

The reconciler no longer runs move animations itself. Importing `inferno-animation` installs the move engine, and custom `componentWillMove` and `onComponentWillMove` hooks are only called when the app has imported it before rendering. Apps that use `AnimatedMoveComponent`, `AnimatedAllComponent` or the exported hook helpers already import it.

```js
// Once, before the first render, when the app has its own move hooks
import 'inferno-animation';
```

The hooks are also called at a different time:

- v9 called a move hook only for an item that was moved, after the list had already been partly changed. v10 calls it for every item that a keyed update keeps, before the list's container properties or children are patched, also when the keys stay in order. The hook sees the existing DOM and the props from before the update.
- A hook should measure or schedule work, and never move or remove DOM nodes.
- A class component has a move hook when `componentWillMove` exists by the end of its mount: in the class, or assigned in the constructor, `componentWillMount` or `componentDidMount`. A hook assigned later is not called.
- A function component has a move hook when its hooks include `onComponentWillMove`, also when a re-render adds it. Don't mutate a hooks object in place.
- Appear, leave and move hooks target the first element the component renders. A component whose root is only text or empty gets no hook. In v9 the hook could get a text node, which crashed the helpers.

See [Keyed-list layout animations](../packages/inferno-animation/readme.md#keyed-list-layout-animations) for the full description.

### The CommonJS and UMD bundles use modern syntax

All packages are compiled for Chrome 107, Edge 107, Firefox 84 (KaiOS 3) and Safari 16. v9 compiled the CommonJS (`index.cjs`, `dist/index.cjs`, `dist/index.min.cjs`) and UMD (`dist/<package>.js`, `dist/<package>.min.js`) bundles down to ES5 syntax. v10 keeps `const`, `let`, arrow functions, spread and classes in them, like the ES module bundles. To run Inferno in an older browser, compile it again with your own build, for example by letting `babel-loader` process `node_modules/inferno*`.

`Component` is a native class in every bundle now. In v9 the CommonJS and UMD bundles had it as an ES5 constructor function, so a component class that your compiler turned into an ES5 function could extend it. Such a class throws in v10:

```
TypeError: Class constructor Component cannot be invoked without 'new'
```

Compile your components to ES2015 or newer: TypeScript `target` `ES2015` or later, or Babel targets that don't need `@babel/plugin-transform-classes`. The ES module bundles had a native class in v9 already.

## Deprecations

### The vNode factories take the child bit in `flags`

`newVNode`, `newComponentVNode`, `newTextVNode` and `newFragment` replace `createVNode`, `createComponentVNode`, `createTextVNode` and `createFragment`. The new factories take flags that already hold the children's shape, as one of the bits `VNodeFlags.HasInvalidChildren`, `HasVNodeChildren`, `HasNonKeyedChildren`, `HasKeyedChildren` and `HasTextChildren`. They use the flags as given. The deprecated factories turn `childFlags` into its bit and clear the bits that flags copied from another vNode bring along. They then call the new factories, so they keep working.

```js
import {
  newComponentVNode,
  newFragment,
  newTextVNode,
  newVNode,
} from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

// v9: createVNode(VNodeFlags.HtmlElement, 'div', 'foo', 'text', ChildFlags.HasTextChildren)
newVNode(
  VNodeFlags.HtmlElement | VNodeFlags.HasTextChildren,
  'div',
  'foo',
  'text',
);

// v9: createComponentVNode(VNodeFlags.ComponentUnknown, MyComponent, props)
newComponentVNode(VNodeFlags.ComponentUnknown, MyComponent, props);

// v9: createComponentVNode(VNodeFlags.ComponentClass, MyClass, props)
newComponentVNode(
  VNodeFlags.ComponentClass | VNodeFlags.HasInvalidChildren,
  MyClass,
  props,
);

// v9: createTextVNode(text, key)
newTextVNode(text, key);

// v9: createFragment(children, ChildFlags.HasKeyedChildren, key)
newFragment(VNodeFlags.Fragment | VNodeFlags.HasKeyedChildren, children, key);
```

- Flags without a child bit mean the shape of the children is unknown: `newVNode` and `newFragment` normalize them, like `ChildFlags.UnknownChildren` did. `createVNode` and `createFragment` treat an omitted `childFlags` as `ChildFlags.HasInvalidChildren` and ignore the children.
- `newComponentVNode` finds out whether the type of a `VNodeFlags.ComponentUnknown` vNode is a class, a function or a forwardRef. Flags of a known type, `ComponentClass` or `ComponentFunction`, must include `VNodeFlags.HasInvalidChildren`.
- Flags copied from another vNode have its children's shape, its development-only `Validated` bit and the `InUse` and `Normalized` bits of a mounted vNode. Clear them with `flags & VNodeFlags.ClearOnCopy` before adding the new child bit.
- The development build throws when the flags have more than one child bit, when known component flags lack `HasInvalidChildren` and when `newFragment` flags lack `VNodeFlags.Fragment`.
- `newTextVNode` turns `null`, `undefined` and booleans into an empty string, like `createTextVNode`.

### JSX plugins

The JSX plugins know the children's shape at compile time, so they emit the packed flags as one number. From version 10 the plugins emit:

- `newVNode(flags | childBit, type, className, children, props, key, ref)`, without the `childFlags` argument. An element without children gets `VNodeFlags.HasInvalidChildren`, because a missing bit costs a normalization pass. Only children of unknown shape, such as `{expression}`, get no bit.
- `newComponentVNode(VNodeFlags.ComponentUnknown, type, props, key, ref)`, `newTextVNode(text)` and `newFragment(VNodeFlags.Fragment | childBit, children, key)`.
- `$Flags={expr}` becomes `expr | childBit`, and `expr | VNodeFlags.HasInvalidChildren` on a component.
- `$ChildFlag={expr}` is a `ChildFlags` value that is only known at runtime, so an element with it is still compiled to the deprecated `createVNode` or `createFragment`, which turn the value into its bit.

For example `<div>text</div>` compiles to `newVNode(3, "div", null, "text")`: `HtmlElement` 1 and `HasTextChildren` 2.

The v10 plugins need Inferno 10, and Inferno 10 needs JSX compiled by the v10 plugins, see [Use version 10 of the JSX plugins](#use-version-10-of-the-jsx-plugins).
