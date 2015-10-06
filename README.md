# InfernoJS

[![Build Status](https://travis-ci.org/trueadm/inferno.svg?branch=new-build)](https://travis-ci.org/trueadm/inferno)

Inferno is a lightweight isomorphic framework for building shockingly performant user interfaces. It takes an unconventional approach to the Virtual DOM; Inferno does not rely on diffing the DOM (an expensive operation), but instead on smart value diffing  static node caching, assuring that it only performs the minimal work involved in updating the DOM. 

In addition to this, we've painstakingly optimized the code to make sure that there is as little overhead as possible. We are currently the fastest vDOM implementation on the [benchmarks](#benchmarks). To date, there is no faster JavaScript framework out there in any benchmark tested.

Inferno is compatible with the React API and JSX syntax, and works great with Flux, Cycle, and RxJS.

## Algorithm

1. On startup, templates are generated, identifying static and dynamic nodes
2. Per update, virtual fragments are created based on each template
3. Values for dynamic nodes are diffed and updated if necessary
4. Fragments are recycled for next render

To be more technically correct, Inferno is a "virtual fragment" framework, which provides the same flexibility as a Virtual DOM does, but with a much smaller memory footprint and greater performance.

## Install

```sh
npm install --save inferno
```

## Testing

```sh
npm run test
```

## Building

```sh
npm run build-dev
npm run build-pro
```

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same good (in our opinion) design ideas regarding components, one-way data passing and separation of concerns.
In these examples, [t7](https://github.com/trueadm/t7) is used to provide a very easy way to express virtual fragments and templates in JSX-like syntax.

```js

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

- one of the fastest front end frameworks for rendering UI
- components have a similar API to React ES6 components
- works perfectly with [t7](https://github.com/trueadm/t7)
- no dependencies
- isomorphic for easy SSR

## Benchmarks

- [Virtual DOM Benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)
- [dbmonster (ES6 classes)](http://infernojs.org/benchmarks/dbmonster/)
- [dbmonster (no ES6 classes)](http://infernojs.org/benchmarks/dbmonster/inferno-dbmonster-raw-es5.html)
- [Angular Test Table](http://infernojs.org/benchmarks/angular-test-table/infernojs/index.html)

## Inferno Top-Level API

```js
// TODO
```

### Inferno.Component

```js
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

```js
// TODO
```

```js
Inferno.renderToString(t7`<MyComponent></MyComponent>`);
```

Render a fragment to its initial HTML. This should only be used on the server. Inferno will return an HTML string.

### Inferno.createTemplate

```js
// TODO
```

### Inferno.createFragment

```js
// TODO
```

## Performance

Inferno tries to address two problems with creating UI components:
- Writing large applications in large teams is slow in terms of development and expensive in costs – it shouldn't be.
- Writing complex applications generally gives poor performance on mobile/tablet/older machines – it shouldn't.
- Writing intensive modern UIs that require many updates/animations falls apart and becomings overly complicated - it shouldn't be.

Writing code should be fun. Browsers are getting more advanced and the technologies being supported are growing by the week. It's about
time a framework offered more fun without compromising performance.

## Early Stages

Inferno is still in early development and there are still many missing features and optimizations to be made. Don't use this framework in production just yet.

## Todo

- implement refs
- implement lifecycle methods
- implement strict isomorphism
- add API docs
- add more examples

### Inferno is supported by BrowserStack

<img src="http://infernojs.org/browserstack.svg" height="50px" alt="Supported by Browserstack" />
