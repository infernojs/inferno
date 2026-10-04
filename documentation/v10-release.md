# InfernoJS v10.0.0

Inferno 10 moves work from the runtime to the compiler. The JSX plugins know the shape of an element's children when they compile it, so they now write it into the vNode flags. Inferno no longer computes it for every vNode at runtime. A vNode has one field less, delegated event handlers take less memory, and many allocations are gone from rendering, normalization and keyed diffing.

This release also rewrites `inferno-animation`, adds custom navigation confirmation to `inferno-router`, and fixes many bugs in core, hydration, server rendering, the router, compat and the MobX bindings.

## Upgrading

1. Update every `inferno*` package to 10.
2. Update your JSX plugin to version 10:

   | Plugin                                                                      | Inferno 9 and older | Inferno 10 |
   | --------------------------------------------------------------------------- | ------------------- | ---------- |
   | [`babel-plugin-inferno`](https://github.com/infernojs/babel-plugin-inferno) | 7.x                 | 10.x       |
   | [`ts-plugin-inferno`](https://github.com/infernojs/ts-plugin-inferno)       | 7.x                 | 10.x       |
   | [`swc-plugin-inferno`](https://github.com/infernojs/swc-plugin-inferno)     | 3.x                 | 10.x       |

   Version 10 of `babel-plugin-inferno` and `ts-plugin-inferno` requires Node.js 24 or newer to compile JSX. `ts-plugin-inferno` depends on TypeScript 6.

3. Compile all your JSX again, including dependencies that ship precompiled JSX.
4. If you write your own `componentWillMove` or `onComponentWillMove` hooks, add `import 'inferno-animation'`. See [Move animation hooks](#move-animation-hooks).
5. Compile your own components to ES2015 or newer. A component class compiled to an ES5 function can no longer extend `Component`. See [Browser support](#browser-support).

From version 10 on, the major version of each JSX plugin matches the major version of Inferno.

Each change is described in detail in the [Migration guide](https://github.com/infernojs/inferno/blob/master/documentation/v10-migration.md).

## Breaking changes

- **JSX must be compiled by the v10 plugins.** `VNodeFlags` have new values, so JSX compiled by an older plugin renders elements such as `<svg>`, `<input>`, `<select>` and `<textarea>` wrong. This includes npm packages that ship JSX compiled for Inferno 9.
- **`VNodeFlags` have new values.** Code compiled with `tsc` against `inferno-vnode-flags` 9 has the old numbers inlined and must be compiled again. Never write flag numbers by hand.
- **`vNode.childFlags` has been removed.** The shape of the children is stored in bits of `vNode.flags`. Test them with `VNodeFlags.HasKeyedChildren` and the other `Has*Children` bits, or get the old `ChildFlags` value with the new `getChildFlags(vNode)` export.
- **`vNode.isValidated` has been removed.** It is the development-only `VNodeFlags.Validated` bit now.
- **`$ReCreate` and `VNodeFlags.ReCreate` have been removed.** Change the key of an element to re-create it. The v10 plugins report `$ReCreate` as a build error.
- **Delegated event handlers are stored on the element.** `$EV` is now a bitmask, and each handler is in its own property of the element, such as `$onClick`. This only matters to tools that read Inferno's internal DOM properties.
- **Move animation hooks have new semantics.** See [below](#move-animation-hooks).
- **Modern bundles, and `Component` is a native class in all of them.** See [Browser support](#browser-support).

```jsx
// v9
<div $ReCreate>{content}</div>

// v10: change the key whenever the element must be re-created
<div key={version}>{content}</div>
```

### Move animation hooks

The reconciler no longer runs move animations itself. `inferno-animation` installs a move engine when it is imported.

- Custom `componentWillMove` and `onComponentWillMove` hooks are only called when the app has imported `inferno-animation`. The exported animated components and helpers already import it.
- The hooks are called for every item that a keyed update keeps, before anything is patched. In v9 they were called only for the items that were physically moved, after the list had already been partly changed.
- A class component's `componentWillMove` must exist by the end of its mount. A hook assigned later is not called.
- Appear, leave and move hooks target the first element of the component. A component whose root is only text or empty gets no hook. In v9 the hook could get a text node, which crashed the helpers.

See the [migration guide](https://github.com/infernojs/inferno/blob/master/documentation/v10-migration.md#move-hooks-need-inferno-animation) for details.

### Browser support

All bundles are now compiled for Chrome 107, Edge 107, Firefox 84 (KaiOS 3) and Safari 16. In v9 the CommonJS and UMD bundles were compiled down to ES5 syntax. Now they keep modern syntax such as `const`, arrow functions, spread and classes, like the ES module bundles.

`Component` is a native class in every bundle. A component class that your compiler turns into an ES5 function, for example with TypeScript `target: "ES5"`, throws `TypeError: Class constructor Component cannot be invoked without 'new'`. Compile your components to ES2015 or newer. See the [migration guide](https://github.com/infernojs/inferno/blob/master/documentation/v10-migration.md#the-commonjs-and-umd-bundles-use-modern-syntax) for details.

## Deprecations

### `create*` vNode factories

`newVNode`, `newComponentVNode`, `newTextVNode` and `newFragment` replace `createVNode`, `createComponentVNode`, `createTextVNode` and `createFragment`. The new factories take the shape of the children as a bit in `flags`, so Inferno uses the flags as given. The v10 JSX plugins emit the new factories.

The old factories are marked `@deprecated` and keep working. They turn their `childFlags` argument into its bit and call the new factories.

```js
import { newVNode, newFragment } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

// v9: createVNode(VNodeFlags.HtmlElement, 'div', 'foo', 'text', ChildFlags.HasTextChildren)
newVNode(
  VNodeFlags.HtmlElement | VNodeFlags.HasTextChildren,
  'div',
  'foo',
  'text',
);

// v9: createFragment(children, ChildFlags.HasKeyedChildren, key)
newFragment(VNodeFlags.Fragment | VNodeFlags.HasKeyedChildren, children, key);
```

When you copy flags from another vNode, clear the copied state first with `flags & VNodeFlags.ClearOnCopy`, then add the new child bit. See the [migration guide](https://github.com/infernojs/inferno/blob/master/documentation/v10-migration.md#the-vnode-factories-take-the-child-bit-in-flags) for the full contract.

## New features

### Custom navigation confirmation in `inferno-router`

Browsers can suppress the native `window.confirm` dialog, for example iOS Safari when Back navigation triggers it. A suppressed dialog returns `false`, so the navigation stayed blocked. `Router`, `BrowserRouter`, `HashRouter` and `MemoryRouter` now accept a `getUserConfirmation` prop, so `<Prompt>` can use your own in-page dialog. Fixes [#1699](https://github.com/infernojs/inferno/issues/1699).

```tsx
import {
  BrowserRouter,
  Prompt,
  type GetUserConfirmation,
} from 'inferno-router';

const getUserConfirmation: GetUserConfirmation = (message, callback) => {
  // Render your dialog and return a function that closes it
  return showLeaveDialog({
    message,
    onLeave: () => callback(true),
    onStay: () => callback(false),
  });
};

<BrowserRouter getUserConfirmation={getUserConfirmation}>
  <Prompt when={hasUnsavedChanges} message="Discard your changes?" />
  {/* routes */}
</BrowserRouter>;
```

The handler can answer synchronously or later. The cleanup function it returns runs once when the decision completes or is invalidated. Without the prop, `Prompt` keeps using `window.confirm`. See the [inferno-router README](https://github.com/infernojs/inferno/tree/master/packages/inferno-router#navigation-confirmation) for the details.

### Rewritten `inferno-animation`

The public API is the same. ([#1702](https://github.com/infernojs/inferno/pull/1702))

- Items that are pushed aside by a moved item animate too, not only the moved ones.
- A move interrupted by another update continues from where it is on screen.
- When leaving items are removed, the remaining items slide into the gap.
- Offsets take 2D transforms of ancestors into account, also across shadow roots, as well as the SVG `viewBox` and the item's own `scale` and `rotate`. CSS `zoom`, perspective and rotation other than around z are not supported.
- Nested lists move relative to an ancestor that starts moving in the same update.
- A leave that interrupts an enter starts from where the enter got to.
- Items with CSS keyframe or script animations move with the `translate` property instead of `transform`.
- The app's inline styles are restored after an animation.
- Transitions with zero duration no longer leave items stuck.
- Transition handling shares two capture listeners per root (`transitionend` and `transitioncancel`) and groups fallback timers.
- The move engine is dormant until a component with a move hook mounts. Apps that don't import `inferno-animation` don't pay for move support: bundlers drop the reconciler's checks.
- `inferno-animation/index.css` is exported from the package.

Minified and gzipped, `inferno-animation` is 9.92 kB for the UMD bundle and 9.82 kB for the CommonJS bundle.

### More boolean attributes

`async`, `defer`, `disablePictureInPicture`, `disableRemotePlayback`, `formNoValidate`, `inert`, `itemScope`, `noModule` and `playsInline` are now boolean attributes. Boolean attributes are written as attributes with their lowercase name, so both spellings work, for example `readOnly` and `readonly` or `allowFullScreen` and `allowfullscreen`. `hidden` and `capture` keep a string value such as `hidden="until-found"` or `capture="user"`.

`checked`, `indeterminate`, `muted` and `selected` hold the current state of the element, so they are still set as properties.

### `autoFocus` works on mount

Props are applied to an element before it is inserted into the document, so `autoFocus` focuses the element when it mounts.

### TypeScript

- `createElement` has separate overloads for DOM elements, function and `forwardRef` components, and class components, with improved support for callback and object refs.
- Lifecycle hooks of function components may be `null`.
- A multiple `<select>` accepts `number[]` as its value.
- `inferno-compat`: `render<T>()` and `unstable_renderSubtreeIntoContainer<T>()` are generic in the returned instance; `render` accepts a callback; `Children.*`, `createFactory`, `PropTypes` and `PureComponent` have accurate types; camelCase and numeric style objects and `onDoubleClick` are accepted.
- `inferno-extras`: `findDOMNode()` accepts any component instance, `null` and `undefined`.
- `inferno-mobx`: `inject()` returns the actual injector type, exported as `InjectedComponent` and `IInjector`. `observerWrap` accepts a typed context. The `observer(stores)` decorator returns the component.
- `inferno-redux`: `connect()` accepts all the options it forwards.
- The `types` condition comes first in each package's `exports`, so TypeScript no longer finds the types only through a fallback.
- Published typings no longer import packages that are not dependencies.

## Performance

- **Smaller vNodes.** Each vNode is 4 bytes smaller in Chrome and 32 bytes smaller in Firefox, where the object drops to a smaller size class.
- **Child flags at compile time.** The JSX plugins write the shape of the children into the flags as one number, so the runtime does no work to combine them.
- **Delegated events.** An element with one delegated handler takes 16 bytes less in Chrome. Unmounting an element visits only the events it registered, and event dispatch tests one bit before reading a handler.
- **Keyed diffing.** The key index is a `Map`. Numeric keys such as row ids made a plain object fall back to a dictionary that was reallocated as it grew. This removes 45–50 KiB of garbage per "replace all rows" in js-framework-benchmark.
- **vNode reuse.** A vNode referenced outside of render, such as a hoisted vNode, the root passed to `render()` again or the root returned by a component, is no longer cloned when it is rendered again in the same position. Children that go through normalization are cloned only when needed, so a component that renders `props.children` no longer allocates new vNodes for them on every update.
- **Normalization.** Index keys of children without a key are shared instead of being allocated as new strings on every render.
- **Unmount.** The unmount routine allocates less.

## Bug fixes

### Core

- A vNode used in two positions shared its DOM node and state between them, and only one position was updated afterwards.
- An element vNode with multiple children that was rendered in two places was updated in only one of them.
- A hoisted vNode with multiple children rendered the children of another vNode after an element of the same type was patched in its place.
- A component was unmounted and mounted again, losing its state, when the element rendered in its place was equal but had been normalized as the child of another element.
- Removing a Fragment with exactly one child did not unmount the child: `componentWillUnmount` was not called and refs were not cleared.
- Re-rendering a Portal with a different container threw `Failed to execute 'removeChild' on 'Node'` when its child was a component or a Fragment.
- Reusing a vNode broke `dangerouslySetInnerHTML`.
- Changing `style` from a string to an object kept the declarations of the string.
- An `<option>` without a `value` prop got the value `"undefined"`.
- `hidden` and `capture` kept their string value when they changed to `true`.
- A `ref` passed to a `forwardRef` component through spread props was lost, and so were the lifecycle hooks that came with it.
- Development errors named a `forwardRef` component `"Object"`.
- `displayName` now takes priority over the function or class name in development messages.
- `createElement` passed `onComponentWillMove` as a prop instead of a hook.
- `cloneVNode`, `createElement` and `h` wrote into the props object passed to them.
- Importing `inferno` as a native ES module in a browser threw because `process` is not defined.

### inferno-hydrate

- Hydration used a vNode that was already mounted elsewhere for the server-rendered DOM node, so one of the positions was not updated afterwards.
- Hydrating a Fragment with exactly one child broke the DOM.
- SVG elements with camelCase tag names, such as `<linearGradient>`, were replaced instead of hydrated.
- Appear hooks of components mounted after a mismatch were never called.

### inferno-server

- A Fragment with exactly one child rendered an empty placeholder comment instead of its content.
- A Fragment with an empty children array and explicit child flags rendered nothing, which did not match the browser, and the next render after hydration threw.
- Rendering crashed when a component returned an array containing `null`, `undefined` or booleans.
- `streamAsString` failed and `streamQueueAsString` never finished when the tree contained a number as text.
- `RenderQueueStream` never ended as a readable stream.
- `renderToString` threw for an `<option>` inside a Fragment.
- Stream renderers did not mark the `<option>` selected by the `<select>` value. Multiple select values and the `<select>` `defaultValue` were ignored.
- `defaultValue` and `defaultChecked` were rendered over a controlled value.
- The value of a `<textarea>` was rendered as an attribute instead of its content.
- `dangerouslySetInnerHTML={undefined}` crashed, and `renderToString` and `streamQueueAsString` rendered the children instead of `dangerouslySetInnerHTML`.
- Server renderers check a tag name before writing it, and throw an `Error` for an invalid one instead of a string of HTML.
- `componentWillMount` was called for a component with `getSnapshotBeforeUpdate`, and `getChildContext` was called before `componentWillMount`.
- `streamAsString` rendered without props when the constructor did not pass them to `super`.
- `streamQueueAsString` skipped `getDerivedStateFromProps` for a component with `getInitialProps`.
- The UMD bundle threw when it was loaded in a browser.

### inferno-router

- `Prompt` stopped blocking after the first confirmed transition.
- In Chromium, `HashRouter` lost Back navigation accepted through a synchronous confirmation, such as `window.confirm`, and left the next Back navigation unblocked.
- `Redirect` in a `Switch` went to its `to` path without the matched params, and `Redirect` dropped the `state` of a location object.
- `Switch` dropped the key of the matched `Route` and crashed on `false`, `null` and `undefined` children.
- `Link` with `target="_self"` loaded the page from the server.
- Loaders:
  - A loader that threw or returned synchronously stopped the navigation.
  - A loader that resolved to `null` was reported as an error.
  - After navigating, every matching route in a `Switch` ran its loader, not only the matched one.
  - The request passed to a loader had no query string.
  - A `Route` without a `path` that had a loader never rendered.
  - Pending loaders were not aborted when the router unmounted.
- `StaticRouter` stripped its `basename` from paths that only start with it, such as `/application` with the basename `/app`.
- The UMD bundle could not find `history` and `path-to-regexp`.

### inferno-compat

- `PureComponent` crashed on `setState` without an initial state.
- `fontVariant` was not mapped to `font-variant`.
- Props named like `Object.prototype` members, such as `toString` and `constructor`, were mapped wrong.

### inferno-mobx

- `observer` dropped the arguments of patched lifecycle methods.
- `observerWrap` failed when an observable change rendered another root element.
- `observerPatch` and `observerWrap` kept reactions alive in server rendering. They now follow `useStaticRendering`.

### inferno-redux

- The UMD bundle read Redux from the wrong global.

## For contributors

- The repository uses pnpm instead of Lerna ([#1698](https://github.com/infernojs/inferno/pull/1698)). Internal dependencies use `workspace:*`, which is published as the exact version.
- Browser tests run with Jasmine Browser Runner instead of Karma, in headless browsers locally ([#1701](https://github.com/infernojs/inferno/pull/1701)).
- All tests are written in TypeScript ([#1632](https://github.com/infernojs/inferno/issues/1632)).
- Differential fuzzers test vNode reuse in rendering and hydration.

Full list of changes: https://github.com/infernojs/inferno/compare/v9.1.0...v10.0.0
