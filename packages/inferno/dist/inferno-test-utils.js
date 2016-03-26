/*!
 * inferno-test-utils v0.6.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoTestUtils = factory());
}(this, function () { 'use strict';

	function shallowRender() {}

	function deepRender() {}

	function renderIntoDocument() {}

	var index = {
		shallowRender: shallowRender,
		deepRender: deepRender,
		renderIntoDocument: renderIntoDocument
		// Simulate
	};

	return index;

}));