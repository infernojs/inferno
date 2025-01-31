# inferno-compat

This module is a compatibility layer that makes React-based modules work with Inferno, without any code changes.

It provides the same exports as `react` and `react-dom`, meaning you can use your build tool of choice to drop it in where React is being depended on.

Do note however, as with almost all compatability layer libraries, there is an associated cost of extra overhead. As such, you should never expect native Inferno performance when using `inferno-compat`.

You might not always need the `inferno-compat` package. Just the alias to Inferno might be enough.

**Inferno-compat** adds the following features:

As in React:

- ClassName is copied to props
- Children is copied to props (for html vNodes too)
- styles are converted from camelCase to hyphen-case runtime. You can turn off this feature by setting: `options.reactStyles = false;`
- Empty props are always created for element vNodes
- You can create Components based on string
- `findDOMNOde` -method is available
- Iterable data structures are supported
- `Children.(map/forEach/count/only/toArray)` - methods are available
- Html properties are transformed to inferno compatible format
- Some form events (fe: onChange) are transformed to native alternative
- PureComponent is available
- `unstable_renderSubtreeIntoContainer` - method is available
- `DOM` - factory is available
- `unmountComponentAtNode` - method is available its same as "render(null, container)"

## How to install?

Inferno-compat does not automatically install all its features. For example: If you need createElement support you should also install `inferno-create-element`.

All packages:

```
npm install --save inferno
npm install --save inferno-compat
npm install --save inferno-clone-vnode
npm install --save inferno-create-element

```

If you use React/lib/ReactCSSTransitionGroup.ts

install `inferno-transition-group` package.

If you use React/lib/ReactCSSTransitionGroup.ts

install `rc-css-transition-group-modern` package.

## What is currently supported?

### `react`

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
- `ReactDOM.hydrate`
- `ReactDOM.unmountComponentAtNode`
- `ReactDOM.findDOMNode`
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
			'react-dom': 'inferno-compat'
		}
	}
}
```

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
    a: React.PropTypes.string.isRequired,
  };
  render() {
    let { a, b, children } = this.props;
    return <div {...{ a, b }}>{children}</div>;
  }
}

ReactDOM.render(<Foo a="a">test</Foo>, document.getElementById('app'));
```
