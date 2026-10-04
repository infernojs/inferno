# inferno-vnode-flags

Inferno VNode Flags is a small utility library for [Inferno](https://github.com/infernojs/inferno).

Usage of `inferno-vnode-flags` should be limited to assigning `VNodeFlags` and `ChildFlags` when using creating vNodes.

## Install

```
npm install --save inferno-vnode-flags
```

## Contents

**VNodeFlags:**

The JSX plugins write the flags into the compiled code as one number, so the flags that compiled apps and Inferno use most have the smallest values. The values changed in Inferno 10, so compile JSX with the v10 plugins.

- `VNodeFlags.HtmlElement` (1)
- `VNodeFlags.SvgElement` (64)
- `VNodeFlags.ComponentClass` (128)
- `VNodeFlags.Fragment` (256)
- `VNodeFlags.InputElement` (512)
- `VNodeFlags.Text` (1024)
- `VNodeFlags.TextareaElement` (2048)
- `VNodeFlags.SelectElement` (4096)
- `VNodeFlags.ComponentFunction` (8192)
- `VNodeFlags.Portal` (16384)
- `VnodeFlags.ForwardRef` (32768)
- `VNodeFlags.InUse` (65536)
- `VNodeFlags.ContentEditable` (131072)
- `VNodeFlags.Validated` (262144) development only, the keys of the vNode's children have been validated
- `VNodeFlags.Normalized` (524288)
- `VNodeFlags.ComponentUnknown` (0) `newComponentVNode` finds out whether the type is a class, a function or a forwardRef

**ChildFlags in VNodeFlags:**

A vNode keeps the shape of its children in bits of `flags`. Exactly one of these bits is set, test it with `vNode.flags & VNodeFlags.HasKeyedChildren`. `newVNode`, `newComponentVNode` and `newFragment` from `inferno` take the bit in their `flags`, for example `VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren`; flags without a child bit make them normalize the children. The deprecated `createVNode` and `createFragment` take a separate `ChildFlags` value, which has the same name as its bit but another value. `getChildFlags(vNode)` from `inferno` converts the bits back to a `ChildFlags` value, for passing them to those.

- `VNodeFlags.HasTextChildren` (2)
- `VNodeFlags.HasNonKeyedChildren` (4)
- `VNodeFlags.HasVNodeChildren` (8)
- `VNodeFlags.HasInvalidChildren` (16)
- `VNodeFlags.HasKeyedChildren` (32)
- `VNodeFlags.MultipleChildren` - Mask of the keyed and non-keyed bits
- `VNodeFlags.ChildFlagsMask` - Bits that hold the shape of the children

**VNodeFlags Masks:**

- `VNodeFlags.ForwardRefComponent` Functional component wrapped in forward ref
- `VNodeFlags.FormElement` - Is form element
- `VNodeFlags.Element` - Is vNode element
- `VNodeFlags.Component` - Is vNode Component
- `VNodeFlags.DOMRef` - Bit set when vNode holds DOM reference
- `VNodeFlags.InUseOrNormalized` - VNode is used somewhere else or came from normalization process
- `VNodeFlags.ClearInUseNormalized` - Opposite mask of InUse or Normalized
- `VNodeFlags.IgnoredByPatch` - Bits that don't make two vNodes different types: Normalized, ChildFlags and Validated
- `VNodeFlags.ClearOnCopy` - Clears the ChildFlags, Validated, InUse and Normalized bits of flags copied from another vNode, before a new child bit is added

**ChildFlags**

- `ChildFlags.UnknownChildren` needs Normalization
- `ChildFlags.HasInvalidChildren` is invalid (null, undefined, false, true)
- `ChildFlags.HasVNodeChildren` (JSX **$HasVNodeChildren**) is single vNode (Element/Component)
- `ChildFlags.HasNonKeyedChildren` (JSX **$HasNonKeyedChildren**) is Array of vNodes non keyed (no nesting, no holes)
- `ChildFlags.HasKeyedChildren` (JSX **$HasKeyedChildren**) is Array of vNodes keyed (no nesting, no holes)
- `ChildFlags.HasTextChildren` (JSX **$HasTextChildren**) vNode contains only text

**ChildFlags Masks**

- `ChildFlags.MultipleChildren` Is Array

You can easily combine multiple flags, by using bitwise operators. A common use case is an element that has keyed children:

```js
import { newVNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

const list = newVNode(
  VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren,
  'ul',
  null,
  items, // vNodes with keys
);
```
