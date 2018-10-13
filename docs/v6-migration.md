#### V6 Breaking changes:

## Hydration, re-using SSR on client side

> Shortly:
>
> `hydrate` moved to `inferno-hydrate` package
>


Not all applications need server side rendering, so hydration functionality has been moved to `inferno-hydrate` package.
Inferno render will no longer try to re-use server side rendered HTML automatically.
If you want to hydrate (render existing html) you need to install `inferno-hydrate` package
and call hydrate on first render.

```jsx
import { render } from 'inferno';
import { hydrate } from 'inferno-hydrate';

// First time client is loaded, FE:

document.addEventListener('DOMContentLoaded', function(e) {
    const element = document.getElementById('app');

    hydrate(<App data={initialData} />, element);

    // Future updates should use render
    render(<App data={newData} />, element);
});
```

## Style property names changed

> Shortly:
>
> `backgroundColor` becomes `background-color`
>
> `top: 10` becomes `top: "10px"`
>

To support the latest style API inferno needs to set styles using `dom.style.setProperty()`.
This change adds support for inline CSS variables and if browser vendors add new parameters its easier to extend.

There used to be a list of hardcoded properties which Inferno detected and automatically added `px` suffix to, when value was numeric.
Inferno will no longer get between application input and setting style property. When you set `top: 1` you get `<div style="top: 1"></div>`

Unlike React, inferno has always supported setting styles using string. This API is now unified with object literal API.
It supports the same features and uses the same syntax.

```jsx
<div style="background-color: green; top: 10;"></div>
// equals
<div style={{"background-color": "green", top: 10}}></div>
```

`inferno-compat` still uses the same old way and transpiles property names runtime to InfernoJS equivalents.
If you don't need camelCase styles you can disable this runtime using Inferno.options API.

```jsx
import {options} from 'inferno-compat';

// Disabling reactStyles uses native CSS syntax
options.reactStyles = false;
```

## JSX plugin requires Babel 7

To support JSX Fragment syntax, [babel-plugin-inferno](https://github.com/infernojs/babel-plugin-inferno) now depends on
[babel v7](https://babeljs.io/blog/2018/08/27/7.0.0).

## Lifecycle changes

`setState` lifecycle has been changed to be compatible with ReactJS flow.
Also `componentDidUpdate` will now trigger later in lifecycle chain, after refs have been creted.
See: https://github.com/infernojs/inferno/issues/1286


## Changes in VNode properties

#### `dom` not always populated

Supporting fragments complicates vNode structure and `dom` property is no longer populated
to Components or Fragments. There is [inferno-extras](https://github.com/infernojs/inferno/tree/master/packages/inferno-extras) package which contains helper functions to get DOM node.

```jsx
import { Component } from 'inferno';
import { findDOMNode } from 'inferno-extras';

class Example extends Component {

    componentDidMount() {
        // element equals "<div>Okay</div>"
        const element = findDOMNode(this);
    }

    render() {
        return <div>Okay</div>;
    }
}

```

#### `parentVNode` removed

There used to be reference to `parentVNode` from Component vNodes due to technical difficulties of changing Component roots.
This issue has been now resolved and `parentVNode` references have been removed.


#### single textVNodes are no longer inside another VNode

In Inferno v5 vNode elements that had text children had the following structure.
V6 adds new optimization paths for text children.

```jsx
const vNode = <div>Hello</div>

// children property now holds the string
vNode.children === 'Hello';
```

## Component properties removed

All Component properties which start with `$` are considered private and their behavior can change in minor versions.

- `$V` has been removed. no work around available.
- `$P` has been removed. use `findDOMNode(this).parentNode`


## Inferno-server

Inferno server no longer adds comment tags to separate single text children.
Make sure client and server use the same version SSR v6 needs client v6.

## Legacy String refs removed

Inferno no longer supports legacy string refs at all. They are not supported through `inferno-compat` either.
You can use callback refs, createRef API or forward Refs.
