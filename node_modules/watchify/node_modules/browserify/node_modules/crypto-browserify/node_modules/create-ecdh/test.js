var test = require('tape');
var nodeCrypto  = require('./browser');
var myCrypto = require('./browser');

var mods = [
   'secp256k1',
   'secp224r1',
   'prime256v1',
   'prime192v1'
];

function run(i) {
	mods.forEach(function (mod) {
		test(mod + ' run ' + i + ' uncompressed', function (t){
			t.plan(2);
			var dh1 = nodeCrypto(mod);
			dh1.generateKeys();
			var dh2 = myCrypto(mod);
			dh2.generateKeys();
			var pubk1 = dh1.getPublicKey();
			var pubk2 = dh2.getPublicKey();
			t.notEquals(pubk1.toString('hex'), pubk2.toString('hex'), 'diff public keys');
			var pub1 = dh1.computeSecret(pubk2).toString('hex');
			var pub2 = dh2.computeSecret(pubk1).toString('hex');
			t.equals(pub1, pub2, 'equal secrets');
		});
		test(mod + ' run ' + i + ' compressed', function (t){
			t.plan(2);
			var dh1 = nodeCrypto(mod);
			dh1.generateKeys();
			var dh2 = myCrypto(mod);
			dh2.generateKeys();
			var pubk1 = dh1.getPublicKey(null, 'compressed');
			var pubk2 = dh2.getPublicKey(null, 'compressed');
			t.notEquals(pubk1.toString('hex'), pubk2.toString('hex'), 'diff public keys');
			var pub1 = dh1.computeSecret(pubk2).toString('hex');
			var pub2 = dh2.computeSecret(pubk1).toString('hex');
			t.equals(pub1, pub2, 'equal secrets');
		});
		test(mod + ' run ' + i + ' set stuff', function (t){
			t.plan(5);
			var dh1 = nodeCrypto(mod);
			var dh2 = myCrypto(mod);
			dh1.generateKeys();
			dh2.generateKeys();
			dh1.setPrivateKey(dh2.getPrivateKey());
			dh1.setPublicKey(dh2.getPublicKey());
			var priv1 = dh1.getPrivateKey('hex');
			var priv2 = dh2.getPrivateKey('hex');
			t.equals(priv1, priv2, 'same private key');
			var pubk1 = dh1.getPublicKey();
			var pubk2 = dh2.getPublicKey();
			t.equals(pubk1.toString('hex'), pubk2.toString('hex'), 'same public keys, uncompressed');
			t.equals(dh1.getPublicKey('hex', 'compressed'), dh2.getPublicKey('hex', 'compressed'), 'same public keys compressed');
			t.equals(dh1.getPublicKey('hex', 'hybrid'), dh2.getPublicKey('hex', 'hybrid'), 'same public keys hybrid');
			var pub1 = dh1.computeSecret(pubk2).toString('hex');
			var pub2 = dh2.computeSecret(pubk1).toString('hex');
			t.equals(pub1, pub2, 'equal secrets');
		});
	});
}


var i = 0;
while (++i < 100) {
	run(i);
}