# inferno-dom
> Inferno package for working with the DOM

This package serves as the entry point of the DOM-related rendering paths. It is intended to be paired with the isomorphic Inferno, which will be shipped as inferno to npm.

## Install

```
npm install inferno inferno-dom
```

## Contents

* render
* findDOMNode
* createRenderer

## Usage

```js
import Inferno from 'inferno';
import InfernoDOM from 'inferno-dom';
import { from } from 'most';

// render
InfernoDOM.render(<div>Hello world</div>, container);

// createRenderer
const vNodes$ = from([<div />, <div />]);

scan(renderer, container, vNodes$);
```



