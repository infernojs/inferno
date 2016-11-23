/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.toArray = toArray;
exports.isArray = isArray;
exports.isStatefulComponent = isStatefulComponent;
exports.isStringOrNumber = isStringOrNumber;
exports.isNullOrUndef = isNullOrUndef;
exports.isInvalid = isInvalid;
exports.isFunction = isFunction;
exports.isAttrAnEvent = isAttrAnEvent;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isNull = isNull;
exports.isTrue = isTrue;
exports.isUndefined = isUndefined;
exports.isObject = isObject;
exports.throwError = throwError;
exports.warning = warning;
var NO_OP = exports.NO_OP = '$NO_OP';
var ERROR_MSG = exports.ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = exports.isBrowser = typeof window !== 'undefined' && window.document;
function toArray(children) {
    return isArray(children) ? children : children ? [children] : children;
}
function isArray(obj) {
    return obj instanceof Array;
}
function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}
function isStringOrNumber(obj) {
    return isString(obj) || isNumber(obj);
}
function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}
function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}
function isFunction(obj) {
    return typeof obj === 'function';
}
function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}
function isString(obj) {
    return typeof obj === 'string';
}
function isNumber(obj) {
    return typeof obj === 'number';
}
function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}
function isObject(o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
}
function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error('Inferno Error: ' + message);
}
function warning(condition, message) {
    if (!condition) {
        console.error(message);
    }
}
var EMPTY_OBJ = exports.EMPTY_OBJ = {};
//# sourceMappingURL=shared.js.map

/***/ },
/* 1 */
/***/ function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.componentToDOMNodeMap = exports.roots = undefined;
exports.findDOMNode = findDOMNode;
exports.render = render;
exports.createRenderer = createRenderer;

var _lifecycle2 = __webpack_require__(13);

var _lifecycle3 = _interopRequireDefault(_lifecycle2);

var _mounting = __webpack_require__(7);

var _patching = __webpack_require__(5);

var _shared = __webpack_require__(0);

var _hydration = __webpack_require__(16);

var _hydration2 = _interopRequireDefault(_hydration);

var _unmounting = __webpack_require__(11);

var _cloneVNode = __webpack_require__(12);

var _cloneVNode2 = _interopRequireDefault(_cloneVNode);

var _devtools = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
var roots = exports.roots = [];
var componentToDOMNodeMap = exports.componentToDOMNodeMap = new Map();
function findDOMNode(domNode) {
    return componentToDOMNodeMap.get(domNode) || null;
}
function getRoot(dom) {
    for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root.dom === dom) {
            return root;
        }
    }
    return null;
}
function setRoot(dom, input, lifecycle) {
    roots.push({
        dom: dom,
        input: input,
        lifecycle: lifecycle
    });
}
function removeRoot(root) {
    for (var i = 0; i < roots.length; i++) {
        if (roots[i] === root) {
            roots.splice(i, 1);
            return;
        }
    }
}
var documetBody = _shared.isBrowser ? document.body : null;
function render(input, parentDom) {
    if (documetBody === parentDom) {
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('you cannot render() to the "document.body". Use an empty element as a container instead.');
        }
        (0, _shared.throwError)();
    }
    if (input === _shared.NO_OP) {
        return;
    }
    var root = getRoot(parentDom);
    if ((0, _shared.isNull)(root)) {
        var lifecycle = new _lifecycle3.default();
        if (!(0, _shared.isInvalid)(input)) {
            if (input.dom) {
                input = (0, _cloneVNode2.default)(input);
            }
            if (!(0, _hydration2.default)(input, parentDom, lifecycle)) {
                (0, _mounting.mount)(input, parentDom, lifecycle, {}, false);
            }
            lifecycle.trigger();
            setRoot(parentDom, input, lifecycle);
        }
    } else {
        var _lifecycle = root.lifecycle;
        _lifecycle.listeners = [];
        if ((0, _shared.isNullOrUndef)(input)) {
            (0, _unmounting.unmount)(root.input, parentDom, _lifecycle, false, false);
            removeRoot(root);
        } else {
            if (input.dom) {
                input = (0, _cloneVNode2.default)(input);
            }
            (0, _patching.patch)(root.input, input, parentDom, _lifecycle, {}, false, false);
        }
        _lifecycle.trigger();
        root.input = input;
    }
    if (_devtools.devToolsStatus.connected) {
        (0, _devtools.sendRoots)(window);
    }
}
function createRenderer() {
    var parentDom = void 0;
    return function renderer(lastInput, nextInput) {
        if (!parentDom) {
            parentDom = lastInput;
        }
        render(nextInput, parentDom);
    };
}
//# sourceMappingURL=rendering.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.normalizeVNodes = normalizeVNodes;
exports.createVNode = createVNode;
exports.createVoidVNode = createVoidVNode;
exports.createTextVNode = createTextVNode;
exports.isVNode = isVNode;

var _shared = __webpack_require__(0);

var _cloneVNode = __webpack_require__(12);

var _cloneVNode2 = _interopRequireDefault(_cloneVNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _normalizeVNodes(nodes, result, i) {
    for (; i < nodes.length; i++) {
        var n = nodes[i];
        if (!(0, _shared.isInvalid)(n)) {
            if (Array.isArray(n)) {
                _normalizeVNodes(n, result, 0);
            } else {
                if ((0, _shared.isStringOrNumber)(n)) {
                    n = createTextVNode(n);
                } else if (isVNode(n) && n.dom) {
                    n = (0, _cloneVNode2.default)(n);
                }
                result.push(n);
            }
        }
    }
}
function normalizeVNodes(nodes) {
    var newNodes = void 0;
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if ((0, _shared.isInvalid)(n) || Array.isArray(n)) {
            var result = (newNodes || nodes).slice(0, i);
            _normalizeVNodes(nodes, result, i);
            return result;
        } else if ((0, _shared.isStringOrNumber)(n)) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(createTextVNode(n));
        } else if (isVNode(n) && n.dom) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push((0, _cloneVNode2.default)(n));
        } else if (newNodes) {
            newNodes.push((0, _cloneVNode2.default)(n));
        }
    }
    return newNodes || nodes;
}
function normalize(vNode) {
    var props = vNode.props;
    var children = vNode.children;
    if (props) {
        if ((0, _shared.isNullOrUndef)(children) && !(0, _shared.isNullOrUndef)(props.children)) {
            vNode.children = props.children;
        }
        if (props.ref) {
            vNode.ref = props.ref;
        }
        if (!(0, _shared.isNullOrUndef)(props.key)) {
            vNode.key = props.key;
        }
    }
    if ((0, _shared.isArray)(children)) {
        vNode.children = normalizeVNodes(children);
    }
}
function createVNode(flags, type, props, children, key, ref, noNormalise) {
    if (flags & 16 /* ComponentUnknown */) {
            flags = (0, _shared.isStatefulComponent)(type) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
        }
    var vNode = {
        children: (0, _shared.isUndefined)(children) ? null : children,
        dom: null,
        flags: flags || 0,
        key: key === undefined ? null : key,
        props: props || null,
        ref: ref || null,
        type: type
    };
    if (!noNormalise) {
        normalize(vNode);
    }
    return vNode;
}
function createVoidVNode() {
    return createVNode(4096 /* Void */);
}
function createTextVNode(text) {
    return createVNode(1 /* Text */, null, null, text);
}
function isVNode(o) {
    return !!o.flags;
}
//# sourceMappingURL=shapes.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.wrappers = undefined;
exports.default = processElement;

var _InputWrapper = __webpack_require__(17);

var _SelectWrapper = __webpack_require__(18);

var _TextareaWrapper = __webpack_require__(19);

var wrappers = exports.wrappers = new Map();
function processElement(flags, vNode, dom) {
    if (flags & 512 /* InputElement */) {
            (0, _InputWrapper.processInput)(vNode, dom);
        } else if (flags & 2048 /* SelectElement */) {
            (0, _SelectWrapper.processSelect)(vNode, dom);
        } else if (flags & 1024 /* TextareaElement */) {
            (0, _TextareaWrapper.processTextarea)(vNode, dom);
        }
}
//# sourceMappingURL=processElement.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.patch = patch;
exports.patchElement = patchElement;
exports.patchComponent = patchComponent;
exports.patchText = patchText;
exports.patchVoid = patchVoid;
exports.patchNonKeyedChildren = patchNonKeyedChildren;
exports.patchKeyedChildren = patchKeyedChildren;
exports.patchProp = patchProp;
exports.patchStyle = patchStyle;

var _shared = __webpack_require__(0);

var _mounting = __webpack_require__(7);

var _utils = __webpack_require__(8);

var _rendering = __webpack_require__(2);

var _unmounting = __webpack_require__(11);

var _constants = __webpack_require__(9);

var _shapes = __webpack_require__(3);

var _processElement = __webpack_require__(4);

var _processElement2 = _interopRequireDefault(_processElement);

