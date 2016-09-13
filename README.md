<p align="center"><img src="http://infernojs.org/img/inferno.png" width="150px"></p>
<p>&nbsp;</p>
[![Build Status](https://img.shields.io/travis/trueadm/inferno/master.svg?style=flat-square)](https://travis-ci.org/trueadm/inferno/branches)
[![Coverage Status](https://img.shields.io/coveralls/trueadm/inferno/master.svg?style=flat-square)](https://coveralls.io/github/trueadm/inferno?branch=master)
[![Dependencies](https://img.shields.io/david/trueadm/inferno.svg?style=flat-square)](https://david-dm.org/trueadm/inferno)
[![devDependency Status](https://david-dm.org/trueadm/inferno/dev-status.svg?style=flat-square)](https://david-dm.org/trueadm/inferno#info=devDependencies)
[![MIT](https://img.shields.io/npm/l/inferno.svg?style=flat-square)](https://github.com/trueadm/inferno/blob/master/LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/inferno.svg?style=flat-square)](https://www.npmjs.com/package/inferno)
[![npm downloads](https://img.shields.io/npm/dm/inferno-dom.svg?style=flat-square)](https://www.npmjs.org/package/inferno-dom)

Inferno is an isomorphic library for building high-performance user interfaces, which is crucial when targeting mobile devices. Unlike typical virtual DOM libraries like React, Mithril, Virtual-dom, Snabbdom and Om, Inferno uses techniques to separate static and dynamic content. This allows Inferno to only "diff" renders that have dynamic values.

In addition to this, we've carefully optimized the code to ensure there is as little overhead as possible. We believe that Inferno is currently one of the fastest virtual DOM implementation out there - as shown by some of our [benchmarks](#benchmarks). Inferno is all about performance, whilst keeping a robust API that replicates the best features from libraries such as React.

In principle, Inferno is compatible with the standard React API, allowing painless transition from React to Inferno. Furthermore, Inferno has a Babel plugin allowing JSX syntax to transpile to optimised Inferno virtual DOM.

## Key Features

- One of the fastest front-end frameworks for rendering UI in the DOM
- Components have a similar API to React ES2015 components with `inferno-component`
- Stateless components are fully supported and have more usability thanks to Inferno's [hooks](#hooks) system
- Isomorphic/universal for easy server-side rendering with `inferno-server`

## Benchmarks

- [Virtual DOM Benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)
- [UI Bench](https://localvoid.github.io/uibench/)
- [dbmonster](http://infernojs.org/benchmarks/dbmonster/)
- [dbmonster (lazy optimisation)](http://infernojs.org/benchmarks/dbmonster-lazy/)
- [Angular Test Table](http://infernojs.org/benchmarks/angular-test-table/infernojs/index.html)
- [JS Web Frameworks Benchmark - Round 4](http://stefankrause.net/js-frameworks-benchmark4/webdriver-ts/table.html)

## Install

Very much like React, Inferno requires the `inferno` and the `inferno-dom` packages for consumption in the browser's DOM. Inferno also has the `inferno-server` package for
server-side rendering of virtual DOM to HTML strings (differing from React's route of using `react-dom/server` for server-side rendering). Furthermore, rather than include the
ES2015 component with class syntax in core (like React), the component is in a separate package `inferno-component` to allow for better modularity.

NPM:

Core package:

```sh
npm install --save inferno
```
 
 ES2015 stateful components (with lifecycle events) package:
 
```sh
npm install --save inferno-component 
```
 
Browser DOM rendering package:

```sh
npm install --save inferno-dom 
```

Helper for creating Inferno VNodes (similar to `React.createElement`):

```sh
npm install --save inferno-create-element 
```

Helper for creating Inferno Components via ES5 (similar to `React.createClass`):

```sh
npm install --save inferno-create-class
```

Server-side rendering package:

```sh
npm install --save inferno-server 
```

Basic routing functionality:

```sh
npm install --save inferno-router 
```

Pre-bundled files for browser consumption can be found on [our cdnjs](https://cdnjs.com/libraries/inferno):
 
```
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno.min.js
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-create-element.min.js
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-create-class.min.js
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-component.min.js
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-dom.min.js
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-server.min.js
https://cdnjs.cloudflare.com/ajax/libs/inferno/0.7.27/inferno-router.min.js
```

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same, good, design ideas as React regarding components: one-way data flow and separation of concerns.
In these examples, JSX is used via the [Inferno JSX Babel Plugin](https://github.com/trueadm/babel-plugin-inferno) to provide a simple way to express Inferno virtual DOM.

```javascript
import Inferno from 'inferno';
import InfernoDOM from 'inferno-dom';

const message = "Hello world";

InfernoDOM.render(
  <MyComponent message={ message } />,
  document.getElementById("app")
)
```
Furthermore, Inferno also uses ES6 components like React:

```javascript
import Inferno from 'inferno';
import Component from 'inferno-component';
import InfernoDOM from 'inferno-dom';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    }
  }
  render() {
    return (
      <div>
        <h1>Header!</h1>
        <span>Counter is at: { this.state.counter }</span>
      </div>
    )
  }
}

InfernoDOM.render(<MyComponent />, document.body);
```
The real difference between React and Inferno is the performance offered at run-time. Inferno can handle large, complex DOM models without breaking a sweat.
This is essential for low-powered devices such as tablets and phones, where users are quickly demanding desktop-like performance on their slower hardware.

## Inferno Top-Level API

### Inferno.createVNode

Creates an Inferno VNode object that has chainable setting methods.

```javascript
import createVNode from 'inferno';

InfernoDOM.render(createVNode().setTag('div').setClassName('foo').setAttrs({ id: 'test' }).setChildren('Hello world!'), document.body);
```

### Inferno.createBlueprint

Creates an Inferno VNode using a predefined blueprint. Using the reference to the blueprint, it allows for faster optimisations with little overhead.

```javascript
import InfernoDOM from 'inferno-dom';

const myBlueprint = Inferno.createBlueprint({
    tag: 'div',
    attrs: {
        id: 'foo'
    },
    children: { arg: 0 }
});

InfernoDOM.render(myBlueprint('foo'), document.body);
```

For each property on the object passed as the argument to `createBlueprint`, anything that has been defined with `{ arg: X }` is regarded as a dynamic value (matching the argument of calling this blueprint), otherwise the properties are regarded as static.
For example: if my object is `const blueprint = Inferno.createBlueprint({ tag: { arg: 0 } })`, then you'd expect to call `blueprint('div')` with the `argument 0` (first argument) being the tag for the VNode.

### InfernoCreateElement

Creates an Inferno VNode using a similar API to that found with React's `createElement`

```javascript
import InfernoDOM from 'inferno-dom';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';

class BasicComponent extends Component {
    render() {
        return createElement('div', {
               className: 'basic'
           },
           createElement('span', {
               className: this.props.name
           }, 'The title is ', this.props.title)
       )
    }
}

InfernoDOM.render(createElement(BasicComponent, { title: 'abc' }), document.body);
```

### InfernoComponent

**Stateful component:**

```javascript
import Component from 'inferno-component';

class MyComponent extends Component {
  render() {
    ...
  }
}
```

This is the base class for Inferno Components when they're defined using ES6 classes.

**Stateless component:**

```javascript
import Inferno from 'inferno';

const MyComponent = ({ name, age }) => (
  <span>My name is: { name } and my age is: {age}</span>  
);
```

Stateless components are first-class functions where their first argument is the `props` passed through from their parent.

### InfernoDOM.render

```javascript
import Inferno from 'inferno';
import InfernoDOM from 'inferno-dom';

InfernoDOM.render(<div />, document.body);
```

Render a virtual node into the DOM in the supplied container given the supplied virtual DOM. If the virtual node was previously rendered
into the container, this will perform an update on it and only mutate the DOM as necessary, to reflect the latest Inferno virtual node.

Warning: If the container element is not empty before rendering, the content of the container will be overwriten on the initial render.

### renderToString

```javascript
import Inferno from 'inferno';
import InfernoServer from 'inferno-server';

InfernoServer.renderToString(<div />);
```

Render a virtual node into an HTML string, given the supplied virtual DOM.

## Hooks

Please note: hooks are provided by `inferno-dom`;

Inferno supports many of the basic events on DOM nodes, such as `onClick`, `onMouseOver` and `onTouchStart`. Furthermore, Inferno allows you to attach
common hooks directly onto components and DOM nodes. Below is the table of all possible hooks available in `inferno-dom`.

| Name                      | Triggered when                                                 | Arguments to callback           |
| -----------               | --------------                                                 | -----------------------         |
| `onCreated`               | a DOM node has just been created                               | `domNode`                       |
| `onAttached`              | a DOM node being attached to the document                      | `domNode`                       |
| `onWillDetach`            | a DOM node is about to be removed from the document            | `domNode`                       |
| `onWillUpdate`            | a DOM node is about to perform any potential updates           | `domNode`                       |
| `onDidUpdate`             | a DOM node has performed any potential updates                 | `domNode`                       |
| `onComponentWillMount`    | a stateless component is about to mount                        | `domNode, props`                |
| `onComponentDidMount`     | a stateless component has mounted successfully                 | `domNode, props`                |
| `onComponentWillUnmount`  | a stateless component is about to be unmounted                 | `domNode, props`                |
| `onComponentShouldUpdate` | a stateless component has been triggered to updated            | `domNode, lastProps, nextProps` |
| `onComponentWillUpdate`   | a stateless component is about to perform an update            | `domNode, lastProps, nextProps` |
| `onComponentDidUpdate`    | a stateless component has performed an updated                 | `domNode, props`                |

### Using hooks

It's simple to implicitly assign hooks to both DOM nodes and stateless components.
Please note: stateful components (ES2015 classes) from `inferno-component` **do not** support hooks.

```javascript
function createdCallback(domNode, props) {
    // [domNode] will be available for DOM nodes and components (if the component has mounted to the DOM)
	// [props] will only be passed for stateless components
}

InfernoDOM.render(<div onCreated={ createdCallback } />, document.body);

function StatelessComponent({ props }) {
	return <div>Hello world</div>;
}

InfernoDOM.render(<StatelessComponent onComponentWillMount={ createdCallback } />, document.body);
```

Hooks provide powerful lifecycle events to stateless components, allowing you to build components without being forced to use ES2015 classes.

## Third-party state libraries

Inferno now has bindings available for some of the major state management libraries out there:

- [Redux](https://github.com/trueadm/inferno/tree/master/packages/inferno-redux) via `inferno-redux`
- [MobX](https://github.com/nightwolfz/mobx-inferno) via `mobx-inferno`
- [Cerebral](https://github.com/cerebral/cerebral-view-inferno) via `cerebral-view-inferno`

## Performance

Inferno tries to address two problems with creating UI components:
- Writing large applications in large teams is slow in terms of development and expensive in costs – it shouldn't be.
- Writing complex applications generally results in poor performance on mobile/tablet/older machines – it shouldn't.
- Writing intensive modern UIs that require many updates/animations falls apart and becomes overly complicated - it shouldn't be.

Writing code should be fun. Browsers are getting more advanced and the technologies being supported are growing by the week. It's about
time a library offered more fun without compromising performance.

## Browser Support

Inferno supports IE11+, Edge, Chrome, Firefox and Safari 8+. In order to support IE8+, Inferno requires polyfills for the following JavaScript features:

- [Map object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Object.keys](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
- [Object.assign](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

Potential solutions including using the [es5-shim](https://github.com/es-shims/es5-shim) for ES5 features and [es6-shim](https://github.com/paulmillr/es6-shim) from ES2015 features.

## JSX
 
Inferno has its own [JSX Babel plugin](https://github.com/trueadm/babel-plugin-inferno).

## Differences from React

Inferno strives to be compatible with much of React's basic API. However, in some places, alternative implementations have been used.
Non-performant features have been removed or replaced where an alternative solution is easy to adopt without too many changes.

Inferno doesn't have react's synthetic events, which means DOM elements have their events triggered in the same manner as you'd expect from the browser you're running.

### Custom namespaces

Inferno wants to always deliver great performance and in order to do so, it has to make intelligent assumptions about the state of the DOM and the elements available to mutate. Custom namespaces conflict with this idea and change the schema of how different elements and attributes might work; so Inferno makes no attempt to support namespaces. Instead, SVG namespaces are automatically applied to elements and attributes based on their `tag name`.

### The stateful ES2015 Component is located in its own package
 
React's ES2015 component is referenced as `React.Component`. To reduce the bloat on the core of `Inferno`, we've extracted the ES2015 component
into its own package, specifically `inferno-component` rather than `Inferno.Component`. Many users are opting to use stateless components with
Inferno's `hooks` to give similar functionality as that provided by ES2015 components.

## Contributing

### Testing

```sh
npm run test:browser // browser tests
npm run test:server // node tests
npm run test // browser and node tests
npm run browser // hot-loaded browser tests
```

### Building

```sh
npm run build
```
### Linting

```sh
npm run lint:source // lint the source
```

### Inferno is supported by BrowserStack

<img src="http://infernojs.org/browserstack.svg" height="50px" alt="Supported by Browserstack" />

