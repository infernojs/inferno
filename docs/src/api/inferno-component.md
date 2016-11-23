---
title: Inferno Component
---

Inferno does not provide a stateful ES6 Component out of the box with the `inferno` package. Instead there is a separate package to maintain the ES6 Component. You can use the Inferno ES6 Component in exactly the same way as the React Component. It supports all our [lifecycle hooks]({{site.url}}/guides/lifecycle). 

## Get Started
To install the package run 
```sh
npm install inferno-component --save
```
from your command line, or add
```html
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/inferno/1.0.0/inferno-component.min.js"
    type="text/javascript"
  /><script>
```


## Example
```js
import Inferno, {
  render,
} from 'inferno';
import Component from 'inferno-component'

class YourAwesomeComponent extends Component 
  constructor(props, context) {
    super(props, context);

    this.setState( {
      
    })
  }

  