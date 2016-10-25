---
title: Get Started
next: /get-started/installation
---

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
