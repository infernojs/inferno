# InfernoJS

[![Build Status](https://travis-ci.org/trueadm/inferno.svg?branch=dev)](https://travis-ci.org/trueadm/inferno)
[![Coverage Status](https://coveralls.io/repos/trueadm/inferno/badge.svg?branch=master&service=github)](https://coveralls.io/github/trueadm/inferno?branch=master)
[![Dependency Status](https://david-dm.org/trueadm/inferno.svg)](https://david-dm.org/trueadm/inferno)
[![devDependency Status](https://david-dm.org/trueadm/inferno/dev-status.svg)](https://david-dm.org/trueadm/inferno#info=devDependencies)
[![npm version](https://badge.fury.io/js/inferno.svg)](https://badge.fury.io/js/inferno)

Inferno is a lightweight isomorphic framework for building shockingly performant user interfaces. Unlike typical virtual DOM libraries like React, Mitrhil, Cycle and Om, Inferno does not rely on diffing DOM virtual elements, but instead it differentiates static content from dynamic content and only diffs the values that change within a given fragment of virtual DOM elements (we call them virtual fragments).

In addition to this, we've painstakingly optimized the code to make sure that there is as little overhead as possible. We believe that Inferno is currently the fastest vDOM implementation on out there - as shown by some of our [benchmarks](#benchmarks). Inferno is all about performance, whilst keeping a robust API that replicates the best features from libraries such as React.

In principle, Inferno is compatible with the standard React API, allowing for painless transition from React to Inferno in most use cases. Furthermore Inferno has a Babel plugin allowing JSX syntax to transpile to optimised Inferno templates.

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
npm run test:browser // browser tests

npm run test:server // node tests

npm run test // browser and node tests

```

## Building

```sh
npm run build

```
## Linting

```sh
npm run lint:source // lint the source

```

## Overview

Let's start with some code. As you can see, Inferno intentionally keeps the same good (in our opinion) design ideas regarding components, one-way data passing and separation of concerns.
In these examples, JSX is used via the [Inferno JSX Babel Plugin](https://github.com/trueadm/babel-plugin-inferno) to provide a very easy way to express virtual fragments.

```js
const message = "Hello world";

Inferno.render(
  <MyComponent message={ message } />,
  document.getElementById("app")
)
```
Furthermore, Inferno also uses ES6 components like React:

```js
class Component extends Inferno.Component {
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

Inferno.render(<Component />, document.body);
```
The real difference between React and Inferno is the performance offered at run-time. Inferno can handle large, complex DOM models without breaking a sweat.
This is essential for low-power devices such as tablets and phones, where users of those devices are quickly demanding desktop like performance on their slower hardware.

## Key Features

- one of the fastest front end frameworks for rendering UI
- components have a similar API to React ES6 components
- components can also be stateless like React components (pure functions)
- isomorphic/universal for easy server-side rendering

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

**Stateful component:**

```js
class MyComponent extends Component {
  render() {
    ...
  }
}
```

This is the base class for Inferno Components when they're defined using ES6 classes.

**Stateless component:**

```js
const MyComponent => ({ name, age }) => 
  <span>My name is: { name } and my age is: {age}</span>  
);
```

Stateless components are first-class functions where their only argument is the `props` passed through from their parent.

### Inferno.render

```javascript
Inferno.render(<div />, document.body);
```

Render a fragment into the DOM in the supplied container and return a reference to the component. If the fragment was previously rendered into container, this will
perform an update on it and only mutate the DOM as necessary to reflect the latest Inferno component.

### Inferno.renderToString

```js
Inferno.renderToString(<MyComponent />);
```

[Note: currently in development]

Render a fragment to its initial HTML. This should only be used on the server. Inferno will return an HTML string.

### Inferno.createTemplate

```js
const template = Inferno.createTemplate(() => ({
  tag: 'div',
  attrs: { className: 'test'},
  children: [
    'This', ' is ', 'a test!'
  ]
}));

Inferno.render(template(), document.body);
```
### Inferno.TemplateFactory

```js

    class BasicComponent extends Inferno.Component {
        render() {
            const template = Inferno.createTemplate((name, title) =>
                TemplateFactory("div", {
                        className: "basic"
                    },
                    TemplateFactory("span", {
                        className: name
                    }, "The title is ", title)
                )
            );
            return template(this.props.name, this.props.title);
        }
    }
  
  const template = Inferno.createTemplate((Component, title) =>
                TemplateFactory('div', null,
                    TemplateFactory(Component, {
                        title: title,
                        name: "basic-render"
                    })
                )
            );

Inferno.render(template(BasicComponent, 'abc'), container);
```
Inferno.TemplateFactory is hyperscript function that works the same way as React.creactElement(). It's first argument is the node, second argument is the attributes and the third and last argument is it's children.

### Inferno.createRef

```js
const divRef = Inferno.createRef();

Inferno.render(<div ref={ divRef } />, document.body);
divRef.element.textContent = 'Modifying the DOM node directly!';
```

Creates a mutable object that links an Inferno rendered template node to its real DOM node upon being mounted to the DOM.

## Performance

Inferno tries to address two problems with creating UI components:
- Writing large applications in large teams is slow in terms of development and expensive in costs – it shouldn't be.
- Writing complex applications generally gives poor performance on mobile/tablet/older machines – it shouldn't.
- Writing intensive modern UIs that require many updates/animations falls apart and becomings overly complicated - it shouldn't be.

Writing code should be fun. Browsers are getting more advanced and the technologies being supported are growing by the week. It's about
time a framework offered more fun without compromising performance.

## JSX
 
Inferno has it's own [JSX Babel plugin](https://github.com/trueadm/babel-plugin-inferno).

## Still under development

Inferno is still under development, and there are some missing features and optimizations to be made.The high priority now is the server side rendring (SSR).

## Todo

- implement isomorphism/universal server side rendering
- add API docs
- add examples repo

### Inferno is supported by BrowserStack

<img src="http://infernojs.org/browserstack.svg" height="50px" alt="Supported by Browserstack" />
