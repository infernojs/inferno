// much of this based on https://github.com/indutny/self-signed/blob/gh-pages/lib/rsa.js
var parseKeys = require('parse-asn1');
var elliptic = require('elliptic');
var bn = require('bn.js');
module.exports = verify;
function verify(sig, hash, key) {
  var pub = parseKeys(key);
  if (pub.type === 'ec') {
    return ecVerify(sig, hash, pub);
  } else if (pub.type === 'dsa') {
    return dsaVerify(sig, hash, pub);
  }
  var len = pub.modulus.byteLength();
  var pad = [ 0, 1 ];
  while (hash.length + pad.length + 1 < len) {
    pad.push(0xff);
  }
  pad.push(0x00);
  var i = -1;
  while (++i < hash.length) {
    pad.push(hash[i]);
  }
  pad = hash;
  var red = bn.mont(pub.modulus);
  sig = new bn(sig).toRed(red);

  sig = sig.redPow(new bn(pub.publicExponent));

  sig = new Buffer(sig.fromRed().toArray());
  sig = sig.slice(sig.length - hash.length);
  var out = 0;
  len = sig.length;
  i = -1;
  while (++i < len) {
    out += (sig[i] ^ hash[i]);
  }
  return !out;
}
function ecVerify(sig, hash, pub) {
  var curve;
  if (pub.data.algorithm.curve.join('.')  === '1.3.132.0.10') {
    curve = new elliptic.ec('secp256k1');
  }
  var pubkey = pub.data.subjectPrivateKey.data;
  return curve.verify(hash.toString('hex'), sig.toString('hex'), pubkey.toString('hex'));
}
function dsaVerify(sig, hash, pub) {
  var p = pub.data.p;
  var q = pub.data.q;
  var g = pub.data.g;
  var y = pub.data.pub_key;
  var unpacked = parseKeys.signature.decode(sig, 'der');
  var s = unpacked.s;
  var r = unpacked.r;
  checkValue(s, q);
  checkValue(r, q);
  var montq = bn.mont(q);
  var montp = bn.mont(p);
  var w =  s.invm(q);
  var v = g.toRed(montp)
  .redPow(new bn(hash).mul(w).mod(q))
  .fromRed()
  .mul(
    y.toRed(montp)
    .redPow(r.mul(w).mod(q))
    .fromRed()
  ).mod(p).mod(q);
  return !v.cmp(r);
}
function checkValue(b, q) {
  if (b.cmpn(0) <= 0) {
    throw new Error('invalid sig');
  }
  if (b.cmp(q) >= q) {
    throw new Error('invalid sig');
  }
}