#is-nan <sup>[![Version Badge][2]][1]</sup>

[![Build Status][3]][4] [![dependency status][5]][6] [![dev dependency status][7]][8]

[![npm badge][11]][1]

[![browser support][9]][10]

ES6-compliant shim for Number.isNaN - the global isNaN returns false positives.

## Example

```js
Number.isNaN = require('is-nan');
var assert = require('assert');

assert.notOk(Number.isNaN(undefined));
assert.notOk(Number.isNaN(null));
assert.notOk(Number.isNaN(false));
assert.notOk(Number.isNaN(true));
assert.notOk(Number.isNaN(0));
assert.notOk(Number.isNaN(42));
assert.notOk(Number.isNaN(Infinity));
assert.notOk(Number.isNaN(-Infinity));
assert.notOk(Number.isNaN('foo'));
assert.notOk(Number.isNaN(function () {}));
assert.notOk(Number.isNaN([]));
assert.notOk(Number.isNaN({}));

assert.ok(Number.isNaN(NaN));
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[1]: https://npmjs.org/package/is-nan
[2]: http://vb.teelaun.ch/ljharb/is-nan.svg
[3]: https://travis-ci.org/ljharb/is-nan.png
[4]: https://travis-ci.org/ljharb/is-nan
[5]: https://david-dm.org/ljharb/is-nan.png
[6]: https://david-dm.org/ljharb/is-nan
[7]: https://david-dm.org/ljharb/is-nan/dev-status.png
[8]: https://david-dm.org/ljharb/is-nan#info=devDependencies
[9]: https://ci.testling.com/ljharb/is-nan.png
[10]: https://ci.testling.com/ljharb/is-nan
[11]: https://nodei.co/npm/is-nan.png?downloads=true&stars=true

