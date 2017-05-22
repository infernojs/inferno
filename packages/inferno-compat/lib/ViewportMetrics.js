'use strict';

var ViewportMetrics = {

	currentScrollLeft: 0,

	currentScrollTop: 0,

	refreshScrollValues: function(scrollPosition) {
		ViewportMetrics.currentScrollLeft = scrollPosition.x;
		ViewportMetrics.currentScrollTop = scrollPosition.y;
	},

};

module.exports = ViewportMetrics;
