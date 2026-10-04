# InfernoJS v10.0.0

## Breaking changes

### `vNode.childFlags` and `vNode.isValidated` have been removed

A vNode has one field less: its `ChildFlags` are stored in bits of `vNode.flags`. Each vNode is 4 bytes smaller in Chrome and 32 bytes smaller in Firefox, where the object drops to a smaller size class.

The deprecated `create*` factories still take `childFlags` as an argument, so they and code compiled by the current JSX plugins work as before. The new `new*` factories take the child bit in `flags`, see [below](#the-vnode-factories-take-the-child-bit-in-flags). Code that read the property tests the matching bit of `flags` instead. `getChildFlags` gives the `ChildFlags` value, for passing it on to a deprecated factory:

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

The JSX plugins write the flags of each vNode into the compiled code as one number, so the bits they emit most have the smallest values. The bits of elements keep their v9 values:

| Flag                                                                               | v9                  | v10                   |
| ---------------------------------------------------------------------------------- | ------------------- | --------------------- |
| `HtmlElement`                                                                      | 1                   | 1                     |
| `SvgElement`, `InputElement`, `TextareaElement`, `SelectElement`                   | 32, 64, 128, 256    | 32, 64, 128, 256      |
| `ReCreate`, `ContentEditable`, `Fragment`                                          | 2048, 4096, 8192    | 2048, 4096, 8192      |
| `HasTextChildren`, `HasNonKeyedChildren`, `HasVNodeChildren`, `HasInvalidChildren` | -                   | 2, 4, 8, 16           |
| `HasKeyedChildren`                                                                 | -                   | 512                   |
| `ComponentUnknown`                                                                 | 2                   | 0                     |
| `ComponentClass`                                                                   | 4                   | 1024                  |
| `ComponentFunction`                                                                | 8                   | 16384                 |
| `Text`                                                                             | 16                  | 32768                 |
| `InUse`, `Normalized`, `ForwardRef`                                                | 16384, 65536, 32768 | 65536, 131072, 262144 |
| `Portal`                                                                           | 1024                | 524288                |
| `Validated` (development only)                                                     | -                   | 1048576               |

- Code compiled by the v9 JSX plugins keeps working. It calls the deprecated factories with the flags of elements, which have not changed, and with `ComponentUnknown` for components, which `createComponentVNode` resolves whatever value it has.
- `VNodeFlags` is a `const enum`, so code compiled against v9 `inferno-vnode-flags` has the old numbers in it. Rebuild code that reads `vNode.flags`, for example to test `VNodeFlags.Text` or `VNodeFlags.ComponentClass`.
- `ComponentUnknown` has no bit: `newComponentVNode` replaces it with the type it finds, so a vNode never has it. `VNodeFlags.Component` is `ComponentClass | ComponentFunction`.
- The child bits are not in the order of `ChildFlags`, so a `ChildFlags` value can't be shifted into place. Use the `VNodeFlags` bit of the same name.

### Delegated event handlers are stored on the element

This only matters to tools that read Inferno's internal DOM properties. An element's `$EV` is now a number with a bit set for each delegated event the element registered, and the handler itself is in a property of the element: `$onClick`, `$onKeyDown` and so on. In v9 `$EV` was an object that held the handlers. Without that object, an element with one delegated handler takes 16 bytes less in Chrome.

## Deprecations

### The vNode factories take the child bit in `flags`

`newVNode`, `newComponentVNode`, `newTextVNode` and `newFragment` replace `createVNode`, `createComponentVNode`, `createTextVNode` and `createFragment`. The new factories take flags that already hold the children's shape, as one of the bits `VNodeFlags.HasInvalidChildren`, `HasVNodeChildren`, `HasNonKeyedChildren`, `HasKeyedChildren` and `HasTextChildren`. They use the flags as given. The deprecated factories shift `childFlags` into place and clear the bits that flags copied from another vNode bring along. They then call the new factories, so they keep working.

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

Code compiled by the v9 plugins keeps working with Inferno v10, but the v10 plugins need Inferno v10.
