---
title: Inferno Compat
---

We understand that a lof of users will be migrating from React and might be using external dependencies which will depend on React. To get around this issue we have created `inferno-compat` which is designed to be a replacement for React within your code. 

## Compatibility Table

It provides a similar API to React, but is not complete.  

| Package     | API                      | Supported |
| ----------- | ------------------------ | --------- |
| React       | Children                 | √
| React       | cloneElement             | √
| React       | Component                | √
| React       | createClass              | √
| React       | createElement            | √ 
| React       | createFactory            | x
| React       | DOM                      | x
| React       | isValidElement           | √
| React       | PropTypes                | √
| ----------- | ------------------------ | ---------- |
| ReactDOM    | render                   | √
| ReactDOM    | findDOMNode              | √ 
| ReactDOM    | unmountComponentAtNode   | √
| ----------- | ------------------------ | ---------- |
| ReactServer | renderToString           | √
| ReactServer | renderToStaticMarkup     | √

## Usage
`inferno-compat` works seamlessly with [Webpack](//webpackjs.org) and [Browserify](//Browserify.com). Simply install using 

```sh
npm install inferno-compat --save
```

and alias the package within your configuration your dependency manager. 

### Alias with Webpack 

Using `inferno-compat` with Webpack is easy. Simply alias the packages in the resolve section of your `webpack.config`:

```js
{
  // ...
	resolve: {
		alias: {
			'react': 'inferno-compat',
			'react-dom': 'inferno-compat',
            'react-dom/server': 'inferno-compat',
		}
	}
  // ...
}
```

### Alias with Browserify
Using `inferno-compat` with Browserify requires the [aliasify package](//npm.im/aliasify). Once installed you can configure aliasify in your `package.json` to alias `react` to `inferno`: 

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

### Once Aliased 

Once your have the alias setup within your configurations then you can continue working with React components just like before:

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
