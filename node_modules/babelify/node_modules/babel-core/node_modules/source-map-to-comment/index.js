'use strict';
module.exports = function (val) {
	var base64 = new Buffer(JSON.stringify(val)).toString('base64');
	return '//# sourceMappingURL=data:application/json;base64,' + base64;
};
