/*!
 * inferno-vnode-flags v1.0.0-beta34
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = global.Inferno || {}, global.Inferno.VNodeFlags = factory());
}(this, (function () { 'use strict';

var index = {
	Text: 1,
	HtmlElement: 1 << 1,

	ComponentClass: 1 << 2,
	ComponentFunction: 1 << 3,
	ComponentUnknown: 1 << 4,

	HasKeyedChildren: 1 << 5,
	HasNonKeyedChildren: 1 << 6,

	SvgElement: 1 << 7,
	MediaElement: 1 << 8,
	InputElement: 1 << 9,
	TextareaElement: 1 << 10,
	SelectElement: 1 << 11,
	Void: 1 << 12,
};

return index;

})));
