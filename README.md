# InfernoJS

Inferno is a framework for building user-interface components (specifically for the browser's DOM). Inferno achieves great performance for demanding applications by taking a completely different approach to the virtual DOM problem. Unlike other frameworks that use virtual DOM, Inferno does not "diff" the virtual DOM on each update, but rather it carries out a "diff" on the actual values themselves. This technique allows Inferno to achieve lightning fast DOM operations with very little overhead.

We understand that developers enjoy writing UI components in the React + Flux + JSX workflow. Inferno doesn't try to disrupt this workflow, it simply compliments it.

Note: Inferno is still in early development. Documentation, test coverage and features are a work-in-progress.

## Design

Inferno takes a completely different approach to solving the problem of UI performance:
- on each update, a number of virtual fragments are created
- the virtual fragments are compared to the last update and changes are detected
- virtual fragments use pointers and instructions to best update the DOM
- the fragments are recycled and re-used where possible

So in many ways, Inferno is a "virtual fragment" framework. This provides the same flexibility of virtual DOM, but with
much better memory usage and faster creation/update performance.

## Installation

You can install Inferno via NPM:

```sh
$ npm install inferno
```

To build your own Inferno build files, you can start the build via:

Development:
```sh
$ npm run dev
```
or you can watch changes:
```sh
$ npm run dev-watch
```

Tests:
```sh
$ npm run test
```

Production (minfied):
```sh
$ npm run build
```

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same good (in our opinion) design ideas regarding components, one-way data passing and separation of concerns.
In these examples, [t7](https://github.com/trueadm/t7) is used to provide a very easy way to express virtual fragments and templates in JSX-like syntax.

```javascript

var message = "Hello world";

Inferno.render(
  t7`<MyComponent message=${ message } />`,
  document.getElementById("app")
)
```
Furthermore, Inferno also uses ES6 components like React:

```javascript
t7.module(funciton(t7) {
  class Component extends Inferno.Component {
    constructor(props) {
      super(props);
      this.state.counter = 0;
    }
    render() {
      return t7`
        <div>
          <h1>Header!</h1>
          <span>Counter is at: ${ this.state.counter }</span>
        </div>
      `;
    }  
  }

  t7.assign("Component", Component);
  Inferno.render(t7`<Component />`, document.body);
});
```
The real difference between React and Inferno is the performance offered at run-time. Inferno can handle large, complex DOM models without breaking a sweat.
This is essential for low-power devices such as tablets and phones, where users of those devices are quickly demanding desktop like performance on their slower hardware.

## Key Features

- Inferno is currently one of the fastest front-end framework there is for rendering UI components.
- Inferno components have a very similar API to React ES6 components – with a few slight adjustments to how contexts are passed around.
- Inferno works perfectly with [t7](https://github.com/trueadm/t7) to provide a JSX-like synatax for those coming from React.
- Inferno is light-weight and compact – it doesn't have routers, controllers or Flux built-in. It doesn't have any hard dependencies.
- Inferno is isomorphic/universal and can easily be compiled and run on the server (via Node).

## Benchmarks

- [Virtual DOM Benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)
- [dbmonster (ES6 classes)](http://infernojs.org/benchmarks/dbmonster/)
- [dbmonster (no ES6 classes)](http://infernojs.org/benchmarks/dbmonster/inferno-dbmonster-raw-es5.html)
- [Angular Test Table](http://infernojs.org/benchmarks/angular-test-table/infernojs/index.html)

## Inferno Top-Level API

[This section is still under development]

### Inferno.Component

```javascript
class MyComponent extends Component {
  render() {
    ...
  }
}
```

This is the base class for Inferno Components when they're defined using ES6 classes.

### Inferno.render

```javascript
Inferno.render(t7`<div></div>`, document.body);
```

Render a fragment into the DOM in the supplied container and return a reference to the component. If the fragment was previously rendered into container, this will
perform an update on it and only mutate the DOM as necessary to reflect the latest Inferno component.

### Inferno.unmountComponentAtNode

```javascript
Inferno.unmountComponentAtNode(document.getElementById("myApp"));
```

Remove a rendered Inferno component from the DOM and clean up its event handlers and state.

### Inferno.renderToString

[Development in progress]

```javascript
Inferno.renderToString(t7`<MyComponent></MyComponent>`);
```

Render a fragment to its initial HTML. This should only be used on the server. Inferno will return an HTML string.

### Inferno.createTemplate

[Development in progress]

### Inferno.createFragment

[Development in progress]

## Performance

Inferno tries to address two problems with creating UI components:
- Writing large applications in large teams is slow in terms of development and expensive in costs – it shouldn't be.
- Writing complex applications generally gives poor performance on mobile/tablet/older machines – it shouldn't.
- Writing intensive modern UIs that require many updates/animations falls apart and becomings overly complicated - it shouldn't be.

Writing code should be fun. Browsers are getting more advanced and the technologies being supported are growing by the week. It's about
time a framework offered more fun without compromising performance.

## In development

Inferno is still in early development and there are still many missing features and optimisations to be had. Do not use this framework in production environments until a stable
release has been stated. Features that still need to be completed:

- Refs needs adding
- Lifecycle events need finishing
- Universal/isomorphic features
- There are currently no tests in place, this needs to be done
- There is no API documentation or general documentation available
