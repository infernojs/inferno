"use strict";

/* https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isnan */

module.exports = function isNaN(value) {
	return value !== value;
};