var _devtools = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function patch(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    if (lastVNode !== nextVNode) {
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        if (nextFlags & 28 /* Component */) {
                if (lastFlags & 28 /* Component */) {
                        patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, nextFlags & 4 /* ComponentClass */, isRecycling);
                    } else {
                    (0, _utils.replaceVNode)(parentDom, (0, _mounting.mountComponent)(nextVNode, null, lifecycle, context, isSVG, nextFlags & 4 /* ComponentClass */), lastVNode, lifecycle);
                }
            } else if (nextFlags & 3970 /* Element */) {
                if (lastFlags & 3970 /* Element */) {
                        patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
                    } else {
                    (0, _utils.replaceVNode)(parentDom, (0, _mounting.mountElement)(nextVNode, null, lifecycle, context, isSVG), lastVNode, lifecycle);
                }
            } else if (nextFlags & 1 /* Text */) {
                if (lastFlags & 1 /* Text */) {
                        patchText(lastVNode, nextVNode);
                    } else {
                    (0, _utils.replaceVNode)(parentDom, (0, _mounting.mountText)(nextVNode, null), lastVNode, lifecycle);
                }
            } else if (nextFlags & 4096 /* Void */) {
                if (lastFlags & 4096 /* Void */) {
                        patchVoid(lastVNode, nextVNode);
                    } else {
                    (0, _utils.replaceVNode)(parentDom, (0, _mounting.mountVoid)(nextVNode, null), lastVNode, lifecycle);
                }
            } else {
            // Error case: mount new one replacing old one
            (0, _utils.replaceLastChildAndUnmount)(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
        }
    }
}
function unmountChildren(children, dom, lifecycle) {
    if ((0, _shapes.isVNode)(children)) {
        (0, _unmounting.unmount)(children, dom, lifecycle, true, false);
    } else if ((0, _shared.isArray)(children)) {
        (0, _utils.removeAllChildren)(dom, children, lifecycle, false);
    } else {
        dom.textContent = '';
    }
}
function patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    var nextTag = nextVNode.type;
    var lastTag = lastVNode.type;
    if (lastTag !== nextTag) {
        (0, _utils.replaceWithNewNode)(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
    } else {
        var dom = lastVNode.dom;
        var lastProps = lastVNode.props;
        var nextProps = nextVNode.props;
        var lastChildren = lastVNode.children;
        var nextChildren = nextVNode.children;
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        var lastRef = lastVNode.ref;
        var nextRef = nextVNode.ref;
        nextVNode.dom = dom;
        if (isSVG || nextFlags & 128 /* SvgElement */) {
            isSVG = true;
        }
        if (lastChildren !== nextChildren) {
            patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
        if (!(nextFlags & 2 /* HtmlElement */)) {
            (0, _processElement2.default)(nextFlags, nextVNode, dom);
        }
        if (lastProps !== nextProps) {
            patchProps(lastProps, nextProps, dom, lifecycle, context, isSVG);
        }
        if (nextRef) {
            if (lastRef !== nextRef || isRecycling) {
                (0, _mounting.mountRef)(dom, nextRef, lifecycle);
            }
        }
    }
}
function patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
    var patchArray = false;
    var patchKeyed = false;
    if (nextFlags & 64 /* HasNonKeyedChildren */) {
            patchArray = true;
        } else if (lastFlags & 32 /* HasKeyedChildren */ && nextFlags & 32 /* HasKeyedChildren */) {
        patchKeyed = true;
        patchArray = true;
    } else if ((0, _shared.isInvalid)(nextChildren)) {
        unmountChildren(lastChildren, dom, lifecycle);
    } else if ((0, _shared.isInvalid)(lastChildren)) {
        if ((0, _shared.isStringOrNumber)(nextChildren)) {
            (0, _utils.setTextContent)(dom, nextChildren);
        } else {
            if ((0, _shared.isArray)(nextChildren)) {
                (0, _mounting.mountArrayChildren)(nextChildren, dom, lifecycle, context, isSVG);
            } else {
                (0, _mounting.mount)(nextChildren, dom, lifecycle, context, isSVG);
            }
        }
    } else if ((0, _shared.isStringOrNumber)(nextChildren)) {
        if ((0, _shared.isStringOrNumber)(lastChildren)) {
            (0, _utils.updateTextContent)(dom, nextChildren);
        } else {
            unmountChildren(lastChildren, dom, lifecycle);
            (0, _utils.setTextContent)(dom, nextChildren);
        }
    } else if ((0, _shared.isArray)(nextChildren)) {
        if ((0, _shared.isArray)(lastChildren)) {
            patchArray = true;
            if ((0, _utils.isKeyed)(lastChildren, nextChildren)) {
                patchKeyed = true;
            }
        } else {
            unmountChildren(lastChildren, dom, lifecycle);
            (0, _mounting.mountArrayChildren)(nextChildren, dom, lifecycle, context, isSVG);
        }
    } else if ((0, _shared.isArray)(lastChildren)) {
        (0, _utils.removeAllChildren)(dom, lastChildren, lifecycle, false);
        (0, _mounting.mount)(nextChildren, dom, lifecycle, context, isSVG);
    } else if ((0, _shapes.isVNode)(nextChildren)) {
        if ((0, _shapes.isVNode)(lastChildren)) {
            patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        } else {
            unmountChildren(lastChildren, dom, lifecycle);
            (0, _mounting.mount)(nextChildren, dom, lifecycle, context, isSVG);
        }
    } else if ((0, _shapes.isVNode)(lastChildren)) {} else {}
    if (patchArray) {
        if (patchKeyed) {
            patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        } else {
            patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
    }
}
function patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isClass, isRecycling) {
    var lastType = lastVNode.type;
    var nextType = nextVNode.type;
    var nextProps = nextVNode.props || _shared.EMPTY_OBJ;
    if (lastType !== nextType) {
        if (isClass) {
            (0, _utils.replaceWithNewNode)(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
        } else {
            var lastInput = lastVNode.children._lastInput || lastVNode.children;
            var nextInput = (0, _utils.createStatelessComponentInput)(nextType, nextProps, context);
            patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling);
            var dom = nextVNode.dom = nextInput.dom;
            nextVNode.children = nextInput;
            (0, _mounting.mountStatelessComponentCallbacks)(nextVNode.ref, dom, lifecycle);
            (0, _unmounting.unmount)(lastVNode, null, lifecycle, false, true);
        }
    } else {
        if (isClass) {
            var instance = lastVNode.children;
            if (instance._unmounted) {
                if ((0, _shared.isNull)(parentDom)) {
                    return true;
                }
                (0, _utils.replaceChild)(parentDom, (0, _mounting.mountComponent)(nextVNode, null, lifecycle, context, isSVG, nextVNode.flags & 4 /* ComponentClass */), lastVNode.dom);
            } else {
                var defaultProps = nextType.defaultProps;
                var lastProps = instance.props;
                if (instance._devToolsStatus.connected && !instance._devToolsId) {
                    _devtools.componentIdMap.set(instance._devToolsId = (0, _devtools.getIncrementalId)(), instance);
                }
                lifecycle.fastUnmount = false;
                if (!(0, _shared.isUndefined)(defaultProps)) {
                    (0, _utils.copyPropsTo)(lastProps, nextProps);
                    nextVNode.props = nextProps;
                }
                var lastState = instance.state;
                var nextState = instance.state;
                var childContext = instance.getChildContext();
                nextVNode.children = instance;
                instance._isSVG = isSVG;
                if (!(0, _shared.isNullOrUndef)(childContext)) {
                    childContext = Object.assign({}, context, childContext);
                } else {
                    childContext = context;
                }
                var _lastInput = instance._lastInput;
                var _nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false);
                var didUpdate = true;
                instance._childContext = childContext;
                if ((0, _shared.isInvalid)(_nextInput)) {
                    _nextInput = (0, _shapes.createVoidVNode)();
                } else if ((0, _shared.isArray)(_nextInput)) {
                    if (process.env.NODE_ENV !== 'production') {
                        (0, _shared.throwError)('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
                    }
                    (0, _shared.throwError)();
                } else if (_nextInput === _shared.NO_OP) {
                    _nextInput = _lastInput;
                    didUpdate = false;
                }
                instance._lastInput = _nextInput;
                instance._vNode = nextVNode;
                if (didUpdate) {
                    patch(_lastInput, _nextInput, parentDom, lifecycle, childContext, isSVG, isRecycling);
                    instance.componentDidUpdate(lastProps, lastState);
                    _rendering.componentToDOMNodeMap.set(instance, _nextInput.dom);
                }
                nextVNode.dom = _nextInput.dom;
            }
        } else {
            var shouldUpdate = true;
            var _lastProps = lastVNode.props;
            var nextHooks = nextVNode.ref;
            var nextHooksDefined = !(0, _shared.isNullOrUndef)(nextHooks);
            var _lastInput2 = lastVNode.children;
            nextVNode.dom = lastVNode.dom;
            nextVNode.children = _lastInput2;
            if (nextHooksDefined && !(0, _shared.isNullOrUndef)(nextHooks.onComponentShouldUpdate)) {
                shouldUpdate = nextHooks.onComponentShouldUpdate(_lastProps, nextProps);
            }
            if (shouldUpdate !== false) {
                if (nextHooksDefined && !(0, _shared.isNullOrUndef)(nextHooks.onComponentWillUpdate)) {
                    lifecycle.fastUnmount = false;
                    nextHooks.onComponentWillUpdate(_lastProps, nextProps);
                }
                var _nextInput2 = nextType(nextProps, context);
                if ((0, _shared.isInvalid)(_nextInput2)) {
                    _nextInput2 = (0, _shapes.createVoidVNode)();
                } else if ((0, _shared.isArray)(_nextInput2)) {
                    if (process.env.NODE_ENV !== 'production') {
                        (0, _shared.throwError)('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
                    }
                    (0, _shared.throwError)();
                } else if (_nextInput2 === _shared.NO_OP) {
                    return false;
                }
                patch(_lastInput2, _nextInput2, parentDom, lifecycle, context, isSVG, isRecycling);
                nextVNode.children = _nextInput2;
                if (nextHooksDefined && !(0, _shared.isNullOrUndef)(nextHooks.onComponentDidUpdate)) {
                    lifecycle.fastUnmount = false;
                    nextHooks.onComponentDidUpdate(_lastProps, nextProps);
                }
                nextVNode.dom = _nextInput2.dom;
            }
        }
    }
    return false;
}
function patchText(lastVNode, nextVNode) {
    var nextText = nextVNode.children;
    var dom = lastVNode.dom;
    nextVNode.dom = dom;
    if (lastVNode.children !== nextText) {
        dom.nodeValue = nextText;
    }
}
function patchVoid(lastVNode, nextVNode) {
    nextVNode.dom = lastVNode.dom;
}
function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
    var lastChildrenLength = lastChildren.length;
    var nextChildrenLength = nextChildren.length;
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    for (; i < commonLength; i++) {
        var lastChild = lastChildren[i];
        var nextChild = nextChildren[i];
        patch(lastChild, nextChild, dom, lifecycle, context, isSVG, isRecycling);
    }
    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; i++) {
            var child = nextChildren[i];
            (0, _utils.appendChild)(dom, (0, _mounting.mount)(child, null, lifecycle, context, isSVG));
        }
    } else if (nextChildrenLength === 0) {
        (0, _utils.removeAllChildren)(dom, lastChildren, lifecycle, false);
    } else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; i++) {
            (0, _unmounting.unmount)(lastChildren[i], dom, lifecycle, false, false);
        }
    }
}
function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, isRecycling) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i = void 0;
    var j = void 0;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    var aNode = void 0;
    var bNode = void 0;
    var nextNode = void 0;
    var nextPos = void 0;
    var node = void 0;
    if (aLength === 0) {
        if (bLength !== 0) {
            (0, _mounting.mountArrayChildren)(b, dom, lifecycle, context, isSVG);
        }
        return;
    } else if (bLength === 0) {
        (0, _utils.removeAllChildren)(dom, a, lifecycle, false);
        return;
    }
    // Step 1
    /* eslint no-constant-condition: 0 */
    outer: while (true) {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }
        // Move and sync nodes from right to left.
        if (aEndNode.key === bStartNode.key) {
            patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
            (0, _utils.insertOrAppend)(dom, bStartNode.dom, aStartNode.dom);
            aEnd--;
            bStart++;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            continue;
        }
        // Move and sync nodes from left to right.
        if (aStartNode.key === bEndNode.key) {
            patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            (0, _utils.insertOrAppend)(dom, bEndNode.dom, nextNode);
            aStart++;
            bEnd--;
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            continue;
        }
        break;
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            while (bStart <= bEnd) {
                (0, _utils.insertOrAppend)(dom, (0, _mounting.mount)(b[bStart++], null, lifecycle, context, isSVG), nextNode);
            }
        }
    } else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            (0, _unmounting.unmount)(a[aStart++], dom, lifecycle, false, false);
        }
    } else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        var aNullable = a;
        var sources = new Array(bLength);
        // Mark all nodes as inserted.
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;
        if (bLength <= 4 || aLength * bLength <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            } else {
                                pos = j;
                            }
                            patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
                            patched++;
                            aNullable[i] = null;
                            break;
                        }
                    }
                }
            }
        } else {
            var keyIndex = new Map();
            for (i = bStart; i <= bEnd; i++) {
                node = b[i];
                keyIndex.set(node.key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex.get(aNode.key);
                    if (!(0, _shared.isUndefined)(j)) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
                        patched++;
                        aNullable[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            (0, _utils.removeAllChildren)(dom, a, lifecycle, false);
            while (bStart < bLength) {
                (0, _utils.insertOrAppend)(dom, (0, _mounting.mount)(b[bStart++], null, lifecycle, context, isSVG), null);
            }
        } else {
            i = aLength - patched;
            while (i > 0) {
                aNode = aNullable[aStart++];
                if (!(0, _shared.isNull)(aNode)) {
                    (0, _unmounting.unmount)(aNode, dom, lifecycle, false, false);
                    i--;
                }
            }
            if (moved) {
                var seq = lis_algorithm(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        (0, _utils.insertOrAppend)(dom, (0, _mounting.mount)(node, dom, lifecycle, context, isSVG), nextNode);
                    } else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            nextNode = nextPos < b.length ? b[nextPos].dom : null;
                            (0, _utils.insertOrAppend)(dom, node.dom, nextNode);
                        } else {
                            j--;
                        }
                    }
                }
            } else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        (0, _utils.insertOrAppend)(dom, (0, _mounting.mount)(node, null, lifecycle, context, isSVG), nextNode);
                    }
                }
            }
        }
    }
}
// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
    var p = a.slice(0);
    var result = [];
    result.push(0);
    var i = void 0;
    var j = void 0;
    var u = void 0;
    var v = void 0;
    var c = void 0;
    for (i = 0; i < a.length; i++) {
        if (a[i] === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (a[j] < a[i]) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = (u + v) / 2 | 0;
            if (a[result[c]] < a[i]) {
                u = c + 1;
            } else {
                v = c;
            }
        }
        if (a[i] < a[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
// these are handled by other parts of Inferno, e.g. input wrappers
var skipProps = {
    children: true,
    ref: true,
    key: true,
    selected: true,
    checked: true,
    value: true,
    multiple: true
};
function patchProp(prop, lastValue, nextValue, dom, isSVG) {
    if (skipProps[prop]) {
        return;
    }
    if (_constants.booleanProps[prop]) {
        dom[prop] = nextValue ? true : false;
    } else if (_constants.strictProps[prop]) {
        var value = (0, _shared.isNullOrUndef)(nextValue) ? '' : nextValue;
        if (dom[prop] !== value) {
            dom[prop] = value;
        }
    } else if (lastValue !== nextValue) {
        if ((0, _shared.isNullOrUndef)(nextValue)) {
            dom.removeAttribute(prop);
        } else if (prop === 'className') {
            if (isSVG) {
                dom.setAttribute('class', nextValue);
            } else {
                dom.className = nextValue;
            }
        } else if (prop === 'style') {
            patchStyle(lastValue, nextValue, dom);
        } else if ((0, _shared.isAttrAnEvent)(prop)) {
            var eventName = prop.toLowerCase();
            var event = dom[eventName];
            if (!event || !event.wrapped) {
                dom[eventName] = nextValue;
            }
        } else if (prop === 'dangerouslySetInnerHTML') {
            var lastHtml = lastValue && lastValue.__html;
            var nextHtml = nextValue && nextValue.__html;
            if ((0, _shared.isNullOrUndef)(nextHtml)) {
                if (process.env.NODE_ENV !== 'production') {
                    (0, _shared.throwError)('dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.');
                }
                (0, _shared.throwError)();
            }
            if (lastHtml !== nextHtml) {
                dom.innerHTML = nextHtml;
            }
        } else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
            var ns = _constants.namespaces[prop];
            if (ns) {
                dom.setAttributeNS(ns, prop, nextValue);
            } else {
                dom.setAttribute(prop, nextValue);
            }
        }
    }
}
function patchProps(lastProps, nextProps, dom, lifecycle, context, isSVG) {
    lastProps = lastProps || _shared.EMPTY_OBJ;
    nextProps = nextProps || _shared.EMPTY_OBJ;
    if (nextProps !== _shared.EMPTY_OBJ) {
        for (var prop in nextProps) {
            // do not add a hasOwnProperty check here, it affects performance
            var nextValue = nextProps[prop];
            var lastValue = lastProps[prop];
            if ((0, _shared.isNullOrUndef)(nextValue)) {
                removeProp(prop, dom);
            } else {
                patchProp(prop, lastValue, nextValue, dom, isSVG);
            }
        }
    }
    if (lastProps !== _shared.EMPTY_OBJ) {
        for (var _prop in lastProps) {
            // do not add a hasOwnProperty check here, it affects performance
            if ((0, _shared.isNullOrUndef)(nextProps[_prop])) {
                removeProp(_prop, dom);
            }
        }
    }
}
// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    if ((0, _shared.isString)(nextAttrValue)) {
        dom.style.cssText = nextAttrValue;
    } else if ((0, _shared.isNullOrUndef)(lastAttrValue)) {
        for (var style in nextAttrValue) {
            // do not add a hasOwnProperty check here, it affects performance
            var value = nextAttrValue[style];
            if ((0, _shared.isNumber)(value) && !_constants.isUnitlessNumber[style]) {
                dom.style[style] = value + 'px';
            } else {
                dom.style[style] = value;
            }
        }
    } else {
        for (var _style in nextAttrValue) {
            // do not add a hasOwnProperty check here, it affects performance
            var _value = nextAttrValue[_style];
            if ((0, _shared.isNumber)(_value) && !_constants.isUnitlessNumber[_style]) {
                dom.style[_style] = _value + 'px';
            } else {
                dom.style[_style] = _value;
            }
        }
        for (var _style2 in lastAttrValue) {
            if ((0, _shared.isNullOrUndef)(nextAttrValue[_style2])) {
                dom.style[_style2] = '';
            }
        }
    }
}
function removeProp(prop, dom) {
    if (prop === 'className') {
        dom.removeAttribute('class');
    } else if (prop === 'value') {
        dom.value = '';
    } else if (prop === 'style') {
        dom.style = '';
        dom.removeAttribute('style');
    } else {
        dom.removeAttribute(prop);
    }
}
//# sourceMappingURL=patching.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.componentIdMap = exports.devToolsStatus = undefined;
exports.getIncrementalId = getIncrementalId;
exports.initDevToolsHooks = initDevToolsHooks;
exports.sendRoots = sendRoots;

