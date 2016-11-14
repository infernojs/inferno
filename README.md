<p align="center"><img src="http://infernojs.org/img/inferno.png" width="150px"></p>
<p>&nbsp;</p>
[![Build Status](https://img.shields.io/travis/trueadm/inferno/master.svg?style=flat-square)](https://travis-ci.org/trueadm/inferno/branches)
[![Coverage Status](https://img.shields.io/coveralls/trueadm/inferno/master.svg?style=flat-square)](https://coveralls.io/github/trueadm/inferno?branch=master)
[![Dependencies](https://img.shields.io/david/trueadm/inferno.svg?style=flat-square)](https://david-dm.org/trueadm/inferno)
[![devDependency Status](https://david-dm.org/trueadm/inferno/dev-status.svg?style=flat-square)](https://david-dm.org/trueadm/inferno#info=devDependencies)
[![MIT](https://img.shields.io/npm/l/inferno.svg?style=flat-square)](https://github.com/trueadm/inferno/blob/master/LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/inferno.svg?style=flat-square)](https://www.npmjs.com/package/inferno)
[![npm downloads](https://img.shields.io/npm/dm/inferno-dom.svg?style=flat-square)](https://www.npmjs.org/package/inferno-dom)
[![Slack Status](https://inferno-slack.herokuapp.com/badge.svg)](https://inferno-slack.herokuapp.com/)

Inferno is an isomorphic library for building high-performance user interfaces, which is crucial when targeting mobile devices. Unlike typical virtual DOM libraries like React, Mithril, Virtual-dom, Snabbdom and Om, Inferno uses techniques to separate static and dynamic content. This allows Inferno to only "diff" renders that have dynamic values.

In addition to this, we've carefully optimized the code to ensure there is as little overhead as possible. We believe that Inferno is currently one of the fastest virtual DOM implementation out there - as shown by some of our [benchmarks](#benchmarks). Inferno is all about performance, whilst keeping a robust API that replicates the best features from libraries such as React.

In principle, Inferno is compatible with the standard React API, allowing painless transition from React to Inferno. Furthermore, Inferno has a Babel plugin allowing JSX syntax to transpile to optimised Inferno virtual DOM.

## Key Features

- One of the fastest front-end frameworks for rendering UI in the DOM
- Components have a similar API to React ES2015 components with `inferno-component`
- Stateless components are fully supported and have more usability thanks to Inferno's [stateless component hooks](#stateless-component-hooks)
- Isomorphic/universal for easy server-side rendering with `inferno-server`

## Benchmarks

- [Virtual DOM Benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)
- [UI Bench](https://localvoid.github.io/uibench/)
- [dbmonster](http://infernojs.org/benchmarks/dbmonster/)
- [dbmonster (lazy optimisation)](http://infernojs.org/benchmarks/dbmonster-lazy/)
- [Angular Test Table](http://infernojs.org/benchmarks/angular-test-table/infernojs/index.html)
- [JS Web Frameworks Benchmark - Round 4](http://stefankrause.net/js-frameworks-benchmark4/webdriver-ts/table.html)

## Live Demos/Examples

- [**Simple Clock** (@JSFiddle)](https://jsfiddle.net/rqwmkx40/)

## Install

NPM:

Core package:

```sh
npm install --save inferno@beta6
```

Addons:

```sh
# ES2015 stateful components
npm install --save inferno-component@beta6
# server-side rendering
npm install --save inferno-server@beta6
# routing
npm install --save inferno-router@beta6
``` 

Pre-bundled files for browser consumption can be found on [our cdnjs](https://cdnjs.com/libraries/inferno):
 
```
https://cdnjs.cloudflare.com/ajax/libs/inferno/1.0.0/inferno.min.js
```

## Creating virtual DOM

### JSX:
```sh
npm install --save-dev babel-plugin-inferno@beta6
```

### Hyperscript:
```sh
npm install --save inferno-hyperscript@beta6
```

### createElement:
```sh
npm install --save inferno-create-element@beta6
```

## Compatability with existing React apps
```sh
npm install --save-dev inferno-compat@beta6
```

Note: Make sure you read more about [`inferno-compat`](https://github.com/trueadm/inferno/tree/master/packages/inferno-compat) before using it.

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same, good, design ideas as React regarding components: one-way data flow and separation of concerns.
In these examples, JSX is used via the [Inferno JSX Babel Plugin](https://github.com/trueadm/babel-plugin-inferno) to provide a simple way to express Inferno virtual DOM.

```javascript
import Inferno from 'inferno';

const message = "Hello world";

Inferno.render(
  <MyComponent message={ message } />,
  document.getElementById("app")
)
```
Furthermore, Inferno also uses ES6 components like React:

```javascript
import Inferno from 'inferno';
import Component from 'inferno-component';

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

Inferno.render(<MyComponent />, document.body);
```

## Inferno Top-Level API

### `render` (package: `inferno`)

```javascript
import Inferno from 'inferno';

Inferno.render(<div />, document.body);
```

Render a virtual node into the DOM in the supplied container given the supplied virtual DOM. If the virtual node was previously rendered
into the container, this will perform an update on it and only mutate the DOM as necessary, to reflect the latest Inferno virtual node.

Warning: If the container element is not empty before rendering, the content of the container will be overwriten on the initial render.

### `createRenderer` (package: `inferno`)

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

### `createElement` (package: `inferno-create-element`)

Creates an Inferno VNode using a similar API to that found with React's `createElement`

```javascript
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

Inferno.render(createElement(BasicComponent, { title: 'abc' }), document.body);
```

### `Component` (package: `inferno-component`)

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

### `createVNode` (package: `inferno`)

Create a new Inferno `VNode` using `createVNode`. A `VNode` is a virtual DOM object that is used to 
describe a single element of the UI. Typically `createElement`, `hyperscript` or JSX are used to create
`VNode`s for Inferno, but under the hood they all use `createVNode`. Below is an example of using
of `createVNode` usage:

```javascript
import Inferno from 'inferno';

const vNode = Inferno.createVNode(2, 'div', { className: 'example' }, 'Hello world!');

Inferno.render(vNode, container);
```

The first argument for `createVNode` is a value from [`VNodeFlags`]('linktoreadmeforthis'), this is numerical value that used to tell Inferno what the VNode is meant to describe on the page.

### `cloneVNode` (package: `inferno`)

TODO

### `findDOMNode` (package: `inferno`)

TODO

**Stateless component:**

```javascript
import Inferno from 'inferno';

const MyComponent = ({ name, age }) => (
  <span>My name is: { name } and my age is: {age}</span>  
);
```

Stateless components are first-class functions where their first argument is the `props` passed through from their parent.

### `renderToString` (package: `inferno-server`)

```javascript
import Inferno from 'inferno';
import InfernoServer from 'inferno-server';

InfernoServer.renderToString(<div />);
```

Render a virtual node into an HTML string, given the supplied virtual DOM.

## Stateless component hooks

| Name                      | Triggered when                                                 | Arguments to callback           |
| -----------               | --------------                                                 | -----------------------         |
| `onComponentWillMount`    | a stateless component is about to mount                        |                                 |
| `onComponentDidMount`     | a stateless component has mounted successfully                 | `domNode`                       |
| `onComponentWillUnmount`  | a stateless component is about to be unmounted                 |                                 |
| `onComponentShouldUpdate` | a stateless component has been triggered to updated            | `lastProps, nextProps`          |
| `onComponentWillUpdate`   | a stateless component is about to perform an update            | `lastProps, nextProps`          |
| `onComponentDidUpdate`    | a stateless component has performed an updated                 | `lastProps, nextProps`          |

### Using hooks

It's simple to implicitly assign hooks to both DOM nodes and stateless components.
Please note: stateful components (ES2015 classes) from `inferno-component` **do not** support hooks.

```javascript
function createdCallback(domNode, props) {
    // [domNode] will be available for DOM nodes and components (if the component has mounted to the DOM)
	// [props] will only be passed for stateless components
}

Inferno.render(<div onCreated={ createdCallback } />, document.body);

function StatelessComponent({ props }) {
	return <div>Hello world</div>;
}

Inferno.render(<StatelessComponent onComponentWillMount={ createdCallback } />, document.body);
```

Hooks provide powerful lifecycle events to stateless components, allowing you to build components without being forced to use ES2015 classes.

## Third-party state libraries

Inferno now has bindings available for some of the major state management libraries out there:

- [Redux](https://github.com/trueadm/inferno/tree/master/packages/inferno-redux) via `inferno-redux`
- [MobX](https://github.com/trueadm/inferno/tree/master/packages/inferno-mobx) via `inferno-mobx`
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
- [WeakMap object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
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
