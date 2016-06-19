# inferno-server
> Inferno package for working with the server

This package serves as the entry point of the Server-related rendering paths. It is intended to be paired with the isomorphic Inferno, which will be shipped as inferno to npm.

## Install

```
npm install inferno inferno-server
```

## Contents

* renderToString

## Usage

```js
import Inferno from 'inferno';
import InfernoServer from 'inferno-server';

InfernoServer.renderToString(<div>Hello world</div>, container);
```

