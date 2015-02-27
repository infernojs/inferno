// This tests are ported from original zlib

/*global describe, it*/


'use strict';


var assert = require('assert');

var c = require('../lib/zlib/constants');
var msg = require('../lib/zlib/messages');
//var zlib_stream = require('../lib/zlib/zstream');
var zlib_inflate = require('../lib/zlib/inflate.js');
var inflate_table = require('../lib/zlib/inftrees');

var pako  = require('../index');


function h2b(hex) {
  return hex.split(' ').map(function(hex) { return parseInt(hex, 16); });
}


//step argument from original tests is missing because it have no effect
//we have similar behavior in chunks.js tests
function testInflate(hex, wbits, status) {
  var inflator;
  try {
    inflator= new pako.Inflate({ windowBits: wbits });
  } catch (e) {
    assert(e === msg[status]);
    return;
  }
  inflator.push(h2b(hex), true);
  assert.equal(inflator.err, status);
}


describe('Inflate states', function() {
  //in port checking input parameters was removed
  it('inflate bad parameters', function() {
    var ret;

    ret = zlib_inflate.inflate(null, 0);
    assert(ret === c.Z_STREAM_ERROR);

    ret = zlib_inflate.inflateEnd(null);
    assert(ret === c.Z_STREAM_ERROR);

    //skip: inflateCopy is not implemented
    //ret = zlib_inflate.inflateCopy(null, null);
    //assert(ret == c.Z_STREAM_ERROR);
  });
  it('bad gzip method', function() {
    testInflate('1f 8b 0 0', 31, c.Z_DATA_ERROR);
  });
  it('bad gzip flags', function() {
    testInflate('1f 8b 8 80', 31, c.Z_DATA_ERROR);
  });
  it('bad zlib method', function() {
    testInflate('77 85', 15, c.Z_DATA_ERROR);
  });
  it('set window size from header', function() {
    testInflate('8 99', 0, c.Z_OK);
  });
  it('bad zlib window size', function() {
    testInflate('78 9c', 8, c.Z_DATA_ERROR);
  });
  it('check adler32', function() {
    testInflate('78 9c 63 0 0 0 1 0 1', 15, c.Z_OK);
  });
  it('bad header crc', function() {
    testInflate('1f 8b 8 1e 0 0 0 0 0 0 1 0 0 0 0 0 0', 47, c.Z_DATA_ERROR);
  });
  it('check gzip length', function() {
    testInflate('1f 8b 8 2 0 0 0 0 0 0 1d 26 3 0 0 0 0 0 0 0 0 0', 47, c.Z_OK);
  });
  it('bad zlib header check', function() {
    testInflate('78 90', 47, c.Z_DATA_ERROR);
  });
  it('need dictionary', function() {
    testInflate('8 b8 0 0 0 1', 8, c.Z_NEED_DICT);
  });
  it('compute adler32', function() {
    testInflate('78 9c 63 0', 15, c.Z_OK);
  });
});

describe('Inflate cover', function() {
  it('invalid stored block lengths', function() {
    testInflate('0 0 0 0 0', -15, c.Z_DATA_ERROR);
  });
  it('fixed', function() {
    testInflate('3 0', -15, c.Z_OK);
  });
  it('invalid block type', function() {
    testInflate('6', -15, c.Z_DATA_ERROR);
  });
  it('stored', function() {
    testInflate('1 1 0 fe ff 0', -15, c.Z_OK);
  });
  it('too many length or distance symbols', function() {
    testInflate('fc 0 0', -15, c.Z_DATA_ERROR);
  });
  it('invalid code lengths set', function() {
    testInflate('4 0 fe ff', -15, c.Z_DATA_ERROR);
  });
  it('invalid bit length repeat', function() {
    testInflate('4 0 24 49 0', -15, c.Z_DATA_ERROR);
  });
  it('invalid bit length repeat', function() {
    testInflate('4 0 24 e9 ff ff', -15, c.Z_DATA_ERROR);
  });
  it('invalid code -- missing end-of-block', function() {
    testInflate('4 0 24 e9 ff 6d', -15, c.Z_DATA_ERROR);
  });
  it('invalid literal/lengths set', function() {
    testInflate('4 80 49 92 24 49 92 24 71 ff ff 93 11 0', -15, c.Z_DATA_ERROR);
  });
  it('invalid literal/length code', function() {
    testInflate('4 80 49 92 24 49 92 24 f b4 ff ff c3 84', -15, c.Z_DATA_ERROR);
  });
  it('invalid distance code', function() {
    testInflate('2 7e ff ff', -15, c.Z_DATA_ERROR);
  });
  it('invalid distance too far back', function() {
    testInflate('c c0 81 0 0 0 0 0 90 ff 6b 4 0', -15, c.Z_DATA_ERROR);
  });
  it('incorrect data check', function() {
    testInflate('1f 8b 8 0 0 0 0 0 0 0 3 0 0 0 0 1', 47, c.Z_DATA_ERROR);
  });
  it('incorrect length check', function() {
    testInflate('1f 8b 8 0 0 0 0 0 0 0 3 0 0 0 0 0 0 0 0 1', 47, c.Z_DATA_ERROR);
  });
  it('pull 17', function() {
    testInflate('5 c0 21 d 0 0 0 80 b0 fe 6d 2f 91 6c', -15, c.Z_OK);
  });
  it('long code', function() {
    testInflate('5 e0 81 91 24 cb b2 2c 49 e2 f 2e 8b 9a 47 56 9f fb fe ec d2 ff 1f', -15, c.Z_OK);
  });
  it('length extra', function() {
    testInflate('ed c0 1 1 0 0 0 40 20 ff 57 1b 42 2c 4f', -15, c.Z_OK);
  });
  it('long distance and extra', function() {
    testInflate('ed cf c1 b1 2c 47 10 c4 30 fa 6f 35 1d 1 82 59 3d fb be 2e 2a fc f c', -15, c.Z_OK);
  });
  it('window end', function() {
    testInflate('ed c0 81 0 0 0 0 80 a0 fd a9 17 a9 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 6',
      -15, c.Z_OK);
  });
  it('inflate_fast TYPE return', function() {
    testInflate('2 8 20 80 0 3 0', -15, c.Z_OK);
  });
  it('window wrap', function() {
    testInflate('63 18 5 40 c 0', -8, c.Z_OK);
  });
});

