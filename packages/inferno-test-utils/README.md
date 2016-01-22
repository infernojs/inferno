# inferno-test-utils
> Inferno package for helping write good tests for Inferno

This package serves as a small set of test addons that help people build Inferno applications with good tests.

## Install

```
npm install inferno inferno-test-utils
```

## Contents

* shallowRender
* deepRender
* renderIntoDocument

## Usage

```
const template = Inferno.createTemplate(() => ({
	tag: 'div'
}));

const output = InfernoTestUtils.shallowRender(template());
```