var _shared = __webpack_require__(0);

var _rendering = __webpack_require__(2);

var devToolsStatus = exports.devToolsStatus = {
    connected: false
};
var internalIncrementer = {
    id: 0
};
var componentIdMap = exports.componentIdMap = new Map();
function getIncrementalId() {
    return internalIncrementer.id++;
}
function sendToDevTools(global, data) {
    var event = new CustomEvent('inferno.client.message', {
        detail: JSON.stringify(data, function (key, val) {
            if (!(0, _shared.isNull)(val) && !(0, _shared.isUndefined)(val)) {
                if (key === '_vComponent' || !(0, _shared.isUndefined)(val.nodeType)) {
                    return;
                } else if ((0, _shared.isFunction)(val)) {
                    return '$$f:' + val.name;
                }
            }
            return val;
        })
    });
    global.dispatchEvent(event);
}
function rerenderRoots() {
    for (var i = 0; i < _rendering.roots.length; i++) {
        var root = _rendering.roots[i];
        (0, _rendering.render)(root.input, root.dom);
    }
}
function initDevToolsHooks(global) {
    global.__INFERNO_DEVTOOLS_GLOBAL_HOOK__ = _rendering.roots;
    global.addEventListener('inferno.devtools.message', function (message) {
        var detail = JSON.parse(message.detail);
        var type = detail.type;
        switch (type) {
            case 'get-roots':
                if (!devToolsStatus.connected) {
                    devToolsStatus.connected = true;
                    rerenderRoots();
                    sendRoots(global);
                }
                break;
            default:
                // TODO:?
                break;
        }
    });
}
function sendRoots(global) {
    sendToDevTools(global, { type: 'roots', data: _rendering.roots });
}
//# sourceMappingURL=devtools.js.map

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.mount = mount;
exports.mountText = mountText;
exports.mountVoid = mountVoid;
exports.mountElement = mountElement;
exports.mountArrayChildren = mountArrayChildren;
exports.mountComponent = mountComponent;
exports.mountStatefulComponentCallbacks = mountStatefulComponentCallbacks;
exports.mountStatelessComponentCallbacks = mountStatelessComponentCallbacks;
exports.mountRef = mountRef;

