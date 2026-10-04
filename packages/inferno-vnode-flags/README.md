# inferno-vnode-flags

Inferno VNode Flags is a small utility library for [Inferno](https://github.com/infernojs/inferno).

Usage of `inferno-vnode-flags` should be limited to assigning `VNodeFlags` and `ChildFlags` when using creating vNodes.

## Install

```
npm install --save inferno-vnode-flags
```

## Contents

**VNodeFlags:**

- `VNodeFlags.HtmlElement`
- `VNodeFlags.ComponentUnknown`
- `VNodeFlags.ComponentClass`
- `VNodeFlags.ComponentFunction`
- `VNodeFlags.Text`
- `VNodeFlags.SvgElement`
- `VNodeFlags.InputElement`
- `VNodeFlags.TextareaElement`
- `VNodeFlags.SelectElement`
- `VNodeFlags.Portal`
- `VNodeFlags.ReCreate` (JSX **$ReCreate**) always re-creates the vNode
- `VNodeFlags.ContentEditable`
- `VNodeFlags.Fragment`
- `VNodeFlags.InUse`
- `VnodeFlags.ForwardRef`
- `VNodeFlags.Normalized`
- `VNodeFlags.Validated` development only, the keys of the vNode's children have been validated

**ChildFlags in VNodeFlags:**

A vNode keeps the shape of its children in bits of `flags`: the `ChildFlags` value shifted left by `VNodeFlags.ChildFlagsShift`. Exactly one of these bits is set, test it with `vNode.flags & VNodeFlags.HasKeyedChildren`. `newVNode`, `newComponentVNode` and `newFragment` from `inferno` take the bit in their `flags`, for example `VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren`; flags without a child bit make them normalize the children. The deprecated `createVNode` and `createFragment` take a separate `ChildFlags` value. `getChildFlags(vNode)` from `inferno` converts the bits back to a `ChildFlags` value, for passing them to those.

- `VNodeFlags.HasInvalidChildren`
- `VNodeFlags.HasVNodeChildren`
- `VNodeFlags.HasNonKeyedChildren`
- `VNodeFlags.HasKeyedChildren`
- `VNodeFlags.HasTextChildren`
- `VNodeFlags.MultipleChildren` - Mask of the keyed and non-keyed bits
- `VNodeFlags.ChildFlagsShift` - The ChildFlags are stored shifted left by this many bits
- `VNodeFlags.ChildFlagsMask` - Bits that hold the ChildFlags

**VNodeFlags Masks:**

- `VNodeFlags.ForwardRefComponent` Functional component wrapped in forward ref
- `VNodeFlags.FormElement` - Is form element
- `VNodeFlags.Element` - Is vNode element
- `VNodeFlags.Component` - Is vNode Component
- `VNodeFlags.DOMRef` - Bit set when vNode holds DOM reference
- `VNodeFlags.InUseOrNormalized` - VNode is used somewhere else or came from normalization process
- `VNodeFlags.ClearInUseNormalized` - Opposite mask of InUse or Normalized
- `VNodeFlags.IgnoredByPatch` - Bits that don't make two vNodes different types: Normalized, ChildFlags and Validated
- `VNodeFlags.ClearOnCopy` - Clears the ChildFlags and Validated bits of flags copied from another vNode, before a new child bit is added

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
