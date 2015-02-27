var Buffer = require('../../').Buffer
if (process.env.OBJECT_IMPL) Buffer.TYPED_ARRAY_SUPPORT = false
// var common = require('../common');
var assert = require('assert');

// The tests below should throw an error, not abort the process...
assert.throws(function() { new Buffer(0x3fffffff + 1) }, RangeError);
// assert.throws(function() { new Int8Array(0x3fffffff + 1) }, RangeError);
// assert.throws(function() { new ArrayBuffer(0x3fffffff + 1) }, RangeError);
// assert.throws(function() { new Float64Array(0x7ffffff + 1) }, RangeError);

