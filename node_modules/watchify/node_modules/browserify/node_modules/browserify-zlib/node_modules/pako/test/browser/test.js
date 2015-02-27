/*global describe, it, pako, assert*/


'use strict';


var size = 100*1000;

var data_bin = (typeof Uint8Array !== 'undefined') ? new Uint8Array(size) : new Array(size);

for (var i=data_bin.length-1; i>=0; i--) { data_bin[i] = (Math.random(256)*256) & 0xff; }

var cmp = function (a, b) {
  if (a.length !== b.length) { return false; }
  for (var i=0, l=a.length; i<l; i++) { if (a[i] !== b[i]) { return false; } }
  return true;
};


describe('Generic', function () {

  it('defaults', function() {
    assert(cmp(data_bin, pako.inflate(pako.deflate(data_bin))));
  });


  describe('levels', function() {
    it('0', function() {
      assert(cmp(data_bin, pako.inflate(pako.deflate(data_bin, { level: 0 }))));
    });
    it('1', function() {
      assert(cmp(data_bin, pako.inflate(pako.deflate(data_bin, { level: 1 }))));
    });
    it('4', function() {
      assert(cmp(data_bin, pako.inflate(pako.deflate(data_bin, { level: 4 }))));
    });
    it('6', function() {
      assert(cmp(data_bin, pako.inflate(pako.deflate(data_bin, { level: 6 }))));
    });
  });
});

