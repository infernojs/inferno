var Buffer = require('../../').Buffer
if (process.env.OBJECT_IMPL) Buffer.TYPED_ARRAY_SUPPORT = false
// var common = require('../common');
var assert = require('assert');

var Buffer = require('../../').Buffer;

var buff = new Buffer(Buffer.poolSize + 1);
var slicedBuffer = buff.slice();
assert.equal(slicedBuffer.parent,
             buff,
             "slicedBufffer should have its parent set to the original " +
             " buffer");

