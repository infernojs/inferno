/*!
 * inferno-test-utils v1.0.0-beta39
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Inferno = global.Inferno || {}, global.Inferno.TestUtils = global.Inferno.TestUtils || {})));
}(this, (function (exports) { 'use strict';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though









function isNull(obj) {
    return obj === null;
}


function isObject(o) {
    return typeof o === 'object';
}

function isValidElement(obj) {
    var isNotANullObject = isObject(obj) && isNull(obj) === false;
    if (isNotANullObject === false) {
        return false;
    }
    var flags = obj.flags;
    return !!(flags & (28 /* Component */ | 3970 /* Element */));
}

var index = {
	isValidElement: isValidElement
};

exports.isValidElement = isValidElement;
exports['default'] = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
