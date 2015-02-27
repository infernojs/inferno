'use strict';

var fs   = require('fs');
var pako = require('../index.js');

var data = new Uint8Array(fs.readFileSync(__dirname +'/samples/lorem_1mb.txt'));

var deflated = pako.deflate(data, { level: 6/*, to: 'string'*/ });

for (var i=0; i<200; i++) {
  pako.inflate(deflated, { to: 'string' });
}
