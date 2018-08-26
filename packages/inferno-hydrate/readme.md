# inferno-hydrate
Same as `render()`, but is used to hydrate a container whose HTML contents were rendered by `Inferno-server`. Inferno will attempt to attach event listeners to the existing markup.

## Install

```
npm install inferno-hydrate
```

## Usage

```js
import { hydrate } from 'inferno-hydrate';

hydrate(
  createElement('div', { className: 'test' }, "I'm a child!"),
  document.getElementById("app")
);
```
