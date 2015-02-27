// https://github.com/paulmillr/es6-shim
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger
var isNaN = require("is-nan");
var isFinite = require("is-finite");
module.exports = Number.isInteger || function(val) {
	return typeof val === "number" &&
		! isNaN(val) &&
		isFinite(val) &&
		parseInt(val, 10) === val;
};
