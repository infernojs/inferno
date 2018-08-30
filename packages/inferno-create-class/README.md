# inferno-create-class
> Provides a helper to create Inferno Components without needing ES2015

Warning: This package will `.bind` all class methods to its instance!
We recommend using ES2015 classes and transpiling them with babel or typescript.

This package was implemented to provide alternative for old `React.createClass`.

## Install

```
npm install inferno-create-class
```

## Usage

```js
import { createClass } from 'inferno-create-class';
import { render } from 'inferno';

const MyComponent = createClass({
	displayName: 'MyComponent',
	render: function() {
		return <div>Hello, world!</div>;
	}
});

render(<MyComponent />, container);
```



