# inferno-compat

This module is a compatibility layer that makes React-based modules work with Inferno, without any code changes.

It provides the same exports as `react` and `react-dom`, meaning you can use your build tool of choice to drop it in where React is being depended on.

Do note however, as with almost all compatability layer libraries, there is an associated cost of extra overhead. As such, you should never expect native Inferno performance when using `inferno-compat`.

## How to install?

```bash
npm install --save inferno@beta24
npm install --save inferno-compat@beta24
```

## What is currently supported?

### `react`

- `React.createClass`
- `React.createElement`
- `React.cloneElement`
- `React.Component`
- `React.PureComponent`
- `React.PropTypes`
- `React.Children`
- `React.isValidElement`

Note: Inferno will not currently validate `PropTypes`

### `react-dom`

- `ReactDOM.render`
- `ReactDOM.unmountComponentAtNode`
- `ReactDOM.findDOMNode`

### `react-dom/server`

- `ReactServer.renderToString`
- `ReactServer.renderToStaticMarkup`

## What is missing?

These features will hopefully be added in future versions

### `react`

- `React.DOM`
- `React.createFactory`

## Usage with Webpack

Using `inferno-compat` with Webpack is easy.

All you have to do is add an alias for `react` and `react-dom`:

```js
{
	resolve: {
		alias: {
			'react': 'inferno-compat',
			'react-dom': 'inferno-compat',
            'react-dom/server': 'inferno-compat',
		}
	}
}
```

If you plan on using the Inferno JSX module `babel-plugin-inferno`, you must also apply the following:

```js
{
    plugins: [
        new webpack.ProvidePlugin({
            'Inferno': 'react'
        })
    ]
}
```

Using `babel-plugin-inferno` with `inferno-compat` can provide much better performance at the cost of having less compatability.

## Usage with Babel

Install the Babel plugin for module aliasing: `npm install --save-dev babel-plugin-module-resolver`.

Babel can now alias `react` and `react-dom` to `inferno` by adding the following to your `.babelrc` file:

```js
{
    "plugins": [
        ["module-resolver", {
        "root": ["."],
        "alias": {
            "react": "inferno-compat",
            "react-dom": "inferno-compat"
        }
        }]
    ]
}
```

Please note, this method may not allow for usage of `babel-plugin-inferno`.

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
            "react-dom": "inferno-compat",
            "react-dom/server": "inferno-compat",
            'inferno': 'inferno-compat' // for usage of babel-plugin-inferno
        }
    }
    // ...
}
```

Be sure to install `rc-css-transition-group` with `npm install --save rc-css-transition-group`.

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
