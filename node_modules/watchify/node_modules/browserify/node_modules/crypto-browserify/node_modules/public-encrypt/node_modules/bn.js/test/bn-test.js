var assert = require('assert');
var BN = require('../').BN;
var fixtures = require('./fixtures');

describe('BN', function() {
  it('should work with Number input', function() {
    assert.equal(new BN(12345).toString(16), '3039');
    assert.equal(new BN(0x4123456).toString(16), '4123456');
  });

  it('should work with String input', function() {
    assert.equal(new BN('29048849665247').toString(16),
                 '1a6b765d8cdf');
    assert.equal(new BN('-29048849665247').toString(16),
                 '-1a6b765d8cdf');
    assert.equal(new BN('1A6B765D8CDF', 16).toString(16),
                 '1a6b765d8cdf');
    assert.equal(new BN('FF', 16).toString(), '255');
    assert.equal(new BN('1A6B765D8CDF', 16).toString(),
                 '29048849665247');
    assert.equal(new BN('a89c e5af8724 c0a23e0e 0ff77500', 16).toString(16),
                 'a89ce5af8724c0a23e0e0ff77500');
    assert.equal(new BN('123456789abcdef123456789abcdef123456789abcdef',
                        16).toString(16),
                 '123456789abcdef123456789abcdef123456789abcdef');
    assert.equal(new BN('10654321').toString(), '10654321');
    assert.equal(new BN('10000000000000000').toString(10),
                 '10000000000000000');
    var base2 = '11111111111111111111111111111111111111111111111111111';
    assert.equal(new BN(base2, 2).toString(2), base2);
    var base36 = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
    assert.equal(new BN(base36, 36).toString(36), base36);

    assert(
      new BN('6582018229284824168619876730229320890292528855852623664389292032')
          .words[0] < 0x4000000);
  });

  it('should import/export big endian', function() {
    assert.equal(new BN([1,2,3]).toString(16), '10203');
    assert.equal(new BN([1,2,3,4]).toString(16), '1020304');
    assert.equal(new BN([1,2,3,4,5]).toString(16), '102030405');
    assert.equal(new BN([1,2,3,4,5,6,7,8]).toString(16), '102030405060708');
    assert.equal(new BN([1,2,3,4]).toArray().join(','), '1,2,3,4');
    assert.equal(new BN([1,2,3,4,5,6,7,8]).toArray().join(','),
                 '1,2,3,4,5,6,7,8');
  });

  it('should import little endian', function() {
    assert.equal(new BN([1,2,3], 10, 'le').toString(16), '30201');
    assert.equal(new BN([1,2,3,4], 10, 'le').toString(16), '4030201');
    assert.equal(new BN([1,2,3,4,5], 10, 'le').toString(16), '504030201');
    assert.equal(new BN([1,2,3,4,5,6,7,8], 10, 'le').toString(16), '807060504030201');
  });

  it('should return proper bitLength', function() {
    assert.equal(new BN(0).bitLength(), 0);
    assert.equal(new BN(0x1).bitLength(), 1);
    assert.equal(new BN(0x2).bitLength(), 2);
    assert.equal(new BN(0x3).bitLength(), 2);
    assert.equal(new BN(0x4).bitLength(), 3);
    assert.equal(new BN(0x8).bitLength(), 4);
    assert.equal(new BN(0x10).bitLength(), 5);
    assert.equal(new BN(0x100).bitLength(), 9);
    assert.equal(new BN(0x123456).bitLength(), 21);
    assert.equal(new BN('123456789', 16).bitLength(), 33);
    assert.equal(new BN('8023456789', 16).bitLength(), 40);
  });

  it('should add numbers', function() {
    assert.equal(new BN(14).add(new BN(26)).toString(16), '28');
    var k = new BN(0x1234);
    var r = k;
    for (var i = 0; i < 257; i++)
      r = r.add(k);
    assert.equal(r.toString(16), '125868');

    var k = new BN('abcdefabcdefabcdef', 16);
    var r = new BN('deadbeef', 16);
    for (var i = 0; i < 257; i++)
      r.iadd(k);
    assert.equal(r.toString(16), 'ac79bd9b79be7a277bde');
  });

  describe('hex padding', function(){
    it('should have length of 8 from leading 15', function(){
      var a = new BN('ffb9602', 16);
      var b = new Buffer(a.toString('hex', 2), 'hex');
      assert.equal(a.toString('hex', 2).length, 8);
    });

    it('should have length of 8 from leading zero', function(){
      var a = new BN('fb9604', 16);
      var b = new Buffer(a.toString('hex', 8), 'hex');
      assert.equal(a.toString('hex', 8).length, 8);
    });

    it('should have length of 8 from leading zeros', function(){
      var a = new BN(0);
      var b = new Buffer(a.toString('hex', 8), 'hex');
      assert.equal(a.toString('hex', 8).length, 8);
    });

    it('should have length of 64 from leading 15', function(){
      var a = new BN(
          'ffb96ff654e61130ba8422f0debca77a0ea74ae5ea8bca9b54ab64aabf01003',
          16);
      var b = new Buffer(a.toString('hex', 2), 'hex');
      assert.equal(a.toString('hex', 2).length, 64);
    });

    it('should have length of 64 from leading zero', function(){
      var a = new BN(
          'fb96ff654e61130ba8422f0debca77a0ea74ae5ea8bca9b54ab64aabf01003',
          16);
      var b = new Buffer(a.toString('hex', 64), 'hex');
      assert.equal(a.toString('hex', 64).length, 64);
    });
  });

  describe('iaddn', function() {
    it('should allow a sign change', function() {
      var a = new BN(-100)
      assert.equal(a.sign, true)

      a.iaddn(200)

      assert.equal(a.sign, false)
      assert.equal(a.toString(), '100')
    })
  })

  it('should subtract numbers', function() {
    assert.equal(new BN(14).sub(new BN(26)).toString(16), '-c');
    assert.equal(new BN(26).sub(new BN(14)).toString(16), 'c');
    assert.equal(new BN(26).sub(new BN(26)).toString(16), '0');
    assert.equal(new BN(-26).sub(new BN(26)).toString(16), '-34');

    var a = new BN(
      '31ff3c61db2db84b9823d320907a573f6ad37c437abe458b1802cda041d6384' +
          'a7d8daef41395491e2',
      16);
    var b = new BN(
      '6f0e4d9f1d6071c183677f601af9305721c91d31b0bbbae8fb790000',
      16);
    var r = new BN(
      '31ff3c61db2db84b9823d3208989726578fd75276287cd9516533a9acfb9a67' +
          '76281f34583ddb91e2',
      16);
    assert.equal(a.sub(b).cmp(r), 0);

    // In-place
    assert.equal(b.clone().isub(a).neg().cmp(r), 0);

    var r = b.sub(new BN(14));
    assert.equal(b.clone().isubn(14).cmp(r), 0);

    var r = new BN(
      '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b', 16);
    assert.equal(r.isubn(-1).toString(16),
      '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681c');

    // Carry and copy
    var a = new BN('12345', 16);
    var b = new BN('1000000000000', 16);
    assert.equal(a.isub(b).toString(16), '-fffffffedcbb');

    var a = new BN('12345', 16);
    var b = new BN('1000000000000', 16);
    assert.equal(b.isub(a).toString(16), 'fffffffedcbb');
  });

  describe('isubn', function() {
    it('should work for positive numbers', function() {
      var a = new BN(-100)
      assert.equal(a.sign, true)

      a.isubn(200)
      assert.equal(a.sign, true)
      assert.equal(a.toString(), '-300')
    })

    it('should not allow a sign change', function() {
      var a = new BN(-100)
      assert.equal(a.sign, true)

      a.isubn(-200);
      assert.equal(a.sign, false)
      assert.equal(a.toString(), '100')
    })
  })

  it('should mul numbers', function() {
    assert.equal(new BN(0x1001).mul(new BN(0x1234)).toString(16),
                 '1235234');
    assert.equal(new BN(-0x1001).mul(new BN(0x1234)).toString(16),
                 '-1235234');
    assert.equal(new BN(-0x1001).mul(new BN(-0x1234)).toString(16),
                 '1235234');
    var n = new BN(0x1001);
    var r = n;
    for (var i = 0; i < 4; i++)
      r = r.mul(n);
    assert.equal(r.toString(16),
                 '100500a00a005001');

    var n = new BN(
      '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      16
    );
    assert.equal(n.mul(n).toString(16),
                 '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9' +
                     'b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9' +
                     '978a8bd8acaa40');
    assert.equal(n.mul(n).mul(n).toString(16),
                 '1b888e01a06e974017a28a5b4da436169761c9730b7aeedf75fc60f687b' +
                     '46e0cf2cb11667f795d5569482640fe5f628939467a01a612b02350' +
                     '0d0161e9730279a7561043af6197798e41b7432458463e64fa81158' +
                     '907322dc330562697d0d600');

    assert.equal(
      new BN('-100000000000').mul(new BN('3').div(new BN('4'))).toString(16),
      '0'
    );
  });

  it('should regress mul big numbers', function() {
    var q = fixtures.dhGroups.p17.q;
    var qs = fixtures.dhGroups.p17.qs;

    var q = new BN(q, 16);
    assert.equal(q.sqr().toString(16), qs);
  });

  it('should imul numbers', function() {
    var a = new BN('abcdef01234567890abcd', 16);
    var b = new BN('deadbeefa551edebabba8', 16);
    var c = a.mul(b);

    assert.equal(a.imul(b).toString(16), c.toString(16));

    var a = new BN('abcdef01234567890abcd214a25123f512361e6d236', 16);
    var b = new BN('deadbeefa551edebabba8121234fd21bac0341324dd', 16);
    var c = a.mul(b);

    assert.equal(a.imul(b).toString(16), c.toString(16));
  });

  it('should div numbers', function() {
    assert.equal(new BN('10').div(new BN(256)).toString(16),
                 '0');
    assert.equal(new BN('69527932928').div(new BN('16974594')).toString(16),
                 'fff');
    assert.equal(new BN('-69527932928').div(new BN('16974594')).toString(16),
                 '-fff');

    var b = new BN(
      '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9' +
          'b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9' +
          '978a8bd8acaa40',
      16);
    var n = new BN(
      '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      16
    );
    assert.equal(b.div(n).toString(16), n.toString(16));

    assert.equal(new BN('1').div(new BN('-5')).toString(10), '0');

    // Regression after moving to word div
    var p = new BN(
      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
      16);
    var a = new BN(
      '79be667e f9dcbbac 55a06295 ce870b07 029bfcdb 2dce28d9 59f2815b 16f81798',
      16);
    var as = a.sqr();
    assert.equal(
        as.div(p).toString(16),
        '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729e58090b9');

    var p = new BN(
      'ffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
      16);
    var a = new BN(
      'fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffff' +
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      16);
    assert.equal(
      a.div(p).toString(16),
      'ffffffff00000002000000000000000000000001000000000000000000000001');
  });

  it('should mod numbers', function() {
    assert.equal(new BN('10').mod(new BN(256)).toString(16),
                 'a');
    assert.equal(new BN('69527932928').mod(new BN('16974594')).toString(16),
                 '102f302');
    assert.equal(new BN('-69527932928').mod(new BN('16974594')).toString(16),
                 '1000');

    var p = new BN(
      'ffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
      16);
    var a = new BN(
      'fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffff' +
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      16);
    assert.equal(
      a.mod(p).toString(16),
      '0');
  });

  it('should divRound numbers', function() {
    assert.equal(new BN(9).divRound(new BN(20)).toString(10),
                 '0');
    assert.equal(new BN(10).divRound(new BN(20)).toString(10),
                 '1');
    assert.equal(new BN(150).divRound(new BN(20)).toString(10),
                 '8');
    assert.equal(new BN(149).divRound(new BN(20)).toString(10),
                 '7');
    assert.equal(new BN(149).divRound(new BN(17)).toString(10),
                 '9');
    assert.equal(new BN(144).divRound(new BN(17)).toString(10),
                 '8');
    assert.equal(new BN(-144).divRound(new BN(17)).toString(10),
                 '-8');
  });

  it('should absolute numbers', function() {
    assert.equal(new BN(0x1001).abs().toString(), '4097');
    assert.equal(new BN(-0x1001).abs().toString(), '4097');
    assert.equal(new BN('ffffffff', 16).abs().toString(), '4294967295');
  })

  it('should modn numbers', function() {
    assert.equal(new BN('10', 16).modn(256).toString(16), '10');
    assert.equal(new BN('100', 16).modn(256).toString(16), '0');
    assert.equal(new BN('1001', 16).modn(256).toString(16), '1');
    assert.equal(new BN('100000000001', 16).modn(256).toString(16), '1');
    assert.equal(new BN('100000000001', 16).modn(257).toString(16),
                 new BN('100000000001', 16).mod(new BN(257)).toString(16));
    assert.equal(new BN('123456789012', 16).modn(3).toString(16),
                 new BN('123456789012', 16).mod(new BN(3)).toString(16));
  });

  it('should idivn numbers', function() {
    assert.equal(new BN('10', 16).idivn(3).toString(16), '5');
    assert.equal(new BN('12', 16).idivn(3).toString(16), '6');
    assert.equal(new BN('10000000000000000').idivn(3).toString(10),
                 '3333333333333333');
    assert.equal(new BN('100000000000000000000000000000').idivn(3).toString(10),
                 '33333333333333333333333333333');

    var t = new BN(3);
    assert.equal(new BN('12345678901234567890123456', 16).idivn(3).toString(16),
                 new BN('12345678901234567890123456', 16).div(t).toString(16));
  });

  it('should shl numbers', function() {
    assert.equal(new BN('69527932928').shln(13).toString(16),
                 '2060602000000');
    assert.equal(new BN('69527932928').shln(45).toString(16),
                 '206060200000000000000');
  });

  it('should shr numbers', function() {
    assert.equal(new BN('69527932928').shrn(13).toString(16),
                 '818180');
    assert.equal(new BN('69527932928').shrn(17).toString(16),
                 '81818');
    assert.equal(new BN('69527932928').shrn(256).toString(16),
                 '0');
  });

  it('should invm numbers', function() {
    var p = new BN(257);
    var a = new BN(3);
    var b = a.invm(p);
    assert.equal(a.mul(b).mod(p).toString(16), '1');

    var p192 = new BN(
        'fffffffffffffffffffffffffffffffeffffffffffffffff',
        16);
    var a = new BN('deadbeef', 16);
    var b = a.invm(p192);
    assert.equal(a.mul(b).mod(p192).toString(16), '1');

    // Even base
    var phi = new BN('872d9b030ba368706b68932cf07a0e0c', 16);
    var e = new BN(65537);
    var d = e.invm(phi);
    assert.equal(e.mul(d).mod(phi).toString(16), '1');
  });

  it('should support bincn', function() {
    assert.equal(new BN(0).bincn(1).toString(16), '2');
    assert.equal(new BN(2).bincn(1).toString(16), '4');
    assert.equal(new BN(2).bincn(1).bincn(1).toString(16),
                 new BN(2).bincn(2).toString(16));
    assert.equal(new BN(0xffffff).bincn(1).toString(16), '1000001');
  });

  it('should support imaskn', function() {
    assert.equal(new BN(0).imaskn(1).toString(16), '0');
    assert.equal(new BN(3).imaskn(1).toString(16), '1');
    assert.equal(new BN('123456789', 16).imaskn(4).toString(16), '9');
    assert.equal(new BN('123456789', 16).imaskn(16).toString(16), '6789');
    assert.equal(new BN('123456789', 16).imaskn(28).toString(16), '3456789');
  });

  it('should support testn', function() {
    [
      'ff',
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    ].forEach(function(hex) {
      var bn = new BN(hex, 16)
      var bl = bn.bitLength()

      for (var i = 0; i < bl; ++i) {
        assert.equal(bn.testn(i), true);
      }

      // test off the end
      assert.equal(bn.testn(bl), false);
    })

    var xbits = [
      '01111001010111001001000100011101110100111011000110001110010111011001010',
      '01110000000010110001111010101111100111110010001111000001001011010100111',
      '01000101001100010001101001011110100001001111100110001110010111'
    ].join('')

    var x = new BN(
      '23478905234580795234378912401239784125643978256123048348957342'
    )
    for (var i = 0; i < x.bitLength(); ++i) {
      assert.equal(x.testn(i), (xbits.charAt(i) === '1'), 'Failed @ bit ' + i)
    }
  });

  it('should support gcd', function() {
    assert.equal(new BN(3).gcd(new BN(2)).toString(16), '1');
    assert.equal(new BN(18).gcd(new BN(12)).toString(16), '6');
    assert.equal(new BN(-18).gcd(new BN(12)).toString(16), '6');
  });

  it('should and numbers', function () {
    assert.equal(new BN('1010101010101010101010101010101010101010', 2)
                 .and(new BN('101010101010101010101010101010101010101', 2))
                 .toString(2), '0');
  });
  it('should iand numbers', function () {
    assert.equal(new BN('1010101010101010101010101010101010101010', 2)
                 .iand(new BN('101010101010101010101010101010101010101', 2))
                 .toString(2), '0');
    assert.equal(new BN('1000000000000000000000000000000000000001', 2)
                 .iand(new BN('1', 2))
                 .toString(2), '1')
    assert.equal(new BN('1', 2)
                 .iand(new BN('1000000000000000000000000000000000000001', 2))
                 .toString(2), '1')
  });
  it('should or numbers', function () {
    assert.equal(new BN('1010101010101010101010101010101010101010', 2)
                 .or(new BN('101010101010101010101010101010101010101', 2))
                 .toString(2), '1111111111111111111111111111111111111111');
  });
  it('should ior numbers', function () {
    assert.equal(new BN('1010101010101010101010101010101010101010', 2)
                 .ior(new BN('101010101010101010101010101010101010101', 2))
                 .toString(2), '1111111111111111111111111111111111111111');
    assert.equal(new BN('1000000000000000000000000000000000000000', 2)
                 .ior(new BN('1', 2))
                 .toString(2), '1000000000000000000000000000000000000001');
    assert.equal(new BN('1', 2)
                 .ior(new BN('1000000000000000000000000000000000000000', 2))
                 .toString(2), '1000000000000000000000000000000000000001');
  });
  it('should xor numbers', function () {
    assert.equal(new BN('11001100110011001100110011001100', 2)
                 .xor(new BN('1100110011001100110011001100110', 2))
                 .toString(2), '10101010101010101010101010101010');
  });
  it('should ixor numbers', function () {
    assert.equal(new BN('11001100110011001100110011001100', 2)
                 .ixor(new BN('1100110011001100110011001100110', 2))
                 .toString(2), '10101010101010101010101010101010');
    assert.equal(new BN('11001100110011001100110011001100', 2)
                 .ixor(new BN('1', 2))
                 .toString(2), '11001100110011001100110011001101');
    assert.equal(new BN('1', 2)
                 .ixor(new BN('11001100110011001100110011001100', 2))
                 .toString(2), '11001100110011001100110011001101');
  });

  it('should allow single bits to be set', function () {
    assert.equal(new BN(0).setn(2, true).toString(2), '100');
    assert.equal(new BN(0).setn(27, true).toString(2),
                 '1000000000000000000000000000');
    assert.equal(new BN('1000000000000000000000000001', 2).setn(27, false)
                 .toString(2), '1');
    assert.equal(new BN('101', 2).setn(2, false).toString(2), '1');
  });
});
