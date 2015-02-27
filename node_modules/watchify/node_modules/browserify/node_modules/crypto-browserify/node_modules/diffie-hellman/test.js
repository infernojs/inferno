var test = require('tape');
var nodeCrypto = require('./');
var myCrypto = require('./browser');

var mods = [
   'modp1', 'modp2', 'modp5', 'modp14', 'modp15', 'modp16', 'modp17', 'modp18'
];
function isNode10() {
  return process.version && process.version.split('.').length === 3 && parseInt(process.version.split('.')[1], 10) <= 10;
}
 var lens = [
  2, 8, 16, 17, 18, 20, 21, 22, 64, 65, 128, 384, 512, 1024,
  192, 224, 256];
   var lens2 = [
  16, 17, 18, 20, 21, 22,64, 65, 128];
function run(i) {
	mods.forEach(function (mod) {
		test(mod + ' run ' + i, function (t){
			t.plan(5);
			var dh1 = nodeCrypto.getDiffieHellman(mod);
			var p1 = dh1.getPrime().toString('hex');
			dh1.generateKeys();
			var dh2 = myCrypto.getDiffieHellman(mod);
			t.equals(typeof dh1.setPublicKey, typeof dh2.setPublicKey, 'same methods');
			t.equals(typeof dh1.setPrivateKey, typeof dh2.setPrivateKey, 'same methods');
			var p2 = dh2.getPrime().toString('hex');
			dh2.generateKeys();
			t.equals(p1, p2, 'equal primes');
			var pubk1 = dh1.getPublicKey();
			var pubk2 = dh2.getPublicKey();
			t.notEquals(pubk1.toString('hex'), pubk2.toString('hex'), 'diff public keys');
			var pub1 = dh1.computeSecret(pubk2).toString('hex');
			var pub2 = dh2.computeSecret(pubk1).toString('hex');
			t.equals(pub1, pub2, 'equal secrets');
		});
	});
}


function bylen(t, generator) {
	return function (len){
		t.test('' + len, function (t) {
			t.plan(6);
			var dh2 = myCrypto.createDiffieHellman(len, generator);
			var prime2 = dh2.getPrime();
			var p2 = prime2.toString('hex');
			var dh1 = nodeCrypto.createDiffieHellman(prime2, generator);
			var p1 = dh1.getPrime().toString('hex');
			t.equals(typeof dh1.setPublicKey, typeof dh2.setPublicKey, 'same methods');
			t.equals(typeof dh1.setPrivateKey, typeof dh2.setPrivateKey, 'same methods');
			dh1.generateKeys();
			dh2.generateKeys();
			t.equals(p1, p2, 'equal primes');
			t.equals(dh1.getGenerator('hex'), dh2.getGenerator('hex'), 'equal generators');
			var pubk1 = dh1.getPublicKey();
			var pubk2 = dh2.getPublicKey();
			t.notEquals(pubk1.toString('hex'), pubk2.toString('hex'), 'diff public keys');
			var pub1 = dh1.computeSecret(pubk2).toString('hex');
			var pub2 = dh2.computeSecret(dh1.getPublicKey()).toString('hex');
			t.equals(pub1, pub2, 'equal secrets');
		});
	};
}
function bylen2(t) {
	return function (len){
		t.test('' + len, function (t) {
			t.plan(5);
			var dh2 = nodeCrypto.createDiffieHellman(len);
			var prime2 = dh2.getPrime();
			var p2 = prime2.toString('hex');
			var dh1 = myCrypto.createDiffieHellman(prime2);
			var p1 = dh1.getPrime().toString('hex');
			dh1.generateKeys();
			dh2.generateKeys();
			t.equals(typeof dh1.setPublicKey, typeof dh2.setPublicKey, 'same methods');
			t.equals(typeof dh1.setPrivateKey, typeof dh2.setPrivateKey, 'same methods');
			t.equals(p1, p2, 'equal primes');
			var pubk1 = dh1.getPublicKey();
			var pubk2 = dh2.getPublicKey();
			t.notEquals(pubk1.toString('hex'), pubk2.toString('hex'), 'diff public keys');
			var pub1 = dh1.computeSecret(pubk2).toString('hex');
			var pub2 = dh2.computeSecret(dh1.getPublicKey()).toString('hex');
			t.equals(pub1, pub2, 'equal secrets');
		});
	};
}

test('create primes gen 2', function (t) {
	var f = bylen(t, new Buffer([2]));
	lens2.forEach(f);
});
if (!isNode10()) {
	test('create primes gen 5', function (t) {
		var f = bylen(t, new Buffer([5]));
		lens2.forEach(f);
	});
}

test('create primes other way', function (t) {
		var f = bylen2(t);
		lens.forEach(f);
	});
var i = 0;
while (++i < 2) {
	run(i);
}
function isNode10() {
  return process.version && process.version.split('.').length === 3 && parseInt(process.version.split('.')[1], 10) <= 10;
}
if (!isNode10()) {
	test('check errors', function (t) {
		t.plan(5);
		var p1 = new Buffer('db10e7f61adcc193', 'hex');
		var p2 = new Buffer('db10e7f61adcc194', 'hex');
		var dh1 = myCrypto.createDiffieHellman(p1);
		var dh2 = nodeCrypto.createDiffieHellman(p1);
		t.equals(dh1.verifyError, dh2.verifyError, 'same error for good prime');
		dh1 = myCrypto.createDiffieHellman(p2);
		dh2 = nodeCrypto.createDiffieHellman(p2);
		t.equals(dh1.verifyError, dh2.verifyError, 'same error for bad prime');
		dh1 = myCrypto.createDiffieHellman(p2, new Buffer([7]));
		dh2 = nodeCrypto.createDiffieHellman(p2, new Buffer([7]));
		t.equals(dh1.verifyError, dh2.verifyError, 'same error for bad prime non testable generator');
		dh1 = myCrypto.createDiffieHellman(p1.toString('hex'), 'hex', new Buffer([5]));
		dh2 = nodeCrypto.createDiffieHellman(p1.toString('hex'), 'hex', new Buffer([5]));
		t.equals(dh1.verifyError, dh2.verifyError, 'same error for good prime wrong generator');
		dh1 = myCrypto.createDiffieHellman(p1, new Buffer([11]).toString('hex'), 'hex');
		dh2 = nodeCrypto.createDiffieHellman(p1, new Buffer([11]).toString('hex'), 'hex');
		t.equals(dh1.verifyError, dh2.verifyError, 'same error for good prime non testable generator');
	});
}