var _shared = __webpack_require__(0);

var _utils = __webpack_require__(8);

var _patching = __webpack_require__(5);

var _rendering = __webpack_require__(2);

var _recycling = __webpack_require__(10);

var _devtools = __webpack_require__(6);

var _shapes = __webpack_require__(3);

var _processElement = __webpack_require__(4);

var _processElement2 = _interopRequireDefault(_processElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mount(vNode, parentDom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    if (flags & 3970 /* Element */) {
            return mountElement(vNode, parentDom, lifecycle, context, isSVG);
        } else if (flags & 28 /* Component */) {
            return mountComponent(vNode, parentDom, lifecycle, context, isSVG, flags & 4 /* ComponentClass */);
        } else if (flags & 4096 /* Void */) {
            return mountVoid(vNode, parentDom);
        } else if (flags & 1 /* Text */) {
            return mountText(vNode, parentDom);
        } else {
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('mount() expects a valid VNode, instead it received an object with the type "' + (typeof vNode === 'undefined' ? 'undefined' : _typeof(vNode)) + '".');
        }
        (0, _shared.throwError)();
    }
}
function mountText(vNode, parentDom) {
    var dom = document.createTextNode(vNode.children);
    vNode.dom = dom;
    if (parentDom) {
        (0, _utils.appendChild)(parentDom, dom);
    }
    return dom;
}
function mountVoid(vNode, parentDom) {
    var dom = document.createTextNode('');
    vNode.dom = dom;
    if (parentDom) {
        (0, _utils.appendChild)(parentDom, dom);
    }
    return dom;
}
function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
    if (_recycling.recyclingEnabled) {
        var _dom = (0, _recycling.recycleElement)(vNode, lifecycle, context, isSVG);
        if (!(0, _shared.isNull)(_dom)) {
            if (!(0, _shared.isNull)(parentDom)) {
                (0, _utils.appendChild)(parentDom, _dom);
            }
            return _dom;
        }
    }
    var tag = vNode.type;
    var flags = vNode.flags;
    if (isSVG || flags & 128 /* SvgElement */) {
        isSVG = true;
    }
    var dom = (0, _utils.documentCreateElement)(tag, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var ref = vNode.ref;
    vNode.dom = dom;
    if (!(0, _shared.isNull)(children)) {
        if ((0, _shared.isStringOrNumber)(children)) {
            (0, _utils.setTextContent)(dom, children);
        } else if ((0, _shared.isArray)(children)) {
            mountArrayChildren(children, dom, lifecycle, context, isSVG);
        } else if ((0, _shapes.isVNode)(children)) {
            mount(children, dom, lifecycle, context, isSVG);
        }
    }
    if (!(flags & 2 /* HtmlElement */)) {
        (0, _processElement2.default)(flags, vNode, dom);
    }
    if (!(0, _shared.isNull)(props)) {
        for (var prop in props) {
            // do not add a hasOwnProperty check here, it affects performance
            (0, _patching.patchProp)(prop, null, props[prop], dom, isSVG);
        }
    }
    if (!(0, _shared.isNull)(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (!(0, _shared.isNull)(parentDom)) {
        (0, _utils.appendChild)(parentDom, dom);
    }
    return dom;
}
function mountArrayChildren(children, dom, lifecycle, context, isSVG) {
    for (var i = 0; i < children.length; i++) {
        mount(children[i], dom, lifecycle, context, isSVG);
    }
}
function mountComponent(vNode, parentDom, lifecycle, context, isSVG, isClass) {
    if (_recycling.recyclingEnabled) {
        var _dom2 = (0, _recycling.recycleComponent)(vNode, lifecycle, context, isSVG);
        if (!(0, _shared.isNull)(_dom2)) {
            if (!(0, _shared.isNull)(parentDom)) {
                (0, _utils.appendChild)(parentDom, _dom2);
            }
            return _dom2;
        }
    }
    var type = vNode.type;
    var props = vNode.props || _shared.EMPTY_OBJ;
    var ref = vNode.ref;
    var dom = void 0;
    if (isClass) {
        var defaultProps = type.defaultProps;
        lifecycle.fastUnmount = false;
        if (!(0, _shared.isUndefined)(defaultProps)) {
            (0, _utils.copyPropsTo)(defaultProps, props);
            vNode.props = props;
        }
        var instance = (0, _utils.createStatefulComponentInstance)(type, props, context, isSVG, _devtools.devToolsStatus);
        var input = instance._lastInput;
        instance._vNode = vNode;
        vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
        if (!(0, _shared.isNull)(parentDom)) {
            (0, _utils.appendChild)(parentDom, dom);
        }
        mountStatefulComponentCallbacks(ref, instance, lifecycle);
        _rendering.componentToDOMNodeMap.set(instance, dom);
        vNode.children = instance;
    } else {
        var _input = (0, _utils.createStatelessComponentInput)(type, props, context);
        vNode.dom = dom = mount(_input, null, lifecycle, context, isSVG);
        vNode.children = _input;
        mountStatelessComponentCallbacks(ref, dom, lifecycle);
        if (!(0, _shared.isNull)(parentDom)) {
            (0, _utils.appendChild)(parentDom, dom);
        }
    }
    return dom;
}
function mountStatefulComponentCallbacks(ref, instance, lifecycle) {
    if (ref) {
        if ((0, _shared.isFunction)(ref)) {
            lifecycle.addListener(function () {
                return ref(instance);
            });
        } else {
            if (process.env.NODE_ENV !== 'production') {
                (0, _shared.throwError)('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
            }
            (0, _shared.throwError)();
        }
    }
    if (!(0, _shared.isNull)(instance.componentDidMount)) {
        lifecycle.addListener(function () {
            instance.componentDidMount();
        });
    }
}
function mountStatelessComponentCallbacks(ref, dom, lifecycle) {
    if (ref) {
        if (!(0, _shared.isNullOrUndef)(ref.onComponentWillMount)) {
            lifecycle.fastUnmount = false;
            ref.onComponentWillMount();
        }
        if (!(0, _shared.isNullOrUndef)(ref.onComponentDidMount)) {
            lifecycle.fastUnmount = false;
            lifecycle.addListener(function () {
                return ref.onComponentDidMount(dom);
            });
        }
    }
}
function mountRef(dom, value, lifecycle) {
    if ((0, _shared.isFunction)(value)) {
        lifecycle.fastUnmount = false;
        lifecycle.addListener(function () {
            return value(dom);
        });
    } else {
        if ((0, _shared.isInvalid)(value)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
        (0, _shared.throwError)();
    }
}
//# sourceMappingURL=mounting.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.copyPropsTo = copyPropsTo;
exports.createStatefulComponentInstance = createStatefulComponentInstance;
exports.replaceLastChildAndUnmount = replaceLastChildAndUnmount;
exports.replaceVNode = replaceVNode;
exports.createStatelessComponentInput = createStatelessComponentInput;
exports.setTextContent = setTextContent;
exports.updateTextContent = updateTextContent;
exports.appendChild = appendChild;
exports.insertOrAppend = insertOrAppend;
exports.documentCreateElement = documentCreateElement;
exports.replaceWithNewNode = replaceWithNewNode;
exports.replaceChild = replaceChild;
exports.removeChild = removeChild;
exports.removeAllChildren = removeAllChildren;
exports.removeChildren = removeChildren;
exports.isKeyed = isKeyed;

var _mounting = __webpack_require__(7);

var _patching = __webpack_require__(5);

var _shared = __webpack_require__(0);

var _unmounting = __webpack_require__(11);

var _shapes = __webpack_require__(3);

var _rendering = __webpack_require__(2);

var _constants = __webpack_require__(9);

function copyPropsTo(copyFrom, copyTo) {
    for (var prop in copyFrom) {
        if ((0, _shared.isUndefined)(copyTo[prop])) {
            copyTo[prop] = copyFrom[prop];
        }
    }
}
function createStatefulComponentInstance(Component, props, context, isSVG, devToolsStatus) {
    var instance = new Component(props, context);
    instance.context = context;
    instance._patch = _patching.patch;
    instance._devToolsStatus = devToolsStatus;
    instance._componentToDOMNodeMap = _rendering.componentToDOMNodeMap;
    var childContext = instance.getChildContext();
    if (!(0, _shared.isNullOrUndef)(childContext)) {
        instance._childContext = Object.assign({}, context, childContext);
    } else {
        instance._childContext = context;
    }
    instance._unmounted = false;
    instance._pendingSetState = true;
    instance._isSVG = isSVG;
    instance.componentWillMount();
    instance.beforeRender && instance.beforeRender();
    var input = instance.render(props, context);
    instance.afterRender && instance.afterRender();
    if ((0, _shared.isArray)(input)) {
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
        }
        (0, _shared.throwError)();
    } else if ((0, _shared.isInvalid)(input)) {
        input = (0, _shapes.createVoidVNode)();
    }
    instance._pendingSetState = false;
    instance._lastInput = input;
    return instance;
}
function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
    replaceVNode(parentDom, (0, _mounting.mount)(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle);
}
function replaceVNode(parentDom, dom, vNode, lifecycle) {
    var shallowUnmount = false;
    // we cannot cache nodeType here as vNode might be re-assigned below
    if (vNode.flags & 28 /* Component */) {
            // if we are accessing a stateful or stateless component, we want to access their last rendered input
            // accessing their DOM node is not useful to us here
            (0, _unmounting.unmount)(vNode, null, lifecycle, false, false);
            vNode = vNode.children._lastInput || vNode.children;
            shallowUnmount = true;
        }
    replaceChild(parentDom, dom, vNode.dom);
    (0, _unmounting.unmount)(vNode, null, lifecycle, false, shallowUnmount);
}
function createStatelessComponentInput(component, props, context) {
    var input = component(props, context);
    if ((0, _shared.isArray)(input)) {
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
        }
        (0, _shared.throwError)();
    } else if ((0, _shared.isInvalid)(input)) {
        input = (0, _shapes.createVoidVNode)();
    }
    return input;
}
function setTextContent(dom, text) {
    if (text !== '') {
        dom.textContent = text;
    } else {
        dom.appendChild(document.createTextNode(''));
    }
}
function updateTextContent(dom, text) {
    dom.firstChild.nodeValue = text;
}
function appendChild(parentDom, dom) {
    parentDom.appendChild(dom);
}
function insertOrAppend(parentDom, newNode, nextNode) {
    if ((0, _shared.isNullOrUndef)(nextNode)) {
        appendChild(parentDom, newNode);
    } else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
function documentCreateElement(tag, isSVG) {
    if (isSVG === true) {
        return document.createElementNS(_constants.svgNS, tag);
    } else {
        return document.createElement(tag);
    }
}
function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG) {
    var lastInstance = null;
    var instanceLastNode = lastNode._lastInput;
    if (!(0, _shared.isNullOrUndef)(instanceLastNode)) {
        lastInstance = lastNode;
        lastNode = instanceLastNode;
    }
    (0, _unmounting.unmount)(lastNode, null, lifecycle, false, false);
    var dom = (0, _mounting.mount)(nextNode, null, lifecycle, context, isSVG);
    nextNode.dom = dom;
    replaceChild(parentDom, dom, lastNode.dom);
    if (lastInstance !== null) {
        lastInstance._lasInput = nextNode;
    }
}
function replaceChild(parentDom, nextDom, lastDom) {
    if (!parentDom) {
        parentDom = lastDom.parentNode;
    }
    parentDom.replaceChild(nextDom, lastDom);
}
function removeChild(parentDom, dom) {
    parentDom.removeChild(dom);
}
function removeAllChildren(dom, children, lifecycle, shallowUnmount) {
    dom.textContent = '';
    if (!lifecycle.fastUnmount) {
        removeChildren(null, children, lifecycle, shallowUnmount);
    }
}
function removeChildren(dom, children, lifecycle, shallowUnmount) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!(0, _shared.isInvalid)(child)) {
            (0, _unmounting.unmount)(child, dom, lifecycle, true, shallowUnmount);
        }
    }
}
function isKeyed(lastChildren, nextChildren) {
    return nextChildren.length && !(0, _shared.isNullOrUndef)(nextChildren[0]) && !(0, _shared.isNullOrUndef)(nextChildren[0].key) && lastChildren.length && !(0, _shared.isNullOrUndef)(lastChildren[0]) && !(0, _shared.isNullOrUndef)(lastChildren[0].key);
}
//# sourceMappingURL=utils.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 9 */
/***/ function(module, exports) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function constructDefaults(string, object, value) {
    /* eslint no-return-assign: 0 */
    string.split(',').forEach(function (i) {
        return object[i] = value;
    });
}
var xlinkNS = exports.xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = exports.xmlNS = 'http://www.w3.org/XML/1998/namespace';
var svgNS = exports.svgNS = 'http://www.w3.org/2000/svg';
var strictProps = exports.strictProps = {};
var booleanProps = exports.booleanProps = {};
var namespaces = exports.namespaces = {};
var isUnitlessNumber = exports.isUnitlessNumber = {};
constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,defaultValue,defaultChecked', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readonly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);
//# sourceMappingURL=constants.js.map

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.recyclingEnabled = undefined;
exports.disableRecycling = disableRecycling;
exports.enableRecycling = enableRecycling;
exports.recycleElement = recycleElement;
exports.poolElement = poolElement;
exports.recycleComponent = recycleComponent;
exports.poolComponent = poolComponent;

