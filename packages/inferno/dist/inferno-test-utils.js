/*!
 * inferno-test-utils v1.0.0-beta4
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoTestUtils = factory());
}(this, (function () { 'use strict';

function shallowRender() {
}

function deepRender() {
}

function renderIntoDocument() {
}

var index = {
	shallowRender: shallowRender,
	deepRender: deepRender,
	renderIntoDocument: renderIntoDocument
	// Simulate
};

return index;

})));
