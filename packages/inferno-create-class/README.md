# inferno-create-class
> Provides a helper to create Inferno Components without needing ES2015

Note: this is similar to `React.createClass` in that methods are out-bound.

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
		return <div>Hell world!</div>;
	}
});

render(<MyComponent />, container);
```