var _shared = __webpack_require__(0);

var _patching = __webpack_require__(5);

var recyclingEnabled = exports.recyclingEnabled = true;
var componentPools = new Map();
var elementPools = new Map();
function disableRecycling() {
    exports.recyclingEnabled = recyclingEnabled = false;
    componentPools.clear();
    elementPools.clear();
}
function enableRecycling() {
    exports.recyclingEnabled = recyclingEnabled = true;
}
function recycleElement(vNode, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var key = vNode.key;
    var pools = elementPools.get(tag);
    if (!(0, _shared.isUndefined)(pools)) {
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!(0, _shared.isUndefined)(pool)) {
            var recycledVNode = pool.pop();
            if (!(0, _shared.isUndefined)(recycledVNode)) {
                (0, _patching.patchElement)(recycledVNode, vNode, null, lifecycle, context, isSVG, true);
                return vNode.dom;
            }
        }
    }
    return null;
}
function poolElement(vNode) {
    var tag = vNode.type;
    var key = vNode.key;
    var pools = elementPools.get(tag);
    if ((0, _shared.isUndefined)(pools)) {
        pools = {
            nonKeyed: [],
            keyed: new Map()
        };
        elementPools.set(tag, pools);
    }
    if ((0, _shared.isNull)(key)) {
        pools.nonKeyed.push(vNode);
    } else {
        var pool = pools.keyed.get(key);
        if ((0, _shared.isUndefined)(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vNode);
    }
}
function recycleComponent(vNode, lifecycle, context, isSVG) {
    var type = vNode.type;
    var key = vNode.key;
    var pools = componentPools.get(type);
    if (!(0, _shared.isUndefined)(pools)) {
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!(0, _shared.isUndefined)(pool)) {
            var recycledVNode = pool.pop();
            if (!(0, _shared.isUndefined)(recycledVNode)) {
                var flags = vNode.flags;
                var failed = (0, _patching.patchComponent)(recycledVNode, vNode, null, lifecycle, context, isSVG, flags & 4 /* ComponentClass */, true);
                if (!failed) {
                    return vNode.dom;
                }
            }
        }
    }
    return null;
}
function poolComponent(vNode) {
    var type = vNode.type;
    var key = vNode.key;
    var hooks = vNode.ref;
    var nonRecycleHooks = hooks && (hooks.onComponentWillMount || hooks.onComponentWillUnmount || hooks.onComponentDidMount || hooks.onComponentWillUpdate || hooks.onComponentDidUpdate);
    if (nonRecycleHooks) {
        return;
    }
    var pools = componentPools.get(type);
    if ((0, _shared.isUndefined)(pools)) {
        pools = {
            nonKeyed: [],
            keyed: new Map()
        };
        componentPools.set(type, pools);
    }
    if ((0, _shared.isNull)(key)) {
        pools.nonKeyed.push(vNode);
    } else {
        var pool = pools.keyed.get(key);
        if ((0, _shared.isUndefined)(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vNode);
    }
}
//# sourceMappingURL=recycling.js.map

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unmount = unmount;
exports.unmountComponent = unmountComponent;
exports.unmountElement = unmountElement;

var _shared = __webpack_require__(0);

var _utils = __webpack_require__(8);

var _rendering = __webpack_require__(2);

var _recycling = __webpack_require__(10);

function unmount(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
            unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount);
        } else if (flags & 3970 /* Element */) {
            unmountElement(vNode, parentDom, lifecycle, canRecycle, shallowUnmount);
        } else if (flags & 1 /* Text */) {
            unmountText(vNode, parentDom);
        } else if (flags & 4096 /* Void */) {
            unmountVoid(vNode, parentDom);
        }
}
function unmountVoid(vNode, parentDom) {
    if (parentDom) {
        (0, _utils.removeChild)(parentDom, vNode.dom);
    }
}
function unmountText(vNode, parentDom) {
    if (parentDom) {
        (0, _utils.removeChild)(parentDom, vNode.dom);
    }
}
function unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var instance = vNode.children;
    var hooks = vNode.ref;
    if (!shallowUnmount && !lifecycle.fastUnmount) {
        if (instance.render !== undefined) {
            var ref = vNode.ref;
            if (ref) {
                ref(null);
            }
            instance.componentWillUnmount();
            instance._unmounted = true;
            _rendering.componentToDOMNodeMap.delete(instance);
            unmount(instance._lastInput, null, lifecycle, false, shallowUnmount);
        } else {
            unmount(instance, null, lifecycle, false, shallowUnmount);
        }
        hooks = vNode.ref || instance.ref;
    }
    if (!(0, _shared.isNullOrUndef)(hooks)) {
        if (!(0, _shared.isNullOrUndef)(hooks.onComponentWillUnmount)) {
            hooks.onComponentWillUnmount();
        }
    }
    if (parentDom) {
        var lastInput = instance._lastInput;
        if ((0, _shared.isNullOrUndef)(lastInput)) {
            lastInput = instance;
        }
        (0, _utils.removeChild)(parentDom, vNode.dom);
    }
    if (_recycling.recyclingEnabled && (parentDom || canRecycle)) {
        (0, _recycling.poolComponent)(vNode);
    }
}
function unmountElement(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var dom = vNode.dom;
    var ref = vNode.ref;
    if (!shallowUnmount && !lifecycle.fastUnmount) {
        if (ref) {
            unmountRef(ref);
        }
        var children = vNode.children;
        if (!(0, _shared.isNullOrUndef)(children)) {
            unmountChildren(children, lifecycle, shallowUnmount);
        }
    }
    if (parentDom) {
        (0, _utils.removeChild)(parentDom, dom);
    }
    if (_recycling.recyclingEnabled && (parentDom || canRecycle)) {
        (0, _recycling.poolElement)(vNode);
    }
}
function unmountChildren(children, lifecycle, shallowUnmount) {
    if ((0, _shared.isArray)(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if ((0, _shared.isObject)(child)) {
                unmount(child, null, lifecycle, false, shallowUnmount);
            }
        }
    } else if ((0, _shared.isObject)(children)) {
        unmount(children, null, lifecycle, false, shallowUnmount);
    }
}
function unmountRef(ref) {
    if ((0, _shared.isFunction)(ref)) {
        ref(null);
    } else {
        if ((0, _shared.isInvalid)(ref)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
        (0, _shared.throwError)();
    }
}
//# sourceMappingURL=unmounting.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = cloneVNode;

var _shared = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function cloneVNode(vNodeToClone, props) {
    for (var _len = arguments.length, _children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        _children[_key - 2] = arguments[_key];
    }

    var children = _children;
    if (_children.length > 0 && !(0, _shared.isNull)(_children[0])) {
        if (!props) {
            props = {};
        }
        if (_children.length === 1) {
            children = _children[0];
        }
        if ((0, _shared.isUndefined)(props.children)) {
            props.children = children;
        } else {
            if ((0, _shared.isArray)(children)) {
                if ((0, _shared.isArray)(props.children)) {
                    props.children = props.children.concat(children);
                } else {
                    props.children = [props.children].concat(children);
                }
            } else {
                if ((0, _shared.isArray)(props.children)) {
                    props.children.push(children);
                } else {
                    props.children = [props.children];
                    props.children.push(children);
                }
            }
        }
    }
    children = null;
    var newVNode = void 0;
    if ((0, _shared.isArray)(vNodeToClone)) {
        newVNode = vNodeToClone.map(function (vNode) {
            return cloneVNode(vNode);
        });
    } else if ((0, _shared.isNullOrUndef)(props) && (0, _shared.isNullOrUndef)(children)) {
        newVNode = Object.assign({}, vNodeToClone);
    } else {
        var flags = vNodeToClone.flags;
        if (flags & 28 /* Component */) {
                newVNode = (0, _shapes.createVNode)(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), null, vNodeToClone.key, vNodeToClone.ref, true);
            } else if (flags & 3970 /* Element */) {
                children = props && props.children || vNodeToClone.children;
                newVNode = (0, _shapes.createVNode)(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), children, vNodeToClone.key, vNodeToClone.ref, !children);
            }
    }
    newVNode.dom = null;
    return newVNode;
}
//# sourceMappingURL=cloneVNode.js.map

