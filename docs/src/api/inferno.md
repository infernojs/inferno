---
title: Inferno API
---

## createVNode
 ```typescript
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

## cloneVNode

## render
```typescript
render(
  element: InfernoInput, 
  container?: Node | SVGAElement
): void
```

Renders a valid Inferno Node into the dom with a root at the specified container node in the DOM. 

{% include warning.html message="If the container element is not empty before rendering the content of the container witll be overwritten on the initial render %}

## findDOMNode

## createRenderer

## disableRecycling

