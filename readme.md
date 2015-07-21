# InfernoJS

Inferno is a framework for building user-interface components (specifically for the browser's DOM). Inferno achieves great performance for demanding applications by using virtual DOM as a lightweight representation of the
actual DOM to construct interfaces in a simple manner. However, unlike other frameworks that use virtual DOMs, Inferno does not "diff" the virtual DOM on each update, but rather it carries out a "diff" on the actual values themselves. This technique allows Inferno to achieve lightning fast DOM operations with very little overhead.

Furthermore, Inferno deals exclusively with t7 templates. [t7](https://github.com/trueadm/t7) parses template strings into optimised virtual DOM nodes that Inferno understands. Inferno then takes theses virtual DOM nodes and produces two sets of trees: a DOM tree and a value tree. It can then use both of these trees to intelligently make decisions based on what has changed and what needs to be created/removed/updated.

Note: Inferno is still in early development. Documentation, test coverage and features are a work-in-progress.

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same good (in our opinion) design ideas regarding components, one-way data passing and separation of concerns.

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
  class Component implements Inferno.Component {
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
- Inferno requires the [t7 template](https://github.com/trueadm/t7) library to parse its templates into optimised Inferno virtual DOM objects.
- Inferno is light-weight and compact – it doesn't have routers, controllers or Flux built-in. It doesn't have any hard dependencies other than `t7` (which comes bundled with Inferno).
- Inferno is isomorphic and can easily be compiled and run on the server (via Node).

## Benchmarks

- [vdom-benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)
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

Render a t7 template into the DOM in the supplied container and return a reference to the component. If the t7 template was previously rendered into container, this will
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

Render a t7 template to its initial HTML. This should only be used on the server. Inferno will return an HTML string.

### Inferno.createElement

[Development in progress]

An alternative to using t7 for generating virtual DOM nodes for Inferno.

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

- Cloning nodes needs refining and completing
- Keyed nodes need adding
- Refs needs adding
- More input events need to be added as does the case of the root input delegation source
- There are currently no tests in place, this needs to be done
- There is no API documentation or general documentation available
