# Inferno-dom
> Inferno package for working with the DOM

This package serves as the entry point of the DOM-related rendering paths. It is intended to be paired with the isomorphic Inferno, which will be shipped as inferno to npm.

## Install

```
npm install inferno inferno-dom
```

## Contents

* createRef
* render

## Usage

```
const template = Inferno.createTemplate(() => ({
	tag: 'div'
}));

InfernoDOM.render(template(), container);
```



