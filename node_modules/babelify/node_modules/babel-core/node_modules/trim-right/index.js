'use strict';
module.exports = function (str) {
	return str.replace(/[\s\uFEFF\xA0]+$/g, '');
};
