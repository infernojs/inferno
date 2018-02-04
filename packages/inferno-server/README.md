# inferno-server
> Inferno package for working with the server

This package serves as the entry point of the Server-related rendering paths. It is intended to be paired with the isomorphic Inferno, which will be shipped as inferno to npm.

## Install

```
npm install inferno inferno-server
```

## Contents

* renderToString
* RenderQueueStream
* RenderStream
* renderToStaticMarkup
* renderToString
* streamAsStaticMarkup
* streamAsString
* streamQueueAsStaticMarkup
* streamQueueAsString

## Usage

```js
import { renderToString } from 'inferno-server';

renderToString(<div>Hello world</div>, container);
```

