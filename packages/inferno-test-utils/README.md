# inferno-test-utils
> Inferno package for helping write good tests for Inferno

This package serves as a small set of test addons that help people build Inferno applications with good tests.

## Install

```
npm install inferno inferno-test-utils
```

## Contents

* renderIntoDocument

## Usage

```js
import Inferno from 'inferno';
import { renderIntoDocument } from 'inferno-test-utils';

const output = renderIntoDocument(<div>Hello world</div>);
```
