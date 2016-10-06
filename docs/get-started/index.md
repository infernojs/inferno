---
title: Get Started
permalink: /get-started
---

## Installation

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
