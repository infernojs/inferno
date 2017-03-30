# inferno-create-class
> Provides a helper to create Inferno Components without needing ES2015

Note: this is similar to `React.createClass` in that methods are out-bound. However, this module does not support mixins.

## Install

```
npm install inferno-create-class
```

## Usage

```js
var createClass = require('inferno-create-class');
var Inferno = require('inferno');
var InfernoDOM = require('inferno-dom');

var MyComponent = createClass({
	displayName: 'MyComponent',
	render: function() {
		return <div>Hell world!</div>;
	}
});

InfernoDOM.render(<MyComponent />, container);
```



