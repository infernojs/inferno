---
title: Inferno API
---

## `createVNode`
 ```
Inferno.createVNode(
  vNodeFlag, 
  type?, 
  props?, 
  children?, 
  key?, 
  ref?, 
  noNormalise?: boolean
): VNode
```

Create and return a new virtual DOM node of the given VNode flag and given type. Typically you will not invoke `Inferno.createVNode` directly, code written in JSX of `hyperscript` will be converted to use `Inferno.createVNode`. Code written using [`Inferno.createElement`](/{{site.url}}/api/create-element) also uses `Inferno.createVNode` inside. 

## `cloneVNode`

## `render`
```
render(
  element: InfernoInput, 
  container?: Node | SVGAElement
): void
```

Render a virtual node into the DOM in the supplied container given the supplied virtual DOM. If the virtual node was previously rendered
into the container, this will perform an update on it and only mutate the DOM as necessary, to reflect the latest Inferno virtual node.

Warning: If the container element is not empty before rendering, the content of the container will be overwritten on the initial render.

```javascript
import Inferno from 'inferno';

Inferno.render(<div />, document.body);
```

## `createRenderer`

`createRenderer` allows for functional composition when rendering content to the DOM. An example of this is shown below:

```javascript
import Inferno from 'inferno';
import { scan, map } from 'most';

...
const model$ = scan(update, 0, actions$);
const vNodes$ = map(view(actions$), model$);
const renderer = Inferno.createRenderer();
const runApp = () => scan(renderer, container, vNodes$).drain();

runApp();
```

## findDOMNode

## createRenderer

## disableRecycling

