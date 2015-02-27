// jshint node:true
"use strict";

// Tests taken directly from es6-shim number tests
// https://github.com/paulmillr/es6-shim/blob/master/test/number.js

var test = require("tape"),
	isInteger = require("./");

test("should be truthy on integers", function(t) {
	[5295, -5295, -9007199254740991, 9007199254740991, 0, -0]
		.map(isInteger)
		.forEach(function(val) {
			t.ok(val);
		});
	t.ok(isInteger(4));
	t.ok(isInteger(4.0));
	t.ok(isInteger(1801439850948));
	t.end();
});

test("should be falsy on non-integers", function(t) {
	t.notOk(isInteger(4.2));
	t.notOk(isInteger(Infinity));
	t.notOk(isInteger(-Infinity));
	t.notOk(isInteger(NaN));
	t.notOk(isInteger(true));
	t.notOk(isInteger(false));
	t.notOk(isInteger("str"));
	t.notOk(isInteger({}));
	t.notOk(isInteger({
		valueOf: function() { return 3; }
	}));
	t.notOk(isInteger({
		valueOf: function() { return 0/0; }
	}));
	t.notOk(isInteger({
		valueOf: function() { throw 17; }
	}));
	t.notOk(isInteger({
		toString: function() { throw 17; }
	}));
	t.notOk(isInteger({
		valueOf: function() { throw 17; },
		toString: function() { throw 42; }
	}));
	t.end();
});

test("should be false when the type is not number", function(t) {
	[
		false,
		true,
		null,
		undefined,
		"",
		function () {},
		{ valueOf: function () { return 3; } },
		/a/g,
		{}
	].forEach(function(thing) {
		t.notOk(isInteger(thing));
	});
	t.end();
});

test("should be false when NaN", function(t) {
	t.notOk(isInteger(NaN));
	t.end();
});

test("should be false when ∞", function(t) {
	t.notOk(isInteger(Infinity));
	t.notOk(isInteger(-Infinity));
	t.end();
});

test("should be false when number is not integer", function(t) {
	t.notOk(isInteger(3.4));
	t.notOk(isInteger(-3.4));
	t.end();
});
