# Inferno

[![Build Status](https://img.shields.io/travis/trueadm/inferno/master.svg?style=flat-square)](https://travis-ci.org/trueadm/inferno/branches)
[![Coverage Status](https://img.shields.io/coveralls/trueadm/inferno/master.svg?style=flat-square)](https://coveralls.io/github/trueadm/inferno?branch=master)
[![Dependencies](https://img.shields.io/david/trueadm/inferno.svg?style=flat-square)](https://david-dm.org/trueadm/inferno)
[![devDependency Status](https://david-dm.org/trueadm/inferno/dev-status.svg)](https://david-dm.org/trueadm/inferno#info=devDependencies)
[![MPL-2.0](https://img.shields.io/npm/l/inferno.svg?style=flat-square)](https://github.com/trueadm/inferno/blob/master/LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/inferno.svg?style=flat-square)](https://www.npmjs.com/package/inferno)

Inferno is an isomorphic library for building user interfaces with high performance (crucial when targeting mobile devices). Unlike typical virtual DOM libraries like React, Mithril, Cycle and Om, Inferno does not rely on diffing DOM virtual elements, but instead it differentiates static content from dynamic content and only diffs the values that change within a given fragment of virtual DOM elements (we call them virtual fragments).

In addition to this, we've painstakingly optimized the code to ensure there is as little overhead as possible. We believe that Inferno is currently the fastest virtual DOM implementation on out there - as shown by some of our [benchmarks](#benchmarks). Inferno is all about performance, whilst keeping a robust API that replicates the best features from libraries such as React. If you'd like to know more about how Inferno works under-the-hood, check out the [how Inferno works document](https://github.com/trueadm/inferno/blob/master/docs/how-inferno-works.md).

In principle, Inferno is compatible with the standard React API, allowing for painless transition from React to Inferno in most use cases. Furthermore, Inferno has a Babel plugin allowing JSX syntax to transpile to optimised Inferno templates.

## Key Features

- one of the fastest front-end libraries for rendering UI in the DOM
- components have a similar API to React ES2015 components with `inferno-component`
- stateless components are fully supported and have more usability thanks to Inferno's [hooks](#hooks) system
- isomorphic/universal for easy server-side rendering with `inferno-server`

## Benchmarks

- [Virtual DOM Benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)
- [dbmonster](http://infernojs.org/benchmarks/dbmonster/) (for comparison: [React](http://mathieuancelin.github.io/js-repaint-perfs/react/), [Angular 2.0](http://mathieuancelin.github.io/js-repaint-perfs/angular2/opt.html), [Riot](http://mathieuancelin.github.io/js-repaint-perfs/riot/), [Vue](http://mathieuancelin.github.io/js-repaint-perfs/vue/opt.html), [Aurelia](http://jdanyow.github.io/aurelia-dbmonster/), [Ember 2.0](https://dbmonster.firebaseapp.com/), [Ractive](http://mathieuancelin.github.io/js-repaint-perfs/ractive/) and [Mithril](http://tivac.github.io/js-repaint-perfs/mithril/))
- [Angular Test Table](http://infernojs.org/benchmarks/angular-test-table/infernojs/index.html)

## Install

Very much like React, Inferno requires the `inferno` and the `inferno-dom` packages for consumption in the browser's DOM. Inferno also has the `inferno-server` package for
server-side rendering of fragments to HTML strings (differing from React's route of using `react-dom/server` for server-side rendering). Furthermore, rather than include the
ES2015 component with class syntax in core (like React), it's in a separate package `inferno-component` to allow for better modularity.

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

Server-side rendering package:

```sh
npm install --save inferno-server 
```

Pre-bundled files for browser consumption:
 
```
http://infernojs.org/releases/0.5.22/inferno.min.js
http://infernojs.org/releases/0.5.22/inferno-component.min.js
http://infernojs.org/releases/0.5.22/inferno-dom.min.js
http://infernojs.org/releases/0.5.22/inferno-server.min.js
```

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same good (in our opinion) design ideas regarding components, one-way data passing and separation of concerns.
In these examples, JSX is used via the [Inferno JSX Babel Plugin](https://github.com/trueadm/babel-plugin-inferno) to provide a very easy way to express virtual fragments.

```jsx
import Inferno from 'inferno';
import InfernoDOM from 'inferno-dom';

const message = "Hello world";

InfernoDOM.render(
  <MyComponent message={ message } />,
  document.getElementById("app")
)
```
Furthermore, Inferno also uses ES6 components like React:

```jsx
import { Component } from 'inferno-component';

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
This is essential for low-power devices such as tablets and phones, where users of those devices are quickly demanding desktop like performance on their slower hardware.

## Inferno Top-Level API

### Inferno.createTemplate

```js
const template = Inferno.createTemplate(() => ({
  tag: 'div',
  attrs: { className: 'test'},
  children: [
    'This', ' is ', 'a test!'
  ]
}));

InfernoDOM.render(template(), document.body);
```
### Inferno.TemplateFactory

```jsx
import { Component } from 'inferno-component';

const { createElement } = Inferno.TemplateFactory;

class BasicComponent extends Component {
    render() {
        const template = Inferno.createTemplate((name, title) =>
            createElement('div', {
                    className: 'basic'
                },
                createElement('span', {
                    className: name
                }, 'The title is ', title)
            )
        );
        return template(this.props.name, this.props.title);
    }
}

const template = Inferno.createTemplate((Component, title) =>
    createElement('div', null,
        createElement(Component, {
            title: title,
            name: 'basic-render'
        })
    )
);

InfernoDOM.render(template(BasicComponent, 'abc'), container);
```
`Inferno.TemplateFactory` provides a factory `createElement()` function that can be used to build up virtual DOM structures in a similar sense to how `React.creactElement()` works. It's first argument is the node, second argument is the attributes and all remaining arguments are it's children.

### InfernoComponent.Component

**Stateful component:**

```jsx
import { Component } from 'inferno-component';

class MyComponent extends Component {
  render() {
    ...
  }
}
```

This is the base class for Inferno Components when they're defined using ES6 classes.

**Stateless component:**

```jsx
const MyComponent = ({ name, age }) => 
  <span>My name is: { name } and my age is: {age}</span>  
;
```

Stateless components are first-class functions where their first argument is the `props` passed through from their parent.

### InfernoDOM.createRef

```jsx
import InfernoDOM from 'inferno-dom';

const divRef = InfernoDOM.createRef();

InfernoDOM.render(<div ref={ divRef } />, document.body);
divRef.element.textContent = 'Modifying the DOM node directly!';
```

Creates a mutable object that links an Inferno rendered template node to its real DOM node upon being mounted to the DOM.

### InfernoDOM.render

```jsx
import InfernoDOM from 'inferno-dom';

InfernoDOM.render(<div />, document.body);
```

Render a fragment into the DOM in the supplied container given the supplied template. If the fragment was previously rendered into container, this will
perform an update on it and only mutate the DOM as necessary to reflect the latest Inferno fragment.

### InfernoServer.renderToString

```javascript
import InfernoServer from 'inferno-server';

InfernoServer.renderToString(<div />, document.body);
```

Render a fragment into the HTML string given the supplied template.

## Hooks

Please note: hooks are provided by `inferno-dom`;

Inferno supports many of the basic events upon DOM nodes, such as `onClick`, `onMouseOver` and `onTouchStart`. Furthermore, Inferno allows you to attach
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

```jsx
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

## Performance

Inferno tries to address two problems with creating UI components:
- Writing large applications in large teams is slow in terms of development and expensive in costs – it shouldn't be.
- Writing complex applications generally gives poor performance on mobile/tablet/older machines – it shouldn't.
- Writing intensive modern UIs that require many updates/animations falls apart and becomes overly complicated - it shouldn't be.

Writing code should be fun. Browsers are getting more advanced and the technologies being supported are growing by the week. It's about time a library offered more fun without compromising performance.

## JSX
 
Inferno has it's own [JSX Babel plugin](https://github.com/trueadm/babel-plugin-inferno).
### Inferno is supported by BrowserStack

<img src="http://infernojs.org/browserstack.svg" height="50px" alt="Supported by Browserstack" />

