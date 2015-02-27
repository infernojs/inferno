"use strict";

var test = require('tape');
var isNaN = require('./');

test('not NaN', function (t) {
	t.notOk(isNaN(), 'undefined is not NaN');
	t.notOk(isNaN(null), 'null is not NaN');
	t.notOk(isNaN(false), 'false is not NaN');
	t.notOk(isNaN(true), 'true is not NaN');
	t.notOk(isNaN(0), 'positive zero is not NaN');
	t.notOk(isNaN(Infinity), 'Infinity is not NaN');
	t.notOk(isNaN(-Infinity), '-Infinity is not NaN');
	t.notOk(isNaN('foo'), 'string is not NaN');
	t.notOk(isNaN([]), 'array is not NaN');
	t.notOk(isNaN({}), 'object is not NaN');
	t.notOk(isNaN(function () {}), 'function is not NaN');
	t.notOk(isNaN('NaN'), 'string NaN is not NaN');
	t.test('valueOf', function (st) {
		var obj = { valueOf: function () { return NaN; } };
		st.ok(isNaN(Number(obj)), 'object with valueOf of NaN, converted to Number, is NaN');
		st.notOk(isNaN(obj), 'object with valueOf of NaN is not NaN');
		st.end();
	});

	t.end();
});

test('NaN literal', function (t) {
	t.ok(isNaN(NaN), 'NaN is NaN');
	t.end();
});