/***/ },
/* 13 */
/***/ function(module, exports) {

"use strict";
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lifecycle = function () {
    function Lifecycle() {
        _classCallCheck(this, Lifecycle);

        this.listeners = [];
        this.fastUnmount = true;
    }

    _createClass(Lifecycle, [{
        key: "addListener",
        value: function addListener(callback) {
            this.listeners.push(callback);
        }
    }, {
        key: "trigger",
        value: function trigger() {
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i]();
            }
        }
    }]);

    return Lifecycle;
}();
//# sourceMappingURL=lifecycle.js.map


exports.default = Lifecycle;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _es = __webpack_require__(20);

var _es2 = _interopRequireDefault(_es);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _es2.default;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _shared = __webpack_require__(0);

var _rendering = __webpack_require__(2);

var _cloneVNode = __webpack_require__(12);

var _cloneVNode2 = _interopRequireDefault(_cloneVNode);

var _shapes = __webpack_require__(3);

var _recycling = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { initDevToolsHooks }  from '../../../src/DOM/devtools';

if (_shared.isBrowser) {
	window.process = {
		env: {
			NODE_ENV: 'development'
		}
	};
	// initDevToolsHooks(window);
}

if (process.env.NODE_ENV !== 'production') {
	var testFunc = function testFn() {};
	(0, _shared.warning)((testFunc.name || testFunc.toString()).indexOf('testFn') !== -1, 'It looks like you\'re using a minified copy of the development build ' + 'of Inferno. When deploying Inferno apps to production, make sure to use ' + 'the production build which skips development warnings and is faster. ' + 'See http://infernojs.org/guides/installation for more details.');
}

