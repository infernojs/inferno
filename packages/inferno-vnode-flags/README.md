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
- `VNodeFlags.Void`
- `VNodeFlags.Portal`
- `VNodeFlags.ReCreate` (JSX **$ReCreate**) always re-creates the vNode

**VNodeFlags Masks:**
- `VNodeFlags.FormElement` - Is form element
- `VNodeFlags.Element` - Is vNode element
- `VNodeFlags.Component` - Is vNode Component
- `VNodeFlags.VNodeShape` - mask for defining type


**ChildFlags**
- `ChildFlags.UnknownChildren` needs Normalization
- `ChildFlags.HasInvalidChildren` is invalid (null, undefined, false, true)
- `ChildFlags.HasVNodeChildren` (JSX **$HasVNodeChildren**) is single vNode (Element/Component)
- `ChildFlags.HasNonKeyedChildren` (JSX **$HasNonKeyedChildren**) is Array of vNodes non keyed (no nesting, no holes)
- `ChildFlags.HasKeyedChildren` (JSX **$HasKeyedChildren**) is Array of vNodes keyed (no nesting, no holes)

**ChildFlags Masks**
- `ChildFlags.MultipleChildren` Is Array

You can easily combine multiple flags, by using bitwise operators. A common use case is an element that has keyed children:
