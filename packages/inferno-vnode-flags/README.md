# inferno-vnode-flags

Inferno VNode Flags is a small utility library for [Inferno](https://github.com/infernojs/inferno).

Usage of `inferno-vnode-flags` should be limited to assigning `VNodeFlags` when using `Inferno.createVNode`.

## Install

```
npm install --save inferno-vnode-flags
```

## Contents

- `VNodeFlags.Text`
- `VNodeFlags.HtmlElement`
- `VNodeFlags.ComponentClass`
- `VNodeFlags.ComponentFunction`
- `VNodeFlags.ComponentUnknown`
- `VNodeFlags.HasKeyedChildren`
- `VNodeFlags.HasNonKeyedChildren`
- `VNodeFlags.SvgElement`
- `VNodeFlags.MediaElement`
- `VNodeFlags.InputElement`
- `VNodeFlags.TextareaElement`
- `VNodeFlags.SelectElement`
- `VNodeFlags.Void`

You can easily combine multiple flags, by using bitwise operators. A common use case is an element that has keyed children:

```js
const flag = VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren;
```

## Example Usage

```js
import Inferno from 'inferno';
import VNodeFlags from 'inferno-vnode-flags';

const vNode = Inferno.createVNode(VNodeFlags.Element, 'div', { className: 'example' }, 'Hello world!');

Inferno.render(vNode, container);
```