exports.default = {
	// core shapes
	createVNode: _shapes.createVNode,

	// cloning
	cloneVNode: _cloneVNode2.default,

	// TODO do we still need this? can we remove?
	NO_OP: _shared.NO_OP,

	//DOM
	render: _rendering.render,
	findDOMNode: _rendering.findDOMNode,
	createRenderer: _rendering.createRenderer,
	disableRecycling: _recycling.disableRecycling
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.normaliseChildNodes = normaliseChildNodes;
exports.default = hydrateRoot;

var _shared = __webpack_require__(0);

var _utils = __webpack_require__(8);

var _mounting = __webpack_require__(7);

var _patching = __webpack_require__(5);

var _rendering = __webpack_require__(2);

var _constants = __webpack_require__(9);

var _processElement = __webpack_require__(4);

var _processElement2 = _interopRequireDefault(_processElement);

var _devtools = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function normaliseChildNodes(dom) {
    var rawChildNodes = dom.childNodes;
    var length = rawChildNodes.length;
    var i = 0;
    while (i < length) {
        var rawChild = rawChildNodes[i];
        if (rawChild.nodeType === 8) {
            if (rawChild.data === '!') {
                var placeholder = document.createTextNode('');
                dom.replaceChild(placeholder, rawChild);
                i++;
            } else {
                dom.removeChild(rawChild);
                length--;
            }
        } else {
            i++;
        }
    }
}
function hydrateComponent(vNode, dom, lifecycle, context, isSVG, isClass) {
    var type = vNode.type;
    var props = vNode.props;
    var ref = vNode.ref;
    vNode.dom = dom;
    if (isClass) {
        var _isSVG = dom.namespaceURI === _constants.svgNS;
        var defaultProps = type.defaultProps;
        lifecycle.fastUnmount = false;
        if (!(0, _shared.isUndefined)(defaultProps)) {
            (0, _utils.copyPropsTo)(defaultProps, props);
            vNode.props = props;
        }
        var instance = (0, _utils.createStatefulComponentInstance)(type, props, context, _isSVG, _devtools.devToolsStatus);
        var input = instance._lastInput;
        instance._vComponent = vNode;
        instance._vNode = vNode;
        hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
        (0, _mounting.mountStatefulComponentCallbacks)(ref, instance, lifecycle);
        _rendering.componentToDOMNodeMap.set(instance, dom);
        vNode.children = instance;
    } else {
        var _input = (0, _utils.createStatelessComponentInput)(type, props, context);
        hydrate(_input, dom, lifecycle, context, isSVG);
        vNode.children = _input;
        vNode.dom = _input.dom;
        (0, _mounting.mountStatelessComponentCallbacks)(ref, dom, lifecycle);
    }
}
function hydrateElement(vNode, dom, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var children = vNode.children;
    var props = vNode.props;
    var flags = vNode.flags;
    vNode.dom = dom;
    if (isSVG || flags & 128 /* SvgElement */) {
        isSVG = true;
    }
    if (dom.tagName.toLowerCase() !== tag) {
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('hydrateElement() failed due to mismatch on DOM element tag name. Ensure server-side logic matches client side logic.');
        }
    }
    if (children) {
        hydrateChildren(children, dom, lifecycle, context, isSVG);
    }
    if (!(flags & 2 /* HtmlElement */)) {
        (0, _processElement2.default)(flags, vNode, dom);
    }
    for (var prop in props) {
        var value = props[prop];
        if (prop === 'key') {} else if (prop === 'ref') {} else if (prop === 'children') {} else {
            (0, _patching.patchProp)(prop, null, value, dom, isSVG);
        }
    }
}
function hydrateChildren(children, dom, lifecycle, context, isSVG) {
    normaliseChildNodes(dom);
    var domNodes = Array.prototype.slice.call(dom.childNodes);
    if ((0, _shared.isArray)(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if ((0, _shared.isObject)(child)) {
                hydrate(child, domNodes[i], lifecycle, context, isSVG);
            }
        }
    } else if ((0, _shared.isObject)(children)) {
        hydrate(children, dom.firstChild, lifecycle, context, isSVG);
    }
}
function hydrateText(vNode, dom) {
    vNode.dom = dom;
}
function hydrateVoid(vNode, dom) {
    vNode.dom = dom;
}
function hydrate(vNode, dom, lifecycle, context, isSVG) {
    if (process.env.NODE_ENV !== 'production') {
        if ((0, _shared.isInvalid)(dom)) {
            (0, _shared.throwError)('failed to hydrate. The server-side render doesn\'t match client side.');
        }
    }
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
            return hydrateComponent(vNode, dom, lifecycle, context, isSVG, flags & 4 /* ComponentClass */);
        } else if (flags & 3970 /* Element */) {
            return hydrateElement(vNode, dom, lifecycle, context, isSVG);
        } else if (flags & 1 /* Text */) {
            return hydrateText(vNode, dom);
        } else if (flags & 4096 /* Void */) {
            return hydrateVoid(vNode, dom);
        } else {
        if (process.env.NODE_ENV !== 'production') {
            (0, _shared.throwError)('hydrate() expects a valid VNode, instead it received an object with the type "' + (typeof vNode === 'undefined' ? 'undefined' : _typeof(vNode)) + '".');
        }
        (0, _shared.throwError)();
    }
}
function hydrateRoot(input, parentDom, lifecycle) {
    if (parentDom && parentDom.nodeType === 1) {
        var rootNode = parentDom.querySelector('[data-infernoroot]');
        if (rootNode && rootNode.parentNode === parentDom) {
            rootNode.removeAttribute('data-infernoroot');
            hydrate(input, rootNode, lifecycle, {}, false);
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=hydration.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.processInput = processInput;
exports.applyValue = applyValue;

var _shared = __webpack_require__(0);

var _processElement = __webpack_require__(4);

function isCheckedType(type) {
    return type === 'checkbox' || type === 'radio';
}
function isControlled(props) {
    var usesChecked = isCheckedType(props.type);
    return usesChecked ? !(0, _shared.isNullOrUndef)(props.checked) : !(0, _shared.isNullOrUndef)(props.value);
}
function onTextInputChange(e) {
    var vNode = this.vNode;
    var props = vNode.props;
    var dom = vNode.dom;
    if (props.onInput) {
        props.onInput(e);
    } else if (props.oninput) {
        props.oninput(e);
    }
    // the user may have updated the vNode from the above onInput events
    // so we need to get it from the context of `this` again
    applyValue(this.vNode, dom);
}
function onCheckboxChange(e) {
    var vNode = this.vNode;
    var props = vNode.props;
    var dom = vNode.dom;
    if (props.onClick) {
        props.onClick(e);
    } else if (props.onclick) {
        props.onclick(e);
    }
    // the user may have updated the vNode from the above onClick events
    // so we need to get it from the context of `this` again
    applyValue(this.vNode, dom);
}
function handleAssociatedRadioInputs(name) {
    var inputs = document.querySelectorAll('input[type="radio"][name="' + name + '"]');
    [].forEach.call(inputs, function (dom) {
        var inputWrapper = _processElement.wrappers.get(dom);
        if (inputWrapper) {
            var props = inputWrapper.vNode.props;
            if (props) {
                dom.checked = inputWrapper.vNode.props.checked;
            }
        }
    });
}
function processInput(vNode, dom) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    applyValue(vNode, dom);
    if (isControlled(props)) {
        var inputWrapper = _processElement.wrappers.get(dom);
        if (!inputWrapper) {
            inputWrapper = {
                vNode: vNode
            };
            if (isCheckedType(props.type)) {
                dom.onclick = onCheckboxChange.bind(inputWrapper);
                dom.onclick.wrapped = true;
            } else {
                dom.oninput = onTextInputChange.bind(inputWrapper);
                dom.oninput.wrapped = true;
            }
            _processElement.wrappers.set(dom, inputWrapper);
        }
        inputWrapper.vNode = vNode;
    }
}
function applyValue(vNode, dom) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    var type = props.type;
    var value = props.value;
    var checked = props.checked;
    if (type !== dom.type && type) {
        dom.type = type;
    }
    if (props.multiple !== dom.multiple) {
        dom.multiple = props.multiple;
    }
    if (isCheckedType(type)) {
        if (!(0, _shared.isNullOrUndef)(value)) {
            dom.value = value;
        }
        dom.checked = checked;
        if (type === 'radio' && props.name) {
            handleAssociatedRadioInputs(props.name);
        }
    } else {
        if (!(0, _shared.isNullOrUndef)(value) && dom.value !== value) {
            dom.value = value;
        } else if (!(0, _shared.isNullOrUndef)(checked)) {
            dom.checked = checked;
        }
    }
}
//# sourceMappingURL=InputWrapper.js.map

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.processSelect = processSelect;
exports.applyValue = applyValue;

var _shared = __webpack_require__(0);

var _processElement = __webpack_require__(4);

var _shapes = __webpack_require__(3);

function isControlled(props) {
    return !(0, _shared.isNullOrUndef)(props.value);
}
function updateChildOption(vNode, value) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    var dom = vNode.dom;
    // we do this as multiple may have changed
    dom.value = props.value;
    if ((0, _shared.isArray)(value) && value.indexOf(props.value) !== -1 || props.value === value) {
        dom.selected = true;
    } else {
        dom.selected = props.selected || false;
    }
}
function onSelectChange(e) {
    var vNode = this.vNode;
    var props = vNode.props;
    var dom = vNode.dom;
    if (props.onChange) {
        props.onChange(e);
    } else if (props.onchange) {
        props.onchange(e);
    }
    // the user may have updated the vNode from the above onChange events
    // so we need to get it from the context of `this` again
    applyValue(this.vNode, dom);
}
function processSelect(vNode, dom) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    applyValue(vNode, dom);
    if (isControlled(props)) {
        var selectWrapper = _processElement.wrappers.get(dom);
        if (!selectWrapper) {
            selectWrapper = {
                vNode: vNode
            };
            dom.onchange = onSelectChange.bind(selectWrapper);
            dom.onchange.wrapped = true;
            _processElement.wrappers.set(dom, selectWrapper);
        }
        selectWrapper.vNode = vNode;
    }
}
function applyValue(vNode, dom) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    if (props.multiple !== dom.multiple) {
        dom.multiple = props.multiple;
    }
    var children = vNode.children;
    var value = props.value;
    if ((0, _shared.isArray)(children)) {
        for (var i = 0; i < children.length; i++) {
            updateChildOption(children[i], value);
        }
    } else if ((0, _shapes.isVNode)(children)) {
        updateChildOption(children, value);
    }
}
//# sourceMappingURL=SelectWrapper.js.map

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.processTextarea = processTextarea;
exports.applyValue = applyValue;

