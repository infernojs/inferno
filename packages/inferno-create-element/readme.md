# inferno-create-element
> Inferno package with helpers to create Inferno elements

## Install

```
npm install inferno-create-element
```

## Usage

```js
import { createElement } from 'inferno-create-element';
import { render } from 'inferno';

render(
  createElement('div', { className: 'test' }, "I'm a child!"),
  document.getElementById("app")
);
```
