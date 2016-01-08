# Inferno-server
> Inferno package for working with the server

This package serves as the entry point of the Server-related rendering paths. It is intended to be paired with the isomorphic Inferno, which will be shipped as inferno to npm.

## Install

```
npm install inferno inferno-server
```

## Contents

* renderToString

## Usage

```
const template = Inferno.createTemplate(() => ({
	tag: 'div'
}));

InfernoServer.renderToString(template());
```