var _shared = __webpack_require__(0);

var _processElement = __webpack_require__(4);

// import { isVNode } from '../../core/shapes';
function isControlled(props) {
    return !(0, _shared.isNullOrUndef)(props.value);
}
function onTextareaInputChange(e) {
    var vNode = this.vNode;
    var props = vNode.props;
    var dom = vNode.dom;
    if (props.onInput) {
        props.onInput(e);
    } else if (props.oninput) {
        props.oninput(e);
    }
    // the user may have updated the vNode from the above onInput events
    // so we need to get it from the context of `this` again
    applyValue(this.vNode, dom);
}
function processTextarea(vNode, dom) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    applyValue(vNode, dom);
    var textareaWrapper = _processElement.wrappers.get(dom);
    if (isControlled(props)) {
        if (!textareaWrapper) {
            textareaWrapper = {
                vNode: vNode
            };
            dom.oninput = onTextareaInputChange.bind(textareaWrapper);
            dom.oninput.wrapped = true;
            _processElement.wrappers.set(dom, textareaWrapper);
        }
        textareaWrapper.vNode = vNode;
    }
}
function applyValue(vNode, dom) {
    var props = vNode.props || _shared.EMPTY_OBJ;
    var value = props.value;
    if (dom.value !== value) {
        dom.value = value;
    }
}
//# sourceMappingURL=TextareaWrapper.js.map

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lifecycle = __webpack_require__(13);

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _shared = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var noOp = _shared.ERROR_MSG;
if (process.env.NODE_ENV !== 'production') {
    noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
}
var componentCallbackQueue = new Map();
function addToQueue(component, force, callback) {
    // TODO this function needs to be revised and improved on
    var queue = componentCallbackQueue.get(component);
    if (!queue) {
        queue = [];
        componentCallbackQueue.set(component, queue);
        requestAnimationFrame(function () {
            applyState(component, force, function () {
                for (var i = 0; i < queue.length; i++) {
                    queue[i]();
                }
            });
            componentCallbackQueue.delete(component);
            component._processingSetState = false;
        });
    }
    if (callback) {
        queue.push(callback);
    }
}
function queueStateChanges(component, newState, callback) {
    if ((0, _shared.isFunction)(newState)) {
        newState = newState(component.state);
    }
    for (var stateKey in newState) {
        component._pendingState[stateKey] = newState[stateKey];
    }
    if (!component._pendingSetState) {
        if (component._processingSetState || callback) {
            addToQueue(component, false, callback);
        } else {
            component._pendingSetState = true;
            component._processingSetState = true;
            applyState(component, false, callback);
            component._processingSetState = false;
        }
    } else {
        component.state = Object.assign({}, component.state, component._pendingState);
        component._pendingState = {};
    }
}
function applyState(component, force, callback) {
    if ((!component._deferSetState || force) && !component._blockRender) {
        component._pendingSetState = false;
        var pendingState = component._pendingState;
        var prevState = component.state;
        var nextState = Object.assign({}, prevState, pendingState);
        var props = component.props;
        var context = component.context;
        component._pendingState = {};
        var nextInput = component._updateComponent(prevState, nextState, props, props, context, force);
        var didUpdate = true;
        if ((0, _shared.isInvalid)(nextInput)) {
            nextInput = (0, _shapes.createVoidVNode)();
        } else if ((0, _shared.isArray)(nextInput)) {
            if (process.env.NODE_ENV !== 'production') {
                (0, _shared.throwError)('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
            }
            (0, _shared.throwError)();
        } else if (nextInput === _shared.NO_OP) {
            nextInput = component._lastInput;
            didUpdate = false;
        }
        var lastInput = component._lastInput;
        var parentDom = lastInput.dom.parentNode;
        component._lastInput = nextInput;
        if (didUpdate) {
            var subLifecycle = component._lifecycle;
            if (!subLifecycle) {
                subLifecycle = new _lifecycle2.default();
            } else {
                subLifecycle.listeners = [];
            }
            component._lifecycle = subLifecycle;
            var childContext = component.getChildContext();
            if (!(0, _shared.isNullOrUndef)(childContext)) {
                childContext = Object.assign({}, context, component._childContext, childContext);
            } else {
                childContext = Object.assign({}, context, component._childContext);
            }
            component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
            subLifecycle.trigger();
            component.componentDidUpdate(props, prevState);
        }
        component._vNode.dom = nextInput.dom;
        component._componentToDOMNodeMap.set(component, nextInput.dom);
        if (!(0, _shared.isNullOrUndef)(callback)) {
            callback();
        }
    }
}

var Component = function () {
    function Component(props, context) {
        _classCallCheck(this, Component);

        this.state = {};
        this.refs = {};
        this._processingSetState = false;
        this._blockRender = false;
        this._blockSetState = false;
        this._deferSetState = false;
        this._pendingSetState = false;
        this._pendingState = {};
        this._lastInput = null;
        this._vNode = null;
        this._unmounted = true;
        this._devToolsStatus = null;
        this._devToolsId = null;
        this._lifecycle = null;
        this._childContext = null;
        this._patch = null;
        this._isSVG = false;
        this._componentToDOMNodeMap = null;
        /** @type {object} */
        this.props = props || {};
        /** @type {object} */
        this.context = context || {};
        if (!this.componentDidMount) {
            this.componentDidMount = null;
        }
    }

    _createClass(Component, [{
        key: 'render',
        value: function render(nextProps, nextContext) {}
    }, {
        key: 'forceUpdate',
        value: function forceUpdate(callback) {
            if (this._unmounted) {
                throw Error(noOp);
            }
            applyState(this, true, callback);
        }
    }, {
        key: 'setState',
        value: function setState(newState, callback) {
            if (this._unmounted) {
                throw Error(noOp);
            }
            if (this._blockSetState === false) {
                queueStateChanges(this, newState, callback);
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    (0, _shared.throwError)('cannot update state via setState() in componentWillUpdate().');
                }
                (0, _shared.throwError)();
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState, prevContext) {}
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState, context) {
            return true;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, context) {}
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState, nextContext) {}
    }, {
        key: 'getChildContext',
        value: function getChildContext() {}
    }, {
        key: '_updateComponent',
        value: function _updateComponent(prevState, nextState, prevProps, nextProps, context, force) {
            if (this._unmounted === true) {
                if (process.env.NODE_ENV !== 'production') {
                    (0, _shared.throwError)(noOp);
                }
                (0, _shared.throwError)();
            }
            if (!(0, _shared.isNullOrUndef)(nextProps) && (0, _shared.isNullOrUndef)(nextProps.children)) {
                nextProps.children = prevProps.children;
            }
            if (prevProps !== nextProps || nextProps === _shared.EMPTY_OBJ || prevState !== nextState || force) {
                if (prevProps !== nextProps || nextProps === _shared.EMPTY_OBJ) {
                    this._blockRender = true;
                    this.componentWillReceiveProps(nextProps, context);
                    this._blockRender = false;
                    if (this._pendingSetState) {
                        nextState = Object.assign({}, nextState, this._pendingState);
                        this._pendingSetState = false;
                        this._pendingState = {};
                    }
                }
                var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState, context);
                if (shouldUpdate !== false || force) {
                    this._blockSetState = true;
                    this.componentWillUpdate(nextProps, nextState, context);
                    this._blockSetState = false;
                    this.props = nextProps;
                    this.state = nextState;
                    this.context = context;
                    this.beforeRender && this.beforeRender();
                    var render = this.render(nextProps, context);
                    this.afterRender && this.afterRender();
                    return render;
                }
            }
            return _shared.NO_OP;
        }
    }]);

    return Component;
}();
//# sourceMappingURL=es2015.js.map


exports.default = Component;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 21 */,
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = __webpack_require__(14);

var _index2 = _interopRequireDefault(_index);

var _index3 = __webpack_require__(15);

var _index4 = _interopRequireDefault(_index3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Home = function (_Component) {
	_inherits(Home, _Component);

	function Home() {
		_classCallCheck(this, Home);

		return _possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).apply(this, arguments));
	}

	_createClass(Home, [{
		key: 'render',
		value: function render() {
			return _index4.default.createVNode(2, 'div', null, 'Hello World');
		}
	}]);

	return Home;
}(_index2.default);

_index4.default.render(_index4.default.createVNode(16, Home), document.getElementById('example--two'));

/***/ }
/******/ ]);