describe('cover trees', function() {
  it('inflate_table not enough errors', function() {
    var ret, bits, next, table = [], lens = [], work = [];
    var DISTS = 2;
    /* we need to call inflate_table() directly in order to manifest not-
     enough errors, since zlib insures that enough is always enough */
    for (bits = 0; bits < 15; bits++) {
      lens[bits] = bits + 1;
    }
    lens[15] = 15;
    next = table;

    ret = inflate_table(DISTS, lens, 0, 16, next, 0, work, {bits: 15});
    assert(ret === 1);

    next = table;
    ret = inflate_table(DISTS, lens, 0, 16, next, 0, work, {bits: 1});
    assert(ret === 1);
  });
});

describe('Inflate fast', function() {
  it('fast length extra bits', function() {
    testInflate('e5 e0 81 ad 6d cb b2 2c c9 01 1e 59 63 ae 7d ee fb 4d fd b5 35 41 68' +
      ' ff 7f 0f 0 0 0', -8, c.Z_DATA_ERROR);
  });
  it('fast distance extra bits', function() {
    testInflate('25 fd 81 b5 6d 59 b6 6a 49 ea af 35 6 34 eb 8c b9 f6 b9 1e ef 67 49' +
      ' 50 fe ff ff 3f 0 0', -8, c.Z_DATA_ERROR);
  });
  it('fast invalid literal/length code', function() {
    testInflate('1b 7 0 0 0 0 0', -8, c.Z_DATA_ERROR);
  });
  it('fast 2nd level codes and too far back', function() {
    testInflate('d c7 1 ae eb 38 c 4 41 a0 87 72 de df fb 1f b8 36 b1 38 5d ff ff 0', -8, c.Z_DATA_ERROR);
  });
  it('very common case', function() {
    testInflate('63 18 5 8c 10 8 0 0 0 0', -8, c.Z_OK);
  });
  it('contiguous and wrap around window', function() {
    testInflate('63 60 60 18 c9 0 8 18 18 18 26 c0 28 0 29 0 0 0', -8, c.Z_OK);
  });
  it('copy direct from output', function() {
    testInflate('63 0 3 0 0 0 0 0', -8, c.Z_OK);
  });
});

describe('Inflate support', function() {
  // `inflatePrime` not implemented
  /*it('prime', function() {
    var ret;
    var strm = new zlib_stream();
    strm.avail_in = 0;
    strm.input = null;

    ret = zlib_inflate.inflateInit(strm);
    assert(ret === c.Z_OK);

    ret = zlib_inflate.inflatePrime(strm, 5, 31);
    assert(ret === c.Z_OK);

    ret = zlib_inflate.inflatePrime(strm, -1, 0);
    assert(ret === c.Z_OK);

    // `inflateSetDictionary` not implemented
    // ret = zlib_inflate.inflateSetDictionary(strm, null, 0);
    // assert(ret === c.Z_STREAM_ERROR);

    ret = zlib_inflate.inflateEnd(strm);
    assert(ret === c.Z_OK);
  });*/
  it('force window allocation', function() {
    testInflate('63 0', -15, c.Z_OK);
  });
  it('force window replacement', function() {
    testInflate('63 18 5', -15, c.Z_OK);
  });
  it('force split window update', function() {
    testInflate('63 18 68 30 d0 0 0', -15, c.Z_OK);
  });
  it('use fixed blocks', function() {
    testInflate('3 0', -15, c.Z_OK);
  });
  it('bad window size', function() {
    testInflate('', -15, c.Z_OK);
  });
});