---
title: Inferno API
---

## `render`
```
render(
  element: InfernoInput, 
  container?: Node | SVGAElement
): void
```

Render a virtual node into the DOM in the supplied container given the supplied virtual DOM. If the virtual node was previously rendered
into the container, this will perform an update on it and only mutate the DOM as necessary, to reflect the latest Inferno virtual node.

**Warning**: If the container element is not empty before rendering, the content of the container will be overwritten on the initial render.

```javascript
import Inferno from 'inferno';

Inferno.render(<div />, document.body);
```

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

Create a new Inferno `VNode` using `createVNode`. A `VNode` is a virtual DOM object that is used to 
describe a single element of the UI. Typically `createElement`, `hyperscript` or JSX are used to create
`VNode`s for Inferno, but under the hood they all use `createVNode`. Below is an example of using
of `createVNode` usage:

```javascript
import Inferno from 'inferno';

const vNode = Inferno.createVNode(2, 'div', { className: 'example' }, 'Hello world!');

Inferno.render(vNode, container);
``` 

## `cloneVNode`

```js
Inferno.cloneVNode(
  vNode,
  [props],
  [...children]
)
```

Clone and return a new Inferno `VNode` using a `VNode` as the starting point. The resulting `VNode` will have the original `VNode`'s props with the new props merged in shallowly. New children will replace existing children. key and ref from the original `VNode` will be preserved.

`cloneVNode()` is almost equivalent to:
```jsx
<VNode.type {...VNode.props} {...props}>{children}</VNode.type>
```

An example of using `cloneVNode`:

```javascript
import Inferno from 'inferno';

const vNode = Inferno.createVNode(2, 'div', { className: 'example' }, 'Hello world!');
const newVNode = Inferno.cloneVNode(vNode, { id: 'new' }); // we are adding an id prop to the VNode

Inferno.render(newVNode, container);
```

If you're using JSX:

```jsx
import Inferno from 'inferno';

const vNode = <div className="example">Hello world</div>;
const newVNode = Inferno.cloneVNode(vNode, { id: 'new' }); // we are adding an id prop to the VNode

Inferno.render(newVNode, container);
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

If a component has been mounted into the DOM, this returns the corresponding native browser DOM element. This method is useful for reading values out of the DOM, such as form field values and performing DOM measurements. In most cases, you can attach a ref to the DOM node and avoid using `findDOMNode` at all. When render returns null or false, `findDOMNode` returns null.

**Note**: we recommend using a `ref` callback on a component to find its instance, rather than using `findDOMNode`. `findDOMNode` cannot be used on functional components.


## disableRecycling
As an application changes components will be reused as they are mounted and unmounted from the DOM. By default Inferno enables *recycling* to have a pool of components which can be reused when components are mounted into the DOM. However if you wish to disable this feature you can. 

```jsx
import Inferno from 'inferno'

Inferno.disableRecycling();

Inferno.render(</div>, document.body);
```  
