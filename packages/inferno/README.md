<p align="center"><a href="https://infernojs.org/" target="_blank"><img width="150" alt="Inferno" title="Inferno" src="https://user-images.githubusercontent.com/2021355/36063342-626d7ea8-0e84-11e8-84e1-f22bb3b8c4d5.png"></p>

[![Build Status](https://img.shields.io/travis/infernojs/inferno/master.svg?style=flat-square)](https://travis-ci.org/infernojs/inferno/branches)
[![Coverage Status](https://img.shields.io/coveralls/infernojs/inferno/master.svg?style=flat-square)](https://coveralls.io/github/infernojs/inferno?branch=master)
[![MIT](https://img.shields.io/npm/l/inferno.svg?style=flat-square)](https://github.com/infernojs/inferno/blob/master/LICENSE.md)
[![NPM](https://img.shields.io/npm/v/inferno.svg?style=flat-square)](https://www.npmjs.com/package/inferno)
[![npm downloads](https://img.shields.io/npm/dm/inferno.svg?style=flat-square)](https://www.npmjs.org/package/inferno)
[![Slack Status](https://inferno-slack.herokuapp.com/badge.svg)](https://inferno-slack.herokuapp.com/)
[![gzip size](http://img.badgesize.io/https://unpkg.com/inferno/dist/inferno.min.js?compression=gzip)](https://unpkg.com/inferno/dist/inferno.min.js)
[![Backers on Open Collective](https://opencollective.com/inferno/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/inferno/sponsors/badge.svg)](#sponsors)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Inferno is an insanely fast, React-like library for building high-performance user interfaces on both the client and server.

## Description

The main objective of the InfernoJS project is to provide the fastest possible **runtime** performance for web applications. Inferno excels at rendering real time data views or large DOM trees.

The performance is achieved through multiple optimizations, for example:

- Inferno's own [JSX plugin](https://github.com/infernojs/babel-plugin-inferno) creates monomorphic `createVNode` calls, instead of `createElement`
- Inferno's diff process uses bitwise flags to memoize the shape of objects
- Child nodes are normalized only when needed
- Special JSX flags can be used during compile time to optimize runtime performance at application level
- Many micro optimizations

## Features

- Component driven + one-way data flow architecture
- React-like API, concepts and component lifecycle events
- Partial synthetic event system, normalizing events for better cross browser support
- Inferno's [`linkEvent`](https://github.com/infernojs/inferno/blob/master/README.md#linkevent-package-inferno) feature removes the need to use arrow functions or binding event callbacks
- Isomorphic rendering on both client and server with `inferno-server`
- Unlike React and Preact, Inferno has lifecycle events on functional components
- Unlike Preact and other React-like libraries, Inferno has controlled components for input/select/textarea elements
- Components can be rendered outside their current html hierarchy using `createPortal` - API
- Support for [older browsers](https://github.com/infernojs/inferno#browser-support) without any polyfills
- defaultHooks for Functional components, this way re-defining lifecycle events per usage can be avoided
- Unlike React, Inferno supports setting styles using string `<div style="float: left"></div>`
- Fragments (v6)
- createRef and forwardRef APIs (v6)

## Browser support
Since version 4 we have started running our test suite **without** any polyfills.
Inferno is now part of [Saucelabs](https://saucelabs.com/) open source program and we use their service for executing the tests.

InfernoJS natively supports the browsers listed below.

[![Build Status](https://saucelabs.com/browser-matrix/Havunen.svg)](https://saucelabs.com/open_sauce/user/Havunen)


## Migration guides

- [Inferno v4](https://github.com/infernojs/inferno/blob/master/documentation/v4-migration.md)
- [Inferno v6](https://github.com/infernojs/inferno/blob/master/documentation/v6-migration.md)

## Benchmarks

Live examples at [https://infernojs.github.io/inferno](https://infernojs.github.io/inferno)

- [UI Bench](https://localvoid.github.io/uibench/)
- [dbmonster](https://rawgit.com/infernojs/dbmonster-inferno/master/index.html)
- [JS Web Frameworks Benchmark - Round 7](https://www.stefankrause.net/js-frameworks-benchmark7/table.html)
- [Isomorphic-UI-Benchmark](https://github.com/marko-js/isomorphic-ui-benchmarks)
- [1k Components](https://rawgit.com/infernojs/inferno/master/benchmarks/1kcomponents/index.html)

## Code Example

Let's start with some code. As you can see, Inferno intentionally keeps the same design ideas as React regarding components: one-way data flow and separation of concerns.

In these examples, JSX is used via the [Inferno JSX Babel Plugin](https://github.com/infernojs/babel-plugin-inferno) to provide a simple way to express Inferno virtual DOM. You do not need to use JSX, it's completely **optional**, you can use [hyperscript](https://github.com/infernojs/inferno/tree/master/packages/inferno-hyperscript) or [createElement](https://github.com/infernojs/inferno/tree/master/packages/inferno-create-element) (like React does).
Keep in mind that compile time optimizations are available only for JSX.

```jsx
import { render } from 'inferno';

const message = "Hello world";

render(
  <MyComponent message={ message } />,
  document.getElementById("app")
);
```
Furthermore, Inferno also uses ES6 components like React:

```jsx
import { render, Component } from 'inferno';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    };
  }
  render() {
    return (
      <div>
        <h1>Header!</h1>
        <span>Counter is at: { this.state.counter }</span>
      </div>
    );
  }
}

render(
  <MyComponent />,
  document.getElementById("app")
);
```

Because performance is an important aspect of this library, we want to show you how to optimize your application even further.
In the example below we optimize diffing process by using JSX **$HasVNodeChildren** to predefine children shape compile time.
Then we create text vNode using `createTextVNode`. All child flags are documented [here](https://infernojs.org/docs/guides/optimizations).

```jsx
import { createTextVNode, render, Component } from 'inferno';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    };
  }
  render() {
    return (
      <div>
        <h1>Header!</h1>
        <span $HasVNodeChildren>{createTextVNode('Counter is at: ' + this.state.counter)}</span>
      </div>
    );
  }
}

render(
  <MyComponent />,
  document.getElementById("app")
);
```

### Tear down

To tear down inferno application you need to render null on root element. 
Rendering `null` will trigger unmount lifecycle hooks for whole vDOM tree and remove global event listeners.
It is important to unmount unused vNode trees to free browser memory. 

```jsx
import { createTextVNode, render, Component } from 'inferno';

const rootElement = document.getElementById("app");

// Start the application
render(
  <ExampleComponent/>,
  rootElement
);

// Tear down
render(
  null,
  rootElement
);

```


### More Examples

If you have built something using Inferno you can add them here:

- [**Simple Clock** (@JSFiddle)](https://jsfiddle.net/2nm1kqct/)
- [**Simple Clock v5** (@JSFiddle)](https://jsfiddle.net/pzmqLjo7/)
- [**Simple JS Counter** (@github/scorsi)](https://github.com/scorsi/simple-counter-inferno-cerebral-fusebox): SSR Inferno (view) + Cerebral (state manager) + FuseBox (build system/bundler)
- [**Online interface to TMDb movie database** (@codesandbox.io)](https://codesandbox.io/s/9zjo5yx8po): Inferno + [Inferno hyperscript](https://github.com/infernojs/inferno) (view) + [Superagent](https://github.com/visionmedia/superagent) (network requests) + Web component ([custom elements v1](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)) + [state-transducer](https://github.com/brucou/state-transducer) 
(state machine library) 
- [**Lemmy - a self-hostable reddit alternative** (front end in Inferno)](https://github.com/dessalines/lemmy)

## Getting Started

The easiest way to get started with Inferno is by using [Create Inferno App](https://github.com/infernojs/create-inferno-app).

Alternatively, you can try any of the following:
* the [Inferno Boilerplate](https://github.com/infernojs/inferno-boilerplate) for a very simple setup.
* for a more advanced example demonstrating how Inferno might be used, we recommend trying out [Inferno Starter Project](https://github.com/nightwolfz/inferno-starter) by [nightwolfz](https://github.com/nightwolfz/).
* for using Inferno to build a mobile app, try [Inferno Mobile Starter Project](https://github.com/Rudy-Zidan/inferno-mobile) by [Rudy-Zidan](https://github.com/Rudy-Zidan).
* for [TypeScript](https://www.typescriptlang.org/) support and bundling, check out [ts-transform-inferno](https://github.com/deamme/ts-transform-inferno), or [inferno-typescript-example](https://github.com/infernojs/inferno-typescript-example).
* for an example of how to use Inferno in [codesandbox](https://codesandbox.io/): https://codesandbox.io/s/znmyj24w4p

Core package:

```sh
npm install --save inferno
```

Addons:

```sh
# server-side rendering
npm install --save inferno-server
# routing
npm install --save inferno-router
```

Pre-bundled files for browser consumption can be found on [our cdnjs](https://cdnjs.com/libraries/inferno):

Or on jsDelivr:

```
https://cdn.jsdelivr.net/npm/inferno@latest/dist/inferno.min.js
```

Or on unpkg.com:

```
https://unpkg.com/inferno@latest/dist/inferno.min.js
```

### Creating Virtual DOM

#### JSX:
```sh
npm install --save-dev babel-plugin-inferno
```

#### Hyperscript:
```sh
npm install --save inferno-hyperscript
```

#### createElement:
```sh
npm install --save inferno-create-element
```

### Compatibility with existing React apps
```sh
npm install --save-dev inferno-compat
```

Note: Make sure you read more about [`inferno-compat`](https://github.com/infernojs/inferno/tree/master/packages/inferno-compat) before using it.

## Third-party state libraries

Inferno now has bindings available for some of the major state management libraries out there:

- Redux via [`inferno-redux`](https://github.com/infernojs/inferno/tree/dev/packages/inferno-redux)
- MobX via [`inferno-mobx`](https://github.com/infernojs/inferno/tree/dev/packages/inferno-mobx)
- Cerebral via [`@cerebral/inferno`](https://github.com/cerebral/cerebral/tree/master/packages/node_modules/@cerebral/inferno)

## JSX

Inferno has its own [JSX Babel plugin](https://github.com/trueadm/babel-plugin-inferno).

## Differences from React

- Inferno doesn't have a fully synthetic event system like React does. Inferno has a partially synthetic event system, instead opting to only delegate certain events (such as `onClick`).
- Inferno doesn't support React Native. Inferno was only designed for the browser/server with the DOM in mind.
- Inferno doesn't support legacy string refs, use `createRef` or callback `ref` API
- Inferno provides lifecycle events on functional components. This is a major win for people who prefer lightweight components rather than ES2015 classes.
- Inferno is able to use the React Dev Tools extensions for Chrome/Firefox/etc to provide the same level of debugging experience to the Inferno user via `inferno-devtools`.

## Differences from Preact

- Inferno has a partial synthetic event system, resulting in better performance via delegation of certain events.
- Inferno is *much* faster than Preact in rendering, updating and removing elements from the DOM. Inferno diffs against virtual DOM, rather than the real DOM (except when loading from server-side rendered content), which means it can make drastic improvements. Unfortunately, diffing against the real DOM has a 30-40% overhead cost in operations.
- Inferno fully supports controlled components for `input`/`select`/`textarea` elements. This prevents lots of edgecases where the virtual DOM is not the source of truth (it should always be). Preact pushes the source of truth to the DOM itself.
- Inferno provides lifecycle events on functional components. This is a major win for people who prefer lightweight components rather than ES2015 classes.

## Event System

Like React, Inferno also uses a light-weight synthetic event system in certain places (although both event systems differ massively). Inferno's event system provides highly efficient delegation and an event helper called [`linkEvent`](https://github.com/infernojs/inferno/blob/master/README.md#linkevent-package-inferno).

One major difference between Inferno and React is that Inferno does not rename events or change how they work by default. Inferno only specifies that events should be camel cased, rather than lower case. Lower case events will bypass
Inferno's event system in favour of using the native event system supplied by the browser. For example, when detecting changes on an `<input>` element, in React you'd use `onChange`, with Inferno you'd use `onInput` instead (the
native DOM event is `oninput`).

Available synthetic events are:
- `onClick`
- `onDblClick`
- `onFocusIn`
- `onFocusOut`
- `onKeyDown`
- `onKeyPress`
- `onKeyUp`
- `onMouseDown`
- `onMouseMove`
- `onMouseUp`
- `onTouchEnd`
- `onTouchMove`
- `onTouchStart`

### `linkEvent` (package: `inferno`)

`linkEvent()` is a helper function that allows attachment of `props`/`state`/`context` or other data to events without needing to `bind()` them or use arrow functions/closures. This is extremely useful when dealing with events in functional components. Below is an example:

```jsx
import { linkEvent } from 'inferno';

function handleClick(props, event) {
  props.validateValue(event.target.value);
}

function MyComponent(props) {
  return <div><input type="text" onClick={ linkEvent(props, handleClick) } /><div>;
}
```

This is an example of using it with ES2015 classes:


```jsx
import { linkEvent, Component } from 'inferno';

function handleClick(instance, event) {
  instance.setState({ data: event.target.value });
}

class MyComponent extends Component {
  render () {
    return <div><input type="text" onClick={ linkEvent(this, handleClick) } /><div>;
  }
}
```

`linkEvent()` offers better performance than binding an event in a class constructor and using arrow functions, so use it where possible.


## Controlled Components

In HTML, form elements such as `<input>`, `<textarea>`, and `<select>` typically maintain their own state and update it based on user input.
In Inferno, mutable state is typically kept in the state property of components, and only updated with `setState()`.

We can combine the two by making the Inferno state be the "single source of truth". Then the Inferno component that renders a form also
controls what happens in that form on subsequent user input. An input form element whose value is controlled by
Inferno in this way is called a "controlled component".

## Inferno Top-Level API

### `render` (package: `inferno`)

```javascript
import { render } from 'inferno';

render(<div />, document.getElementById("app"));
```

Render a virtual node into the DOM in the supplied container given the supplied virtual DOM. If the virtual node was previously rendered
into the container, this will perform an update on it and only mutate the DOM as necessary, to reflect the latest Inferno virtual node.

Warning: If the container element is not empty before rendering, the content of the container will be overwritten on the initial render.

### `createRenderer` (package: `inferno`)

`createRenderer` creates an alternative render function with a signature matching that of the first argument passed to a reduce/scan function. This allows for easier integration with reactive programming libraries, like [RxJS](https://github.com/ReactiveX/rxjs) and [Most](https://github.com/cujojs/most).

```javascript
import { createRenderer } from 'inferno';
import { scan, map } from 'most';

const renderer = createRenderer();


// NOTE: vNodes$ represents a stream of virtual DOM node updates
scan(renderer, document.getElementById("app"), vNodes$);
```

See [inferno-most-fp-demo](https://github.com/joshburgess/inferno-most-fp-demo) for an example of how to build an app architecture around this.

### `createElement` (package: `inferno-create-element`)

Creates an Inferno VNode using a similar API to that found with React's `createElement()`

```javascript
import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';

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

render(
  createElement(BasicComponent, { title: 'abc' }),
  document.getElementById("app")
);
```

### `Component` (package: `inferno`)

**Class component:**

```javascript
import { Component } from 'inferno';

class MyComponent extends Component {
  render() {
    ...
  }
}
```

This is the base class for Inferno Components when they're defined using ES6 classes.

**Functional component:**

```javascript
const MyComponent = ({ name, age }) => (
  <span>My name is: { name } and my age is: {age}</span>
);
```

Another way of using defaultHooks.
```javascript
export function Static() {
    return <div>1</div>;
}

Static.defaultHooks = {
    onComponentShouldUpdate() {
        return false;
    }
};
```

Default props
```jsx


```

Functional components are first-class functions where their first argument is the `props` passed through from their parent.

### `createVNode` (package: `inferno`)
```js
import { createVNode } from 'inferno';

createVNode(
  flags,
  type,
  [className],
  [...children],
  [childFlags],
  [props],
  [key],
  [ref]
)
```

createVNode is used to create html element's virtual node object. Typically `createElement()` (package: `inferno-create-element`), `h()` (package: `inferno-hyperscript`) or JSX are used to create
`VNode`s for Inferno, but under the hood they all use `createVNode()`. Below is an example of `createVNode` usage:

```javascript
import { VNodeFlags, ChildFlags } from 'inferno-vnode-flags';
import { createVNode, createTextVNode, render } from 'inferno';

const vNode = createVNode(VNodeFlags.HtmlElement, 'div', 'example', createTextVNode('Hello world!'), ChildFlags.HasVNodeChildren);

// <div class="example">Hello world!</div>

render(vNode, container);
```

`createVNode` arguments explained:

`flags`: (number) is a value from [`VNodeFlags`](https://github.com/infernojs/inferno/tree/master/packages/inferno-vnode-flags), this is a numerical value that tells Inferno what the VNode describes on the page.

`type`: (string) is tagName for element for example 'div'

`className`: (string) is the class attribute ( it is separated from props because it is the most commonly used property )

`children`: (vNode[]|vNode) is one or array of vNodes to be added as children for this vNode

`childFlags`: (number) is a value from [`ChildFlags`](https://github.com/infernojs/inferno/tree/master/packages/inferno-vnode-flags), this tells inferno shape of the children so normalization process can be skipped.

`props`: (Object) is object containing all other properties. fe: `{onClick: method, 'data-attribute': 'Hello Community!}`

`key`: (string|number) unique key within this vNodes siblings to identify it during keyed algorithm.

`ref`: (function) callback which is called when DOM node is added/removed from DOM.


### `createComponentVNode` (package: 'inferno')
```js
import { createComponentVNode } from 'inferno';

createComponentVNode(
  flags,
  type,
  [props],
  [key],
  [ref]
)
```

createComponentVNode is used for creating vNode for Class/Functional Component.

Example:
```javascript
import { VNodeFlags, ChildFlags } from 'inferno-vnode-flags';
import { createVNode, createTextVNode, createComponentVNode, render } from 'inferno';

function MyComponent(props, context) {
  return createVNode(VNodeFlags.HtmlElement, 'div', 'example', createTextVNode(props.greeting), ChildFlags.HasVNodeChildren);
}

const vNode = createComponentVNode(VNodeFlags.ComponentFunction, MyComponent, {
  greeting: 'Hello Community!'
}, null, {
  onComponentDidMount() {
    console.log("example of did mount hook!")
  }
})

// <div class="example">Hello Community!</div>

render(vNode, container);
```


`createComponentVNode` arguments explained:

`flags`: (number) is a value from [`VNodeFlags`](https://github.com/infernojs/inferno/tree/master/packages/inferno-vnode-flags), this is a numerical value that tells Inferno what the VNode describes on the page.

`type`: (Function/Class) is the class or function prototype for Component

`props`: (Object) properties passed to Component, can be anything

`key`: (string|number) unique key within this vNodes siblings to identify it during keyed algorithm.

`ref`: (Function|Object) this property is object for Functional Components defining all its lifecycle methods. For class Components this is function callback for ref.



### `createTextVNode` (package: 'inferno')

createTextVNode is used for creating vNode for text nodes.

`createTextVNode` arguments explained:
text: (string) is a value for text node to be created.
key: (string|number) unique key within this vNodes siblings to identify it during keyed algorithm.

```js
import { createTextVNode } from 'inferno';

createTextVNode(
  text,
  key
)
```


### `cloneVNode` (package: `inferno-clone-vnode`)

This package has same API as React.cloneElement

```javascript
import {cloneVNode} from 'inferno-clone-vnode';

cloneVNode(
  vNode,
  [props],
  [...children]
)
```

Clone and return a new Inferno `VNode` using a `VNode` as the starting point. The resulting `VNode` will have the original `VNode`'s props with the new props merged in shallowly. New children will replace existing children. key and ref from the original `VNode` will be preserved.

`cloneVNode()` is almost equivalent to:
```jsx
<VNode.type {...VNode.props} {...props}>{children}</VNode.type>
```

An example of using `cloneVNode`:

```javascript
import { cloneVNode, createVNode, render } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

const vNode = createVNode(VNodeFlags.HtmlElement, 'div', 'example', 'Hello world!');
const newVNode = cloneVNode(vNode, { id: 'new' }); // we are adding an id prop to the VNode

render(newVNode, container);
```

If you're using JSX:

```jsx
import { render, cloneVNode } from 'inferno';

const vNode = <div className="example">Hello world</div>;
const newVNode = cloneVNode(vNode, { id: 'new' }); // we are adding an id prop to the VNode

render(newVNode, container);
```

### `createPortal` (package: 'inferno')

HTML:
```html
<div id="root"></div>
<div id="outside"></div>
```

Javascript:
```jsx
const { render, Component, version, createPortal } from 'inferno';

function Outsider(props) {
	return <div>{`Hello ${props.name}!`}</div>;
}

const outsideDiv = document.getElementById('outside');
const rootDiv = document.getElementById('root');

function App() {
	return (
  	    <div>
    	    Main view
            ...
            {createPortal(<Outsider name="Inferno" />, outsideDiv)}
        </div>
    );
}


// render an instance of Clock into <body>:
render(<App />, rootDiv);
```

Results into:
```html
<div id="root">
    <div>Main view ...</div>
</div>
<div id="outside">
    <div>Hello Inferno!</div>
</div>
```
Cool huh? Updates (props/context) will flow into "Outsider" component from the App component the same way as any other Component.
For inspiration on how to use it click [here](https://hackernoon.com/using-a-react-16-portal-to-do-something-cool-2a2d627b0202)!

### `createRef` (package: `inferno`)

createRef API provides shorter syntax than callback ref when timing of element is not needed.

```jsx
import { Component, render, createRef } from 'inferno';

class Foobar extends Component {
  constructor(props) {
    super(props);

    // Store reference somewhere
    this.element = createRef(); // Returns object {current: null}
  }

  render() {
    return (
      <div>
        <span id="span" ref={this.element}>
          Ok
        </span>
      </div>
    );
  }
}

render(<Foobar />, container);
```


### `createFragment` (package: `inferno`)

createFragment is the native way to createFragment vNode. `createFragment(children: any, childFlags: ChildFlags, key?: string | number | null)`

`createFragment` arguments explained:

`children`: (Array) Content of fragment vNode, typically array of VNodes

`childFlags`: (number) is a value from [`ChildFlags`](https://github.com/infernojs/inferno/tree/master/packages/inferno-vnode-flags), this tells inferno shape of the children so normalization process can be skipped.

`key`: (string|number) unique key within this vNodes siblings to identify it during keyed algorithm.


Alternative ways to create fragment vNode are:

- Using JSX `<> ... </>`, `<Fragment> .... </Fragment>` or `<Inferno.Fragment> ... </Inferno.Fragment>`
- Using createElement API `createElement(Inferno.Fragment, {key: 'test'}, ...children)`
- Using hyperscript API `h(Inferno.Fragment, {key: 'test'}, children)`


In the below example both fragments are identical except they have different key
```jsx
import { Fragment, render, createFragment } from 'inferno';
import { ChildFlags } from 'inferno-vnode-flags';

function Foobar() {
    return (
      <div $HasKeyedChildren>
        {createFragment(
            [<div>Ok</div>, <span>1</span>],
            ChildFlags.HasNonKeyedChildren,
            'key1'
        )}
        <Fragment key="key2">
          <div>Ok</div>
          <span>1</span>
        </Fragment>
      </div>
    );
}

render(<Foobar />, container);
```


### `forwardRef` (package: `inferno`)

forwardRef is a new mechanism to "forward" ref inside a functional Component.
It can be useful if you have simple functional Components and you want to create reference to a specific element inside it.

```jsx
import { forwardRef, Component, render } from 'inferno';

const FancyButton = forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

class Hello extends Component {
  render() {
    return (
      <FancyButton
        ref={btn => {
          if (btn) {
            // btn variable is the button rendered from FancyButton
          }
        }}
      >
        Click me!
      </FancyButton>
    );
  }
}

render(<Hello />, container);
```

### `hydrate` (package: `inferno-hydrate`)

```javascript
import { hydrate } from 'inferno-hydrate';

hydrate(<div />, document.getElementById("app"));
```

Same as `render()`, but is used to hydrate a container whose HTML contents were rendered by `inferno-server`. Inferno will attempt to attach event listeners to the existing markup.

### `options.componentComparator` ( package `inferno`) DEV only

This option can be used during **development** to create custom component comparator method.
This option will be called on every Component update.
It gets two parameters: lastVNode and nextVNode. When it returns `true` lastVNode will be replaced with nextVNode.
If anything else than `true` is returned it falls to normal behavior.

```javascript
import {options} from 'inferno';

options.componentComparator = function (lastVNode, nextVNode) {
    /* custom logic */
    return true; // Replaces lastVNode with nextVNode
}
```

### `findDOMNode` (package: `inferno-extras`)
This feature has been moved from inferno to inferno-compat in v6. No options are needed anymore.

Note: we recommend using a `ref` callback on a component to find its instance, rather than using `findDOMNode()`. `findDOMNode()` cannot be used on functional components.

If a component has been mounted into the DOM, this returns the corresponding native browser DOM element. This method is useful for reading values out of the DOM, such as form field values and performing DOM measurements.
In most cases, you can attach a ref to the DOM node and avoid using `findDOMNode()` at all. When render returns null or false, `findDOMNode()` returns null.
If Component has rendered fragment it returns the first element.

### Inferno Flags (package: inferno-vnode-flags)

**VNodeFlags:**
- `VNodeFlags.HtmlElement`
- `VNodeFlags.ComponentUnknown`
- `VNodeFlags.ComponentClass`
- `VNodeFlags.ComponentFunction`
- `VNodeFlags.Text`
- `VNodeFlags.SvgElement`
- `VNodeFlags.InputElement`
- `VNodeFlags.TextareaElement`
- `VNodeFlags.SelectElement`
- `VNodeFlags.Void`
- `VNodeFlags.Portal`
- `VNodeFlags.ReCreate` (JSX **$ReCreate**) always re-creates the vNode
- `VNodeFlags.ContentEditable`
- `VNodeFlags.Fragment`
- `VNodeFlags.InUse`
- `VnodeFlags.ForwardRef`
- `VNodeFlags.Normalized`

**VNodeFlags Masks:**
- `VNodeFlags.ForwardRefComponent` Functional component wrapped in forward ref
- `VNodeFlags.FormElement` - Is form element
- `VNodeFlags.Element` - Is vNode element
- `VNodeFlags.Component` - Is vNode Component
- `VNodeFlags.DOMRef` - Bit set when vNode holds DOM reference
- `VNodeFlags.InUseOrNormalized` - VNode is used somewhere else or came from normalization process
- `VNodeFlags.ClearInUseNormalized` - Opposite mask of InUse or Normalized


**ChildFlags**
- `ChildFlags.UnknownChildren` needs Normalization
- `ChildFlags.HasInvalidChildren` is invalid (null, undefined, false, true)
- `ChildFlags.HasVNodeChildren` (JSX **$HasVNodeChildren**) is single vNode (Element/Component)
- `ChildFlags.HasNonKeyedChildren` (JSX **$HasNonKeyedChildren**) is Array of vNodes non keyed (no nesting, no holes)
- `ChildFlags.HasKeyedChildren` (JSX **$HasKeyedChildren**) is Array of vNodes keyed (no nesting, no holes)
- `ChildFlags.HasTextChildren` (JSX **$HasTextChildren**) vNode contains only text

**ChildFlags Masks**
- `ChildFlags.MultipleChildren` Is Array


### `renderToString` (package: `inferno-server`)

```javascript
import { renderToString } from 'inferno-server';

const string = renderToString(<div />);
```

Render a virtual node into an HTML string, given the supplied virtual DOM.

## Functional component lifecycle events

| Name                      | Triggered when                                                  | Arguments to callback           |
| -----------               | --------------                                                  | -----------------------         |
| `onComponentWillMount`    | a functional component is about to mount                        |                                 |
| `onComponentDidMount`     | a functional component has mounted successfully                 | `domNode`                       |
| `onComponentShouldUpdate` | a functional component has been triggered to update             | `lastProps, nextProps`          |
| `onComponentWillUpdate`   | a functional component is about to perform an update            | `lastProps, nextProps`          |
| `onComponentDidUpdate`    | a functional component has performed an update                  | `lastProps, nextProps`          |
| `onComponentWillUnmount`  | a functional component is about to be unmounted                 | `domNode`                       |

## Class component lifecycle events

All these Component lifecycle methods ( including `render` and `setState - callback`) are called with Component instance context. You don't need to "bind" these methods.

| Name                              | Triggered when                                                                        | Arguments to callback           |
| -----------                       | --------------                                                                        | -----------------------         |
| `componentDidMount`               | component has been mounted successfully                                                |                                 |
| `componentWillMount`              | component is about to mount                                                           |                                 |
| `componentWillReceiveProps`       | before render when component updates                                                  | `nextProps, context`            |
| `shouldComponentUpdate`           | component has been triggered to update                                                | `nextProps, nextState`          |
| `componentWillUpdate`             | component is about to perform an update                                               | `nextProps, nextState, context` |
| `componentDidUpdate`              | component has performed an update                                                     | `lastProps, lastState, snapshot`|
| `componentWillUnmount`            | component is about to be unmounted                                                    |                                 |
| `getChildContext`                 | before render method, return value object is combined to sub tree context             |                                 |
| `getSnapshotBeforeUpdate`         | before component updates, return value is sent to componentDidUpdate as 3rd parameter | `lastProps, lastState`          |
| `static getDerivedStateFromProps` | before render method                                                                  | `nextProps, state`              |

### Using functional lifecycle events

Functional lifecycle events must be explicitly assigned via props onto a functional component like shown below:

```javascript
import { render } from 'inferno';

function mounted(domNode) {
  // [domNode] will be available for DOM nodes and components (if the component has mounted to the DOM)
}

function FunctionalComponent({ props }) {
  return <div>Hello world</div>;
}

render(
  <FunctionalComponent onComponentDidMount={ mounted } />,
  document.getElementById("app")
);
```

Please note: class components (ES2015 classes) from `inferno` **do not** support the same lifecycle events (they have their own lifecycle events that work as methods on the class itself).

## Development vs Production modes

By default, Inferno will run in development mode. Development mode provides extra checks and better error messages at the cost of slower performance and larger code to parse.
When using Inferno in a production environment, it is highly recommended that you turn off development mode.

### Running Inferno on Node JS

Ensure the environment variable `process.env.NODE_ENV` is set to `production`.

### Building Inferno for use in a browser

When running Inferno on the browser using Webpack or Rollup, a replacement will need to occur during your build.

#### Webpack

Use the following configuration in your Webpack build for production build:

```js
  ...
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
```

When you are building for development, you may want to use `inferno.dev.esm.js` ("dev:module": "dist/index.dev.esm.js",) file.
That build version has extra level of validation for development purposes. You can use it by adding following code to your webpack config.

```js
    ...
	resolve: {
    /* When doing development workflow we want to make sure webpack picks up development build of inferno */
		alias: {
			inferno: __dirname + "/node_modules/inferno/dist/index.dev.esm.js"
		}
	}
```

#### Rollup

Use the following configuration in your Rollup build:

```js
const replace = require('rollup-plugin-replace');
```

```js
  ...
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  ]
```

When you are building for development, you may want to use `inferno.dev.esm.js` ("dev:module": "dist/index.dev.esm.js",) file.
That build version has extra level of validation for development purposes. You can use it by adding following code to your rollup config.

```js
const alias = require('@rollup/plugin-alias');

    ...
  plugins: [
   alias({
       resolve: ['.js'],
       entries: [
         {find: 'inferno', replacement: __dirname + '/node_modules/inferno/dist/index.dev.esm.js'}
       ]
   }),
 ]

```

### Custom namespaces

Inferno always wants to deliver great performance. In order to do so, it has to make intelligent assumptions about the state of the DOM and the elements available to mutate. Custom namespaces conflict with this idea and change the schema of how different elements and attributes might work, so Inferno makes no attempt to support namespaces. Instead, SVG namespaces are automatically applied to elements and attributes based on their `tag name`.

## Community

There is an [Inferno Slack](https://infernojs.slack.com). You can join via [inferno-slack.herokuapp.com](https://inferno-slack.herokuapp.com).


### Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/infernojs/inferno/graphs/contributors"><img src="https://opencollective.com/inferno/contributors.svg?width=890" /></a>


### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/inferno#backer)]

<a href="https://opencollective.com/inferno#backers" target="_blank"><img src="https://opencollective.com/inferno/backers.svg?width=890"></a>


### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/inferno#sponsor)]

<a href="https://opencollective.com/inferno/sponsor/0/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/1/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/2/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/3/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/4/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/5/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/6/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/7/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/8/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/inferno/sponsor/9/website" target="_blank"><img src="https://opencollective.com/inferno/sponsor/9/avatar.svg"></a>

