---
title: Inferno Server
---

Inferno supplies a server utility to render virtual DOM nodes into markup to be send from a server  

## `renderToString`

```
  renderToString(
    infernoComponent: 
  )
```

Render a virtual node into an HTML string, given the supplied virtual DOM. This should only be used on the server to generate a HTML string to send on request for faster page loads and improved SEO performance. 

If `Inferno.render()` is called on a string send using this method then Inferno will only attach hooks to the DOM increasing performance on the initial render. 

```jsx
import Inferno from 'inferno';
import InfernoServer from 'inferno-server';

const App = function({ color = 'red', name }) {
  return (
    <div style={{ color }}>
      Hello
      <span>{name}</span>
    </div>
  )
} 

InfernoServer.renderToString(<App color="blue" name="world">)
// "<div style="color: blue;">Hello<span>World</span></div>"
```

## `renderToStaticMarkup`

Much like `InfernoServer.renderToString()` `renderToStaticMarkup` will return a HTML string from a supplied virtual DOM, however this will not attach any of the Inferno DOM attributes which are used internally by Inferno. This is useful to improve performance as it can save a number of bytes on the page request. 

## `streamAsString`

