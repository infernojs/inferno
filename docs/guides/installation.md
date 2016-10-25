---
title: Installation
---

Very much like React, Inferno requires the **inferno** and the **inferno-dom** packages for consumption in the browser's DOM. Inferno also has the **inferno-server** package for server-side rendering of virtual DOM to HTML strings (differing from React's route of using *react-dom/server* for server-side rendering). Furthermore, rather than include the ES2015 component with class syntax in core (like React), the component is in a separate package **inferno-component** to allow for better modularity. We publish modules to NPM and to a [CDN](//cloudflare.com).

## Package Overview

### Inferno
The core Inferno package. 


```sh
npm install --save inferno
```
[NPM](//npmjs.com/package/inferno)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno.min.js)

#### Inferno DOM
Browser DOM rendering package

```sh
npm install --save inferno-dom
```

[NPM](//npmjs.com/package/inferno-dom)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-dom.min.js)

### Inferno Component 
ES2015 stateful components (with lifecycle events)

```sh
npm install --save inferno-component
```

[NPM](//npmjs.com/package/inferno-component)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-component.min.js)

### Create Element
Helper for creating Inferno VNodes (similar to `React.createElement`)

```sh
npm install --save inferno-create-element
```

[NPM](//npmjs.com/package/inferno-create-element)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-create-element.min.js)

### Create Class
Helper for creating Inferno Components via ES5 (similar to `React.createClass`)

```sh
npm install --save inferno-create-class
```

[NPM](//npmjs.com/package/inferno-create-class)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-create-class.min.js)

### Inferno Server
Server-side rendering package

```sh
npm install --save inferno-server
```

[NPM](//npmjs.com/package/inferno-server)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-server.min.js)

### Router
Basic routing functionality

```sh
npm install --save inferno-router
```

[NPM](//npmjs.com/package/inferno-router)
[CDN](//cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-router.min.js)
