# ieee754 [![travis](https://img.shields.io/travis/feross/ieee754.svg)](https://travis-ci.org/feross/ieee754) [![npm](https://img.shields.io/npm/v/ieee754.svg)](https://npmjs.org/package/ieee754) [![downloads](https://img.shields.io/npm/dm/ieee754.svg)](https://npmjs.org/package/ieee754)

### Read/write IEEE754 floating point numbers from/to a Buffer or array-like object.

[![testling badge](https://ci.testling.com/feross/ieee754.png)](https://ci.testling.com/feross/ieee754)

## install

```
npm install ieee754
```

## methods

`var ieee754 = require('ieee754')`

The `ieee754` object has the following functions:

```
ieee754.read = function (buffer, offset, isLE, mLen, nBytes)
ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes)
```

The arguments mean the following:

- buffer = the buffer
- offset = offset into the buffer
- value = value to set (only for `write`)
- isLe = is little endian?
- mLen = mantissa length
- nBytes = number of bytes

## what is ieee754?

The IEEE Standard for Floating-Point Arithmetic (IEEE 754) is a technical standard for floating-point computation. [Read more](http://en.wikipedia.org/wiki/IEEE_floating_point).

## mit license

Copyright (C) 2013 [Feross Aboukhadijeh](http://feross.org) & Romain Beauxis.
