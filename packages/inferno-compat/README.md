# inferno-compat

This module is a compatibility layer that makes React-based modules work with Inferno, without any code changes.

It provides the same exports as `react` and `react-dom`, meaning you can use your build tool of choice to drop it in where React is being depended on.

## What is currently supported?

### `react`

- `React.createElement`
- `React.cloneElement`
- `React.Component`
- `React.PropTypes`
- `React.Component`

Note: Inferno will not currently validate `PropTypes`

### `react-dom`

- `ReactDOM.render`
- `ReactDOM.unmountComponentAtNode`

## What is missing?

These features will hopefully be added in future versions

### `react`

- `React.createClass`
- `React.DOM`
- `React.createFactory`
- `React.Children`
- `React.isValidElement`

### `react-dom`

- `ReactDOM.findDOMNode`

## Usage with Webpack

Using `inferno-compat` with Webpack is easy.

All you have to do is add an alias for `react` and `react-dom`:

```js
{
	resolve: {
		alias: {
			'react': 'inferno-compat',
			'react-dom': 'inferno-compat'
		}
	}
}
```

## Usage with Browserify

Using `inferno-compat` with Browserify is as simple as installing and configuring [aliasify](http://npm.im/aliasify).

First, install it: `npm install --save-dev aliasify`

... then in your `package.json`, configure aliasify to alias `react` and `react-dom`:

```js
{
    // ...
    "aliasify": {
        "aliases": {
            "react": "inferno-compat",
            "react-dom": "inferno-compat"
        }
    }
    // ...
}
```

## Once Aliased

With the above Webpack or Browserify aliases in place, existing React modules should work nicely:

```js
import React from 'react';
import ReactDOM from 'react-dom';

class Foo extends React.Component {
    propTypes = {
        a: React.PropTypes.string.isRequired
    };
    render() {
        let { a, b, children } = this.props;
        return <div {...{a,b}}>{ children }</div>;
    }
}

ReactDOM.render((
    <Foo a="a">test</Foo>
), document.body);
```