var crypto = require("crypto");
var sign = require('./sign');

var m = new Buffer('AF2BDBE1AA9B6EC1E2ADE1D694F41FC71A831D0268E9891562113D8A62ADD1BF','hex')

var xbuf = new Buffer('009A4D6792295A7F730FC3F2B49CBC0F62E862272F', 'hex')

var bn = require('bn.js')

var x = new bn(xbuf)

var q = new Buffer('04000000000000000000020108A2E0CC0D99F8A5EF', 'hex')

var qbuf = new Buffer('04000000000000000000020108A2E0CC0D99F8A5EF', 'hex')

var q = new bn(qbuf)

var kv = sign.getKay(x, q,m,'sha256', crypto)
var k = sign.makeKey(q, kv, 'sha256', crypto)
console.log('k', k);