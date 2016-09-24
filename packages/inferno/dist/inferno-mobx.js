/*!
 * inferno-mobx v1.0.0-alpha1
 * (c) 2016 Ryan Megidov
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoMobx = factory());
}(this, (function () { 'use strict';

var Lifecycle = function Lifecycle() {
    this._listeners = [];
};
Lifecycle.prototype.addListener = function addListener (callback) {
    this._listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger () {
        var this$1 = this;

    for (var i = 0; i < this._listeners.length; i++) {
        this$1._listeners[i]();
    }
};

var NO_OP = '$NO_OP';
var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;
function toArray(children) {
    return isArray(children) ? children : (children ? [children] : children);
}
function isArray(obj) {
    return obj instanceof Array;
}
function isStatefulComponent(o) {
    var component = o.component;
    return !isUndefined(component.prototype) && !isUndefined(component.prototype.render);
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
    return typeof o === 'object';
}
function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
}

var EMPTY_OBJ = {};

var ValueTypes = {
    CHILDREN: 1,
    PROP_CLASS_NAME: 2,
    PROP_STYLE: 3,
    PROP_DATA: 4,
    PROP_REF: 5,
    PROP_SPREAD: 6,
    PROP_VALUE: 7,
    PROP: 8
};
var ChildrenTypes = {
    NON_KEYED: 1,
    KEYED: 2,
    NODE: 3,
    TEXT: 4,
    UNKNOWN: 5
};
var NodeTypes = {
    ELEMENT: 1,
    OPT_ELEMENT: 2,
    TEXT: 3,
    FRAGMENT: 4,
    OPT_BLUEPRINT: 5,
    COMPONENT: 6,
    PLACEHOLDER: 7
};
function isUnknownChildrenType(o) {
    return o === ChildrenTypes.UNKNOWN;
}
function isKeyedListChildrenType(o) {
    return o === ChildrenTypes.KEYED;
}
function isNonKeyedListChildrenType(o) {
    return o === ChildrenTypes.NON_KEYED;
}
function isTextChildrenType(o) {
    return o === ChildrenTypes.TEXT;
}
function isNodeChildrenType(o) {
    return o === ChildrenTypes.NODE;
}

function createVComponent(component, props, key, hooks, ref) {
    return {
        component: component,
        dom: null,
        hooks: hooks || null,
        instance: null,
        key: key,
        props: props,
        ref: ref || null,
        type: NodeTypes.COMPONENT
    };
}
function createVText(text) {
    return {
        dom: null,
        text: text,
        type: NodeTypes.TEXT
    };
}
function createVElement(tag, props, children, key, ref, childrenType) {
    return {
        children: children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        key: key,
        props: props,
        ref: ref || null,
        tag: tag,
        type: NodeTypes.ELEMENT
    };
}

function createVFragment(children, childrenType) {
    return {
        children: children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        pointer: null,
        type: NodeTypes.FRAGMENT
    };
}
function createVPlaceholder() {
    return {
        dom: null,
        type: NodeTypes.PLACEHOLDER
    };
}
function isVElement(o) {
    return o.type === NodeTypes.ELEMENT;
}
function isOptVElement(o) {
    return o.type === NodeTypes.OPT_ELEMENT;
}
function isVComponent(o) {
    return o.type === NodeTypes.COMPONENT;
}
function isVText(o) {
    return o.type === NodeTypes.TEXT;
}
function isVFragment(o) {
    return o.type === NodeTypes.FRAGMENT;
}
function isVPlaceholder(o) {
    return o.type === NodeTypes.PLACEHOLDER;
}
function isVNode(o) {
    return !isUndefined(o.type);
}

var noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
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
    if (isFunction(newState)) {
        newState = newState(component.state);
    }
    for (var stateKey in newState) {
        component._pendingState[stateKey] = newState[stateKey];
    }
    if (!component._pendingSetState) {
        component._pendingSetState = true;
        if (component._processingSetState || callback) {
            addToQueue(component, false, callback);
        }
        else {
            component._processingSetState = true;
            applyState(component, false, callback);
            component._processingSetState = false;
        }
    }
    else {
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
        if (nextInput === NO_OP) {
            nextInput = component._lastInput;
        }
        else if (isArray(nextInput)) {
            nextInput = createVFragment(nextInput, null);
        }
        else if (isNullOrUndef(nextInput)) {
            nextInput = createVPlaceholder();
        }
        var lastInput = component._lastInput;
        var parentDom = lastInput.dom.parentNode;
        var subLifecycle = new Lifecycle();
        var childContext = component.getChildContext();
        if (!isNullOrUndef(childContext)) {
            childContext = Object.assign({}, context, component._childContext, childContext);
        }
        else {
            childContext = Object.assign({}, context, component._childContext);
        }
        component._lastInput = nextInput;
        component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
        component._vComponent.dom = nextInput.dom;
        component._componentToDOMNodeMap.set(component, nextInput.dom);
        component.componentDidUpdate(props, prevState);
        subLifecycle.trigger();
        if (!isNullOrUndef(callback)) {
            callback();
        }
    }
}
var Component = function Component(props, context) {
    this.state = {};
    this.refs = {};
    this._processingSetState = false;
    this._blockRender = false;
    this._blockSetState = false;
    this._deferSetState = false;
    this._pendingSetState = false;
    this._pendingState = {};
    this._lastInput = null;
    this._vComponent = null;
    this._unmounted = true;
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
};
Component.prototype.render = function render (nextProps, nextContext) {
};
Component.prototype.forceUpdate = function forceUpdate (callback) {
    if (this._unmounted) {
        throw Error(noOp);
    }
    applyState(this, true, callback);
};
Component.prototype.setState = function setState (newState, callback) {
    if (this._unmounted) {
        throw Error(noOp);
    }
    if (this._blockSetState === false) {
        queueStateChanges(this, newState, callback);
    }
    else {
        {
            throwError('cannot update state via setState() in componentWillUpdate().');
        }
        throwError();
    }
};
Component.prototype.componentWillMount = function componentWillMount () {
};
Component.prototype.componentWillUnmount = function componentWillUnmount () {
};
Component.prototype.componentDidUpdate = function componentDidUpdate () {
};
Component.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState, context) {
    return true;
};
Component.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps, context) {
};
Component.prototype.componentWillUpdate = function componentWillUpdate (nextProps, nextState, nextContext) {
};
Component.prototype.getChildContext = function getChildContext () {
};
Component.prototype._updateComponent = function _updateComponent (prevState, nextState, prevProps, nextProps, context, force) {
    if (this._unmounted === true) {
        throw new Error('You can\'t update an unmounted component!');
    }
    if (!isNullOrUndef(nextProps) && isNullOrUndef(nextProps.children)) {
        nextProps.children = prevProps.children;
    }
    if (prevProps !== nextProps || prevState !== nextState || force) {
        if (prevProps !== nextProps) {
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
            return this.render(nextProps, context);
        }
    }
    return NO_OP;
};

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
}

/* global window */
var root = undefined;
if (typeof global !== 'undefined') {
	root = global;
} else if (typeof window !== 'undefined') {
	root = window;
}

var result = symbolObservablePonyfill(root);

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning$2(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!isPlainObject(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  var arguments$1 = arguments;

  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments$1[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}

var _extends = Object.assign || function (target) {
var arguments$1 = arguments;
 for (var i = 1; i < arguments.length; i++) { var source = arguments$1[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if ("development" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  warning$2('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning$1(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message);
    }
    /* eslint-enable no-console */
    try {
        // This error was thrown as a convenience so that if you enable
        // "break on all exceptions" in your console,
        // it would pause the execution at this line.
        throw new Error(message);
    }
    catch (e) { }
    /* eslint-enable no-empty */
}

var PropTypesAny = function () {
};
var specialReactKeys = {
    children: true,
    key: true,
    ref: true
};
function ChildrenOnly(children) {
    if (isNullOrUndef(children) || toArray(children).length !== 1) {
        throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
    }
    return children;
}
var Provider = (function (Component$$1) {
    function Provider(props, context) {
        Component$$1.call(this, props, context);
        this.contextTypes = { mobxStores: PropTypesAny };
        this.childContextTypes = { mobxStores: PropTypesAny };
        this.store = props.store;
    }

    if ( Component$$1 ) Provider.__proto__ = Component$$1;
    Provider.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Provider.prototype.constructor = Provider;
    Provider.prototype.render = function render () {
        return ChildrenOnly(this.props.children);
    };
    Provider.prototype.getChildContext = function getChildContext () {
        var this$1 = this;

        var stores = {};
        // inherit stores
        var baseStores = this.context.mobxStores;
        if (baseStores) {
            for (var key in baseStores) {
                stores[key] = baseStores[key];
            }
        }
        // add own stores
        for (var key$1 in this.props) {
            if (!specialReactKeys[key$1]) {
                stores[key$1] = this$1.props[key$1];
            }
        }
        return {
            mobxStores: stores
        };
    };

    return Provider;
}(Component));
{
    Provider.prototype.componentWillReceiveProps = function (nextProps) {
        var this$1 = this;

        // Maybe this warning is to aggressive?
        if (Object.keys(nextProps).length !== Object.keys(this.props).length) {
            warning$1("MobX Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children");
        }
        for (var key in nextProps) {
            if (!specialReactKeys[key] && this$1.props[key] !== nextProps[key]) {
                warning$1("MobX Provider: Provided store '" + key + "' has changed. Please avoid replacing stores as the change might not propagate to all children");
            }
        }
    };
}

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var NODE_ENV = "development";

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

var invariant_1 = invariant;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var mobx = createCommonjsModule(function (module, exports) {
"use strict";
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || function (d, b) {
    for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } }
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
registerGlobals();
exports.extras = {
    allowStateChanges: allowStateChanges,
    getAtom: getAtom,
    getDebugName: getDebugName,
    getDependencyTree: getDependencyTree,
    getObserverTree: getObserverTree,
    isComputingDerivation: isComputingDerivation,
    isSpyEnabled: isSpyEnabled,
    resetGlobalState: resetGlobalState,
    spyReport: spyReport,
    spyReportEnd: spyReportEnd,
    spyReportStart: spyReportStart,
    trackTransitions: trackTransitions
};
exports._ = {
    getAdministration: getAdministration,
    resetGlobalState: resetGlobalState
};
if (typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx(module.exports);
}
var actionFieldDecorator = createClassPropertyDecorator(function (target, key, value, args, originalDescriptor) {
    var actionName = (args && args.length === 1) ? args[0] : (value.name || key || "<unnamed action>");
    var wrappedAction = action(actionName, value);
    addHiddenProp(target, key, wrappedAction);
}, function (key) {
    return this[key];
}, function () {
    invariant(false, "It is not allowed to assign new values to @action fields");
}, false, true);
function action(arg1, arg2, arg3, arg4) {
    if (arguments.length === 1 && typeof arg1 === "function")
        { return createAction(arg1.name || "<unnamed action>", arg1); }
    if (arguments.length === 2 && typeof arg2 === "function")
        { return createAction(arg1, arg2); }
    if (arguments.length === 1 && typeof arg1 === "string")
        { return namedActionDecorator(arg1); }
    return namedActionDecorator(arg2).apply(null, arguments);
}
exports.action = action;
function namedActionDecorator(name) {
    return function (target, prop, descriptor) {
        if (descriptor && typeof descriptor.value === "function") {
            descriptor.value = createAction(name, descriptor.value);
            descriptor.enumerable = false;
            descriptor.configurable = true;
            return descriptor;
        }
        return actionFieldDecorator(name).apply(this, arguments);
    };
}
function runInAction(arg1, arg2, arg3) {
    var actionName = typeof arg1 === "string" ? arg1 : arg1.name || "<unnamed action>";
    var fn = typeof arg1 === "function" ? arg1 : arg2;
    var scope = typeof arg1 === "function" ? arg2 : arg3;
    invariant(typeof fn === "function", "`runInAction` expects a function");
    invariant(fn.length === 0, "`runInAction` expects a function without arguments");
    invariant(typeof actionName === "string" && actionName.length > 0, "actions should have valid names, got: '" + actionName + "'");
    return executeAction(actionName, fn, scope, undefined);
}
exports.runInAction = runInAction;
function isAction(thing) {
    return typeof thing === "function" && thing.isMobxAction === true;
}
exports.isAction = isAction;
function autorun(arg1, arg2, arg3) {
    var name, view, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        view = arg2;
        scope = arg3;
    }
    else if (typeof arg1 === "function") {
        name = arg1.name || ("Autorun@" + getNextId());
        view = arg1;
        scope = arg2;
    }
    assertUnwrapped(view, "autorun methods cannot have modifiers");
    invariant(typeof view === "function", "autorun expects a function");
    if (scope)
        { view = view.bind(scope); }
    var reaction = new Reaction(name, function () {
        this.track(reactionRunner);
    });
    function reactionRunner() {
        view(reaction);
    }
    reaction.schedule();
    return reaction.getDisposer();
}
exports.autorun = autorun;
function when(arg1, arg2, arg3, arg4) {
    var name, predicate, effect, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        predicate = arg2;
        effect = arg3;
        scope = arg4;
    }
    else if (typeof arg1 === "function") {
        name = ("When@" + getNextId());
        predicate = arg1;
        effect = arg2;
        scope = arg3;
    }
    var disposer = autorun(name, function (r) {
        if (predicate.call(scope)) {
            r.dispose();
            var prevUntracked = untrackedStart();
            effect.call(scope);
            untrackedEnd(prevUntracked);
        }
    });
    return disposer;
}
exports.when = when;
function autorunUntil(predicate, effect, scope) {
    deprecated("`autorunUntil` is deprecated, please use `when`.");
    return when.apply(null, arguments);
}
exports.autorunUntil = autorunUntil;
function autorunAsync(arg1, arg2, arg3, arg4) {
    var name, func, delay, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        func = arg2;
        delay = arg3;
        scope = arg4;
    }
    else if (typeof arg1 === "function") {
        name = arg1.name || ("AutorunAsync@" + getNextId());
        func = arg1;
        delay = arg2;
        scope = arg3;
    }
    if (delay === void 0)
        { delay = 1; }
    if (scope)
        { func = func.bind(scope); }
    var isScheduled = false;
    var r = new Reaction(name, function () {
        if (!isScheduled) {
            isScheduled = true;
            setTimeout(function () {
                isScheduled = false;
                if (!r.isDisposed)
                    { r.track(reactionRunner); }
            }, delay);
        }
    });
    function reactionRunner() { func(r); }
    r.schedule();
    return r.getDisposer();
}
exports.autorunAsync = autorunAsync;
function reaction(arg1, arg2, arg3, arg4, arg5, arg6) {
    var name, expression, effect, fireImmediately, delay, scope;
    if (typeof arg1 === "string") {
        name = arg1;
        expression = arg2;
        effect = arg3;
        fireImmediately = arg4;
        delay = arg5;
        scope = arg6;
    }
    else {
        name = arg1.name || arg2.name || ("Reaction@" + getNextId());
        expression = arg1;
        effect = arg2;
        fireImmediately = arg3;
        delay = arg4;
        scope = arg5;
    }
    if (fireImmediately === void 0)
        { fireImmediately = false; }
    if (delay === void 0)
        { delay = 0; }
    var _a = getValueModeFromValue(expression, ValueMode.Reference), valueMode = _a[0], unwrappedExpression = _a[1];
    var compareStructural = valueMode === ValueMode.Structure;
    if (scope) {
        unwrappedExpression = unwrappedExpression.bind(scope);
        effect = action(name, effect.bind(scope));
    }
    var firstTime = true;
    var isScheduled = false;
    var nextValue = undefined;
    var r = new Reaction(name, function () {
        if (delay < 1) {
            reactionRunner();
        }
        else if (!isScheduled) {
            isScheduled = true;
            setTimeout(function () {
                isScheduled = false;
                reactionRunner();
            }, delay);
        }
    });
    function reactionRunner() {
        if (r.isDisposed)
            { return; }
        var changed = false;
        r.track(function () {
            var v = unwrappedExpression(r);
            changed = valueDidChange(compareStructural, nextValue, v);
            nextValue = v;
        });
        if (firstTime && fireImmediately)
            { effect(nextValue, r); }
        if (!firstTime && changed === true)
            { effect(nextValue, r); }
        if (firstTime)
            { firstTime = false; }
    }
    r.schedule();
    return r.getDisposer();
}
exports.reaction = reaction;
var computedDecorator = createClassPropertyDecorator(function (target, name, _, decoratorArgs, originalDescriptor) {
    invariant(typeof originalDescriptor !== "undefined", "@computed can only be used on getter functions, like: '@computed get myProps() { return ...; }'. It looks like it was used on a property.");
    var baseValue = originalDescriptor.get;
    var setter = originalDescriptor.set;
    invariant(typeof baseValue === "function", "@computed can only be used on getter functions, like: '@computed get myProps() { return ...; }'");
    var compareStructural = false;
    if (decoratorArgs && decoratorArgs.length === 1 && decoratorArgs[0].asStructure === true)
        { compareStructural = true; }
    var adm = asObservableObject(target, undefined, ValueMode.Recursive);
    defineObservableProperty(adm, name, compareStructural ? asStructure(baseValue) : baseValue, false, setter);
}, function (name) {
    var observable = this.$mobx.values[name];
    if (observable === undefined)
        { return undefined; }
    return observable.get();
}, function (name, value) {
    this.$mobx.values[name].set(value);
}, false, true);
function computed(targetOrExpr, keyOrScopeOrSetter, baseDescriptor, options) {
    if (typeof targetOrExpr === "function" && arguments.length < 3) {
        if (typeof keyOrScopeOrSetter === "function")
            { return computedExpr(targetOrExpr, keyOrScopeOrSetter, undefined); }
        else
            { return computedExpr(targetOrExpr, undefined, keyOrScopeOrSetter); }
    }
    return computedDecorator.apply(null, arguments);
}
exports.computed = computed;
function computedExpr(expr, setter, scope) {
    var _a = getValueModeFromValue(expr, ValueMode.Recursive), mode = _a[0], value = _a[1];
    return new ComputedValue(value, scope, mode === ValueMode.Structure, value.name, setter);
}
function createTransformer(transformer, onCleanup) {
    invariant(typeof transformer === "function" && transformer.length === 1, "createTransformer expects a function that accepts one argument");
    var objectCache = {};
    var resetId = globalState.resetId;
    var Transformer = (function (_super) {
        __extends(Transformer, _super);
        function Transformer(sourceIdentifier, sourceObject) {
            _super.call(this, function () { return transformer(sourceObject); }, null, false, "Transformer-" + transformer.name + "-" + sourceIdentifier, undefined);
            this.sourceIdentifier = sourceIdentifier;
            this.sourceObject = sourceObject;
        }
        Transformer.prototype.onBecomeUnobserved = function () {
            var lastValue = this.value;
            _super.prototype.onBecomeUnobserved.call(this);
            delete objectCache[this.sourceIdentifier];
            if (onCleanup)
                { onCleanup(lastValue, this.sourceObject); }
        };
        return Transformer;
    }(ComputedValue));
    return function (object) {
        if (resetId !== globalState.resetId) {
            objectCache = {};
            resetId = globalState.resetId;
        }
        var identifier = getMemoizationId(object);
        var reactiveTransformer = objectCache[identifier];
        if (reactiveTransformer)
            { return reactiveTransformer.get(); }
        reactiveTransformer = objectCache[identifier] = new Transformer(identifier, object);
        return reactiveTransformer.get();
    };
}
exports.createTransformer = createTransformer;
function getMemoizationId(object) {
    if (object === null || typeof object !== "object")
        { throw new Error("[mobx] transform expected some kind of object, got: " + object); }
    var tid = object.$transformId;
    if (tid === undefined) {
        tid = getNextId();
        addHiddenProp(object, "$transformId", tid);
    }
    return tid;
}
function expr(expr, scope) {
    if (!isComputingDerivation())
        { console.warn("[mobx.expr] 'expr' should only be used inside other reactive functions."); }
    return computed(expr, scope).get();
}
exports.expr = expr;
function extendObservable(target) {
    var arguments$1 = arguments;

    var properties = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        properties[_i - 1] = arguments$1[_i];
    }
    invariant(arguments.length >= 2, "extendObservable expected 2 or more arguments");
    invariant(typeof target === "object", "extendObservable expects an object as first argument");
    invariant(!(target instanceof ObservableMap), "extendObservable should not be used on maps, use map.merge instead");
    properties.forEach(function (propSet) {
        invariant(typeof propSet === "object", "all arguments of extendObservable should be objects");
        extendObservableHelper(target, propSet, ValueMode.Recursive, null);
    });
    return target;
}
exports.extendObservable = extendObservable;
function extendObservableHelper(target, properties, mode, name) {
    var adm = asObservableObject(target, name, mode);
    for (var key in properties)
        { if (hasOwnProperty(properties, key)) {
            if (target === properties && !isPropertyConfigurable(target, key))
                { continue; }
            var descriptor = Object.getOwnPropertyDescriptor(properties, key);
            setObservableObjectInstanceProperty(adm, key, descriptor);
        } }
    return target;
}
function getDependencyTree(thing, property) {
    return nodeToDependencyTree(getAtom(thing, property));
}
function nodeToDependencyTree(node) {
    var result = {
        name: node.name
    };
    if (node.observing && node.observing.length > 0)
        { result.dependencies = unique(node.observing).map(nodeToDependencyTree); }
    return result;
}
function getObserverTree(thing, property) {
    return nodeToObserverTree(getAtom(thing, property));
}
function nodeToObserverTree(node) {
    var result = {
        name: node.name
    };
    if (hasObservers(node))
        { result.observers = getObservers(node).map(nodeToObserverTree); }
    return result;
}
function intercept(thing, propOrHandler, handler) {
    if (typeof handler === "function")
        { return interceptProperty(thing, propOrHandler, handler); }
    else
        { return interceptInterceptable(thing, propOrHandler); }
}
exports.intercept = intercept;
function interceptInterceptable(thing, handler) {
    if (isPlainObject(thing) && !isObservableObject(thing)) {
        deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        return getAdministration(observable(thing)).intercept(handler);
    }
    return getAdministration(thing).intercept(handler);
}
function interceptProperty(thing, property, handler) {
    if (isPlainObject(thing) && !isObservableObject(thing)) {
        deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        extendObservable(thing, {
            property: thing[property]
        });
        return interceptProperty(thing, property, handler);
    }
    return getAdministration(thing, property).intercept(handler);
}
function isObservable(value, property) {
    if (value === null || value === undefined)
        { return false; }
    if (property !== undefined) {
        if (value instanceof ObservableMap || value instanceof ObservableArray)
            { throw new Error("[mobx.isObservable] isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead."); }
        else if (isObservableObject(value)) {
            var o = value.$mobx;
            return o.values && !!o.values[property];
        }
        return false;
    }
    return !!value.$mobx || value instanceof BaseAtom || value instanceof Reaction || value instanceof ComputedValue;
}
exports.isObservable = isObservable;
var decoratorImpl = createClassPropertyDecorator(function (target, name, baseValue) {
    var prevA = allowStateChangesStart(true);
    if (typeof baseValue === "function")
        { baseValue = asReference(baseValue); }
    var adm = asObservableObject(target, undefined, ValueMode.Recursive);
    defineObservableProperty(adm, name, baseValue, true, undefined);
    allowStateChangesEnd(prevA);
}, function (name) {
    var observable = this.$mobx.values[name];
    if (observable === undefined)
        { return undefined; }
    return observable.get();
}, function (name, value) {
    setPropertyValue(this, name, value);
}, true, false);
function observableDecorator(target, key, baseDescriptor) {
    invariant(arguments.length >= 2 && arguments.length <= 3, "Illegal decorator config", key);
    assertPropertyConfigurable(target, key);
    invariant(!baseDescriptor || !baseDescriptor.get, "@observable can not be used on getters, use @computed instead");
    return decoratorImpl.apply(null, arguments);
}
function observable(v, keyOrScope) {
    if (v === void 0) { v = undefined; }
    if (typeof arguments[1] === "string")
        { return observableDecorator.apply(null, arguments); }
    invariant(arguments.length < 3, "observable expects zero, one or two arguments");
    if (isObservable(v))
        { return v; }
    var _a = getValueModeFromValue(v, ValueMode.Recursive), mode = _a[0], value = _a[1];
    var sourceType = mode === ValueMode.Reference ? ValueType.Reference : getTypeOfValue(value);
    switch (sourceType) {
        case ValueType.Array:
        case ValueType.PlainObject:
            return makeChildObservable(value, mode);
        case ValueType.Reference:
        case ValueType.ComplexObject:
            return new ObservableValue(value, mode);
        case ValueType.ComplexFunction:
            throw new Error("[mobx.observable] To be able to make a function reactive it should not have arguments. If you need an observable reference to a function, use `observable(asReference(f))`");
        case ValueType.ViewFunction:
            deprecated("Use `computed(expr)` instead of `observable(expr)`");
            return computed(v, keyOrScope);
    }
    invariant(false, "Illegal State");
}
exports.observable = observable;
var ValueType;
(function (ValueType) {
    ValueType[ValueType["Reference"] = 0] = "Reference";
    ValueType[ValueType["PlainObject"] = 1] = "PlainObject";
    ValueType[ValueType["ComplexObject"] = 2] = "ComplexObject";
    ValueType[ValueType["Array"] = 3] = "Array";
    ValueType[ValueType["ViewFunction"] = 4] = "ViewFunction";
    ValueType[ValueType["ComplexFunction"] = 5] = "ComplexFunction";
})(ValueType || (ValueType = {}));
function getTypeOfValue(value) {
    if (value === null || value === undefined)
        { return ValueType.Reference; }
    if (typeof value === "function")
        { return value.length ? ValueType.ComplexFunction : ValueType.ViewFunction; }
    if (Array.isArray(value) || value instanceof ObservableArray)
        { return ValueType.Array; }
    if (typeof value === "object")
        { return isPlainObject(value) ? ValueType.PlainObject : ValueType.ComplexObject; }
    return ValueType.Reference;
}
function observe(thing, propOrCb, cbOrFire, fireImmediately) {
    if (typeof cbOrFire === "function")
        { return observeObservableProperty(thing, propOrCb, cbOrFire, fireImmediately); }
    else
        { return observeObservable(thing, propOrCb, cbOrFire); }
}
exports.observe = observe;
function observeObservable(thing, listener, fireImmediately) {
    if (isPlainObject(thing) && !isObservableObject(thing)) {
        deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        return getAdministration(observable(thing)).observe(listener, fireImmediately);
    }
    return getAdministration(thing).observe(listener, fireImmediately);
}
function observeObservableProperty(thing, property, listener, fireImmediately) {
    if (isPlainObject(thing) && !isObservableObject(thing)) {
        deprecated("Passing plain objects to intercept / observe is deprecated and will be removed in 3.0");
        extendObservable(thing, {
            property: thing[property]
        });
        return observeObservableProperty(thing, property, listener, fireImmediately);
    }
    return getAdministration(thing, property).observe(listener, fireImmediately);
}
function toJS(source, detectCycles, __alreadySeen) {
    if (detectCycles === void 0) { detectCycles = true; }
    if (__alreadySeen === void 0) { __alreadySeen = null; }
    function cache(value) {
        if (detectCycles)
            { __alreadySeen.push([source, value]); }
        return value;
    }
    if (source instanceof Date || source instanceof RegExp)
        { return source; }
    if (detectCycles && __alreadySeen === null)
        { __alreadySeen = []; }
    if (detectCycles && source !== null && typeof source === "object") {
        for (var i = 0, l = __alreadySeen.length; i < l; i++)
            { if (__alreadySeen[i][0] === source)
                { return __alreadySeen[i][1]; } }
    }
    if (!source)
        { return source; }
    if (Array.isArray(source) || source instanceof ObservableArray) {
        var res = cache([]);
        var toAdd = source.map(function (value) { return toJS(value, detectCycles, __alreadySeen); });
        res.length = toAdd.length;
        for (var i = 0, l = toAdd.length; i < l; i++)
            { res[i] = toAdd[i]; }
        return res;
    }
    if (source instanceof ObservableMap) {
        var res_1 = cache({});
        source.forEach(function (value, key) { return res_1[key] = toJS(value, detectCycles, __alreadySeen); });
        return res_1;
    }
    if (isObservable(source) && source.$mobx instanceof ObservableValue)
        { return toJS(source(), detectCycles, __alreadySeen); }
    if (source instanceof ObservableValue)
        { return toJS(source.get(), detectCycles, __alreadySeen); }
    if (typeof source === "object") {
        var res = cache({});
        for (var key in source)
            { res[key] = toJS(source[key], detectCycles, __alreadySeen); }
        return res;
    }
    return source;
}
exports.toJS = toJS;
function toJSON(source, detectCycles, __alreadySeen) {
    if (detectCycles === void 0) { detectCycles = true; }
    if (__alreadySeen === void 0) { __alreadySeen = null; }
    deprecated("toJSON is deprecated. Use toJS instead");
    return toJS.apply(null, arguments);
}
exports.toJSON = toJSON;
function log(msg) {
    console.log(msg);
    return msg;
}
function whyRun(thing, prop) {
    switch (arguments.length) {
        case 0:
            thing = globalState.trackingDerivation;
            if (!thing)
                { return log("whyRun() can only be used if a derivation is active, or by passing an computed value / reaction explicitly. If you invoked whyRun from inside a computation; the computation is currently suspended but re-evaluating because somebody requested it's value."); }
            break;
        case 2:
            thing = getAtom(thing, prop);
            break;
    }
    thing = getAtom(thing);
    if (thing instanceof ComputedValue)
        { return log(thing.whyRun()); }
    else if (thing instanceof Reaction)
        { return log(thing.whyRun()); }
    else
        { invariant(false, "whyRun can only be used on reactions and computed values"); }
}
exports.whyRun = whyRun;
function createAction(actionName, fn) {
    invariant(typeof fn === "function", "`action` can only be invoked on functions");
    invariant(typeof actionName === "string" && actionName.length > 0, "actions should have valid names, got: '" + actionName + "'");
    var res = function () {
        return executeAction(actionName, fn, this, arguments);
    };
    res.isMobxAction = true;
    return res;
}
function executeAction(actionName, fn, scope, args) {
    invariant(!(globalState.trackingDerivation instanceof ComputedValue), "Computed values or transformers should not invoke actions or trigger other side effects");
    var notifySpy = isSpyEnabled();
    var startTime;
    if (notifySpy) {
        startTime = Date.now();
        var l = (args && args.length) || 0;
        var flattendArgs = new Array(l);
        if (l > 0)
            { for (var i = 0; i < l; i++)
                { flattendArgs[i] = args[i]; } }
        spyReportStart({
            type: "action",
            name: actionName,
            fn: fn,
            target: scope,
            arguments: flattendArgs
        });
    }
    var prevUntracked = untrackedStart();
    transactionStart(actionName, scope, false);
    var prevAllowStateChanges = allowStateChangesStart(true);
    try {
        return fn.apply(scope, args);
    }
    finally {
        allowStateChangesEnd(prevAllowStateChanges);
        transactionEnd(false);
        untrackedEnd(prevUntracked);
        if (notifySpy)
            { spyReportEnd({ time: Date.now() - startTime }); }
    }
}
function useStrict(strict) {
    if (arguments.length === 0) {
        deprecated("`useStrict` without arguments is deprecated, use `isStrictModeEnabled()` instead");
        return globalState.strictMode;
    }
    else {
        invariant(globalState.trackingDerivation === null, "It is not allowed to set `useStrict` when a derivation is running");
        globalState.strictMode = strict;
        globalState.allowStateChanges = !strict;
    }
}
exports.useStrict = useStrict;
function isStrictModeEnabled() {
    return globalState.strictMode;
}
exports.isStrictModeEnabled = isStrictModeEnabled;
function allowStateChanges(allowStateChanges, func) {
    var prev = allowStateChangesStart(allowStateChanges);
    var res = func();
    allowStateChangesEnd(prev);
    return res;
}
function allowStateChangesStart(allowStateChanges) {
    var prev = globalState.allowStateChanges;
    globalState.allowStateChanges = allowStateChanges;
    return prev;
}
function allowStateChangesEnd(prev) {
    globalState.allowStateChanges = prev;
}
var BaseAtom = (function () {
    function BaseAtom(name) {
        if (name === void 0) { name = "Atom@" + getNextId(); }
        this.name = name;
        this.isPendingUnobservation = true;
        this.observers = [];
        this.observersIndexes = {};
        this.diffValue = 0;
        this.lastAccessedBy = 0;
        this.lowestObserverState = IDerivationState.NOT_TRACKING;
    }
    BaseAtom.prototype.onBecomeUnobserved = function () {
    };
    BaseAtom.prototype.reportObserved = function () {
        reportObserved(this);
    };
    BaseAtom.prototype.reportChanged = function () {
        transactionStart("propagatingAtomChange", null, false);
        propagateChanged(this);
        transactionEnd(false);
    };
    BaseAtom.prototype.toString = function () {
        return this.name;
    };
    return BaseAtom;
}());
exports.BaseAtom = BaseAtom;
var Atom = (function (_super) {
    __extends(Atom, _super);
    function Atom(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
        if (name === void 0) { name = "Atom@" + getNextId(); }
        if (onBecomeObservedHandler === void 0) { onBecomeObservedHandler = noop; }
        if (onBecomeUnobservedHandler === void 0) { onBecomeUnobservedHandler = noop; }
        _super.call(this, name);
        this.name = name;
        this.onBecomeObservedHandler = onBecomeObservedHandler;
        this.onBecomeUnobservedHandler = onBecomeUnobservedHandler;
        this.isPendingUnobservation = false;
        this.isBeingTracked = false;
    }
    Atom.prototype.reportObserved = function () {
        startBatch();
        _super.prototype.reportObserved.call(this);
        if (!this.isBeingTracked) {
            this.isBeingTracked = true;
            this.onBecomeObservedHandler();
        }
        endBatch();
        return !!globalState.trackingDerivation;
    };
    Atom.prototype.onBecomeUnobserved = function () {
        this.isBeingTracked = false;
        this.onBecomeUnobservedHandler();
    };
    return Atom;
}(BaseAtom));
exports.Atom = Atom;
var ComputedValue = (function () {
    function ComputedValue(derivation, scope, compareStructural, name, setter) {
        this.derivation = derivation;
        this.scope = scope;
        this.compareStructural = compareStructural;
        this.dependenciesState = IDerivationState.NOT_TRACKING;
        this.observing = [];
        this.newObserving = null;
        this.isPendingUnobservation = false;
        this.observers = [];
        this.observersIndexes = {};
        this.diffValue = 0;
        this.runId = 0;
        this.lastAccessedBy = 0;
        this.lowestObserverState = IDerivationState.UP_TO_DATE;
        this.unboundDepsCount = 0;
        this.__mapid = "#" + getNextId();
        this.value = undefined;
        this.isComputing = false;
        this.isRunningSetter = false;
        this.name = name || "ComputedValue@" + getNextId();
        if (setter)
            { this.setter = createAction(name + "-setter", setter); }
    }
    ComputedValue.prototype.peek = function () {
        this.isComputing = true;
        var prevAllowStateChanges = allowStateChangesStart(false);
        var res = this.derivation.call(this.scope);
        allowStateChangesEnd(prevAllowStateChanges);
        this.isComputing = false;
        return res;
    };
    
    ComputedValue.prototype.peekUntracked = function () {
        var hasError = true;
        try {
            var res = this.peek();
            hasError = false;
            return res;
        }
        finally {
            if (hasError)
                { handleExceptionInDerivation(this); }
        }
    };
    ComputedValue.prototype.onBecomeStale = function () {
        propagateMaybeChanged(this);
    };
    ComputedValue.prototype.onBecomeUnobserved = function () {
        invariant(this.dependenciesState !== IDerivationState.NOT_TRACKING, "INTERNAL ERROR only onBecomeUnobserved shouldn't be called twice in a row");
        clearObserving(this);
        this.value = undefined;
    };
    ComputedValue.prototype.get = function () {
        invariant(!this.isComputing, "Cycle detected in computation " + this.name, this.derivation);
        startBatch();
        if (globalState.inBatch === 1) {
            if (shouldCompute(this))
                { this.value = this.peekUntracked(); }
        }
        else {
            reportObserved(this);
            if (shouldCompute(this))
                { if (this.trackAndCompute())
                    { propagateChangeConfirmed(this); } }
        }
        var result = this.value;
        endBatch();
        return result;
    };
    ComputedValue.prototype.recoverFromError = function () {
        this.isComputing = false;
    };
    ComputedValue.prototype.set = function (value) {
        if (this.setter) {
            invariant(!this.isRunningSetter, "The setter of computed value '" + this.name + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?");
            this.isRunningSetter = true;
            try {
                this.setter.call(this.scope, value);
            }
            finally {
                this.isRunningSetter = false;
            }
        }
        else
            { invariant(false, "[ComputedValue '" + this.name + "'] It is not possible to assign a new value to a computed value."); }
    };
    ComputedValue.prototype.trackAndCompute = function () {
        if (isSpyEnabled()) {
            spyReport({
                object: this,
                type: "compute",
                fn: this.derivation,
                target: this.scope
            });
        }
        var oldValue = this.value;
        var newValue = this.value = trackDerivedFunction(this, this.peek);
        return valueDidChange(this.compareStructural, newValue, oldValue);
    };
    ComputedValue.prototype.observe = function (listener, fireImmediately) {
        var _this = this;
        var firstTime = true;
        var prevValue = undefined;
        return autorun(function () {
            var newValue = _this.get();
            if (!firstTime || fireImmediately) {
                var prevU = untrackedStart();
                listener(newValue, prevValue);
                untrackedEnd(prevU);
            }
            firstTime = false;
            prevValue = newValue;
        });
    };
    ComputedValue.prototype.toJSON = function () {
        return this.get();
    };
    ComputedValue.prototype.toString = function () {
        return this.name + "[" + this.derivation.toString() + "]";
    };
    ComputedValue.prototype.whyRun = function () {
        var isTracking = Boolean(globalState.trackingDerivation);
        var observing = unique(this.isComputing ? this.newObserving : this.observing).map(function (dep) { return dep.name; });
        var observers = unique(getObservers(this).map(function (dep) { return dep.name; }));
        return (("\nWhyRun? computation '" + this.name + "':\n * Running because: " + (isTracking ? "[active] the value of this computation is needed by a reaction" : this.isComputing ? "[get] The value of this computed was requested outside a reaction" : "[idle] not running at the moment") + "\n") +
            (this.dependenciesState === IDerivationState.NOT_TRACKING
                ?
                    " * This computation is suspended (not in use by any reaction) and won't run automatically.\n\tDidn't expect this computation to be suspended at this point?\n\t  1. Make sure this computation is used by a reaction (reaction, autorun, observer).\n\t  2. Check whether you are using this computation synchronously (in the same stack as they reaction that needs it).\n"
                :
                    " * This computation will re-run if any of the following observables changes:\n    " + joinStrings(observing) + "\n    " + ((this.isComputing && isTracking) ? " (... or any observable accessed during the remainder of the current run)" : "") + "\n\tMissing items in this list?\n\t  1. Check whether all used values are properly marked as observable (use isObservable to verify)\n\t  2. Make sure you didn't dereference values too early. MobX observes props, not primitives. E.g: use 'person.name' instead of 'name' in your computation.\n  * If the outcome of this computation changes, the following observers will be re-run:\n    " + joinStrings(observers) + "\n"));
    };
    return ComputedValue;
}());
var IDerivationState;
(function (IDerivationState) {
    IDerivationState[IDerivationState["NOT_TRACKING"] = -1] = "NOT_TRACKING";
    IDerivationState[IDerivationState["UP_TO_DATE"] = 0] = "UP_TO_DATE";
    IDerivationState[IDerivationState["POSSIBLY_STALE"] = 1] = "POSSIBLY_STALE";
    IDerivationState[IDerivationState["STALE"] = 2] = "STALE";
})(IDerivationState || (IDerivationState = {}));
exports.IDerivationState = IDerivationState;
function shouldCompute(derivation) {
    switch (derivation.dependenciesState) {
        case IDerivationState.UP_TO_DATE: return false;
        case IDerivationState.NOT_TRACKING:
        case IDerivationState.STALE: return true;
        case IDerivationState.POSSIBLY_STALE: {
            var hasError = true;
            var prevUntracked = untrackedStart();
            try {
                var obs = derivation.observing, l = obs.length;
                for (var i = 0; i < l; i++) {
                    var obj = obs[i];
                    if (obj instanceof ComputedValue) {
                        obj.get();
                        if (derivation.dependenciesState === IDerivationState.STALE) {
                            hasError = false;
                            untrackedEnd(prevUntracked);
                            return true;
                        }
                    }
                }
                hasError = false;
                changeDependenciesStateTo0(derivation);
                untrackedEnd(prevUntracked);
                return false;
            }
            finally {
                if (hasError) {
                    changeDependenciesStateTo0(derivation);
                }
            }
        }
    }
}
function isComputingDerivation() {
    return globalState.trackingDerivation !== null;
}
function checkIfStateModificationsAreAllowed() {
    if (!globalState.allowStateChanges) {
        invariant(false, globalState.strictMode
            ? "It is not allowed to create or change state outside an `action` when MobX is in strict mode. Wrap the current method in `action` if this state change is intended"
            : "It is not allowed to change the state when a computed value or transformer is being evaluated. Use 'autorun' to create reactive functions with side-effects.");
    }
}
function trackDerivedFunction(derivation, f) {
    changeDependenciesStateTo0(derivation);
    derivation.newObserving = new Array(derivation.observing.length + 100);
    derivation.unboundDepsCount = 0;
    derivation.runId = ++globalState.runId;
    var prevTracking = globalState.trackingDerivation;
    globalState.trackingDerivation = derivation;
    var hasException = true;
    var result;
    try {
        result = f.call(derivation);
        hasException = false;
    }
    finally {
        if (hasException) {
            handleExceptionInDerivation(derivation);
        }
        else {
            globalState.trackingDerivation = prevTracking;
            bindDependencies(derivation);
        }
    }
    return result;
}
function handleExceptionInDerivation(derivation) {
    var message = ("[mobx] An uncaught exception occurred while calculating your computed value, autorun or transformer. Or inside the render() method of an observer based React component. " +
        "These functions should never throw exceptions as MobX will not always be able to recover from them. " +
        ("Please fix the error reported after this message or enable 'Pause on (caught) exceptions' in your debugger to find the root cause. In: '" + derivation.name + "'. ") +
        "For more details see https://github.com/mobxjs/mobx/issues/462");
    if (isSpyEnabled()) {
        spyReport({
            type: "error",
            message: message
        });
    }
    console.warn(message);
    changeDependenciesStateTo0(derivation);
    derivation.newObserving = null;
    derivation.unboundDepsCount = 0;
    derivation.recoverFromError();
    endBatch();
    resetGlobalState();
}
function bindDependencies(derivation) {
    var prevObserving = derivation.observing;
    var observing = derivation.observing = derivation.newObserving;
    derivation.newObserving = null;
    var i0 = 0, l = derivation.unboundDepsCount;
    for (var i = 0; i < l; i++) {
        var dep = observing[i];
        if (dep.diffValue === 0) {
            dep.diffValue = 1;
            if (i0 !== i)
                { observing[i0] = dep; }
            i0++;
        }
    }
    observing.length = i0;
    l = prevObserving.length;
    while (l--) {
        var dep = prevObserving[l];
        if (dep.diffValue === 0) {
            removeObserver(dep, derivation);
        }
        dep.diffValue = 0;
    }
    while (i0--) {
        var dep = observing[i0];
        if (dep.diffValue === 1) {
            dep.diffValue = 0;
            addObserver(dep, derivation);
        }
    }
}
function clearObserving(derivation) {
    var obs = derivation.observing;
    var i = obs.length;
    while (i--)
        { removeObserver(obs[i], derivation); }
    derivation.dependenciesState = IDerivationState.NOT_TRACKING;
    obs.length = 0;
}
function untracked(action) {
    var prev = untrackedStart();
    var res = action();
    untrackedEnd(prev);
    return res;
}
exports.untracked = untracked;
function untrackedStart() {
    var prev = globalState.trackingDerivation;
    globalState.trackingDerivation = null;
    return prev;
}
function untrackedEnd(prev) {
    globalState.trackingDerivation = prev;
}
function changeDependenciesStateTo0(derivation) {
    if (derivation.dependenciesState === IDerivationState.UP_TO_DATE)
        { return; }
    derivation.dependenciesState = IDerivationState.UP_TO_DATE;
    var obs = derivation.observing;
    var i = obs.length;
    while (i--)
        { obs[i].lowestObserverState = IDerivationState.UP_TO_DATE; }
}
var persistentKeys = ["mobxGuid", "resetId", "spyListeners", "strictMode", "runId"];
var MobXGlobals = (function () {
    function MobXGlobals() {
        this.version = 4;
        this.trackingDerivation = null;
        this.runId = 0;
        this.mobxGuid = 0;
        this.inTransaction = 0;
        this.isRunningReactions = false;
        this.inBatch = 0;
        this.pendingUnobservations = [];
        this.pendingReactions = [];
        this.allowStateChanges = true;
        this.strictMode = false;
        this.resetId = 0;
        this.spyListeners = [];
    }
    return MobXGlobals;
}());
var globalState = (function () {
    var res = new MobXGlobals();
    if (commonjsGlobal.__mobservableTrackingStack || commonjsGlobal.__mobservableViewStack)
        { throw new Error("[mobx] An incompatible version of mobservable is already loaded."); }
    if (commonjsGlobal.__mobxGlobal && commonjsGlobal.__mobxGlobal.version !== res.version)
        { throw new Error("[mobx] An incompatible version of mobx is already loaded."); }
    if (commonjsGlobal.__mobxGlobal)
        { return commonjsGlobal.__mobxGlobal; }
    return commonjsGlobal.__mobxGlobal = res;
})();
function registerGlobals() {
}
function resetGlobalState() {
    globalState.resetId++;
    var defaultGlobals = new MobXGlobals();
    for (var key in defaultGlobals)
        { if (persistentKeys.indexOf(key) === -1)
            { globalState[key] = defaultGlobals[key]; } }
    globalState.allowStateChanges = !globalState.strictMode;
}
function hasObservers(observable) {
    return observable.observers && observable.observers.length > 0;
}
function getObservers(observable) {
    return observable.observers;
}
function invariantObservers(observable) {
    var list = observable.observers;
    var map = observable.observersIndexes;
    var l = list.length;
    for (var i = 0; i < l; i++) {
        var id = list[i].__mapid;
        if (i) {
            invariant(map[id] === i, "INTERNAL ERROR maps derivation.__mapid to index in list");
        }
        else {
            invariant(!(id in map), "INTERNAL ERROR observer on index 0 shouldnt be held in map.");
        }
    }
    invariant(list.length === 0 || Object.keys(map).length === list.length - 1, "INTERNAL ERROR there is no junk in map");
}
function addObserver(observable, node) {
    var l = observable.observers.length;
    if (l) {
        observable.observersIndexes[node.__mapid] = l;
    }
    observable.observers[l] = node;
    if (observable.lowestObserverState > node.dependenciesState)
        { observable.lowestObserverState = node.dependenciesState; }
}
function removeObserver(observable, node) {
    if (observable.observers.length === 1) {
        observable.observers.length = 0;
        queueForUnobservation(observable);
    }
    else {
        var list = observable.observers;
        var map_1 = observable.observersIndexes;
        var filler = list.pop();
        if (filler !== node) {
            var index = map_1[node.__mapid] || 0;
            if (index) {
                map_1[filler.__mapid] = index;
            }
            else {
                delete map_1[filler.__mapid];
            }
            list[index] = filler;
        }
        delete map_1[node.__mapid];
    }
}
function queueForUnobservation(observable) {
    if (!observable.isPendingUnobservation) {
        observable.isPendingUnobservation = true;
        globalState.pendingUnobservations.push(observable);
    }
}
function startBatch() {
    globalState.inBatch++;
}
function endBatch() {
    if (globalState.inBatch === 1) {
        var list = globalState.pendingUnobservations;
        for (var i = 0; i < list.length; i++) {
            var observable_1 = list[i];
            observable_1.isPendingUnobservation = false;
            if (observable_1.observers.length === 0) {
                observable_1.onBecomeUnobserved();
            }
        }
        globalState.pendingUnobservations = [];
    }
    globalState.inBatch--;
}
function reportObserved(observable) {
    var derivation = globalState.trackingDerivation;
    if (derivation !== null) {
        if (derivation.runId !== observable.lastAccessedBy) {
            observable.lastAccessedBy = derivation.runId;
            derivation.newObserving[derivation.unboundDepsCount++] = observable;
        }
    }
    else if (observable.observers.length === 0) {
        queueForUnobservation(observable);
    }
}
function invariantLOS(observable, msg) {
    var min = getObservers(observable).reduce(function (a, b) { return Math.min(a, b.dependenciesState); }, 2);
    if (min >= observable.lowestObserverState)
        { return; }
    throw new Error("lowestObserverState is wrong for " + msg + " because " + min + " < " + observable.lowestObserverState);
}
function propagateChanged(observable) {
    if (observable.lowestObserverState === IDerivationState.STALE)
        { return; }
    observable.lowestObserverState = IDerivationState.STALE;
    var observers = observable.observers;
    var i = observers.length;
    while (i--) {
        var d = observers[i];
        if (d.dependenciesState === IDerivationState.UP_TO_DATE)
            { d.onBecomeStale(); }
        d.dependenciesState = IDerivationState.STALE;
    }
}
function propagateChangeConfirmed(observable) {
    if (observable.lowestObserverState === IDerivationState.STALE)
        { return; }
    observable.lowestObserverState = IDerivationState.STALE;
    var observers = observable.observers;
    var i = observers.length;
    while (i--) {
        var d = observers[i];
        if (d.dependenciesState === IDerivationState.POSSIBLY_STALE)
            { d.dependenciesState = IDerivationState.STALE; }
        else if (d.dependenciesState === IDerivationState.UP_TO_DATE)
            { observable.lowestObserverState = IDerivationState.UP_TO_DATE; }
    }
}
function propagateMaybeChanged(observable) {
    if (observable.lowestObserverState !== IDerivationState.UP_TO_DATE)
        { return; }
    observable.lowestObserverState = IDerivationState.POSSIBLY_STALE;
    var observers = observable.observers;
    var i = observers.length;
    while (i--) {
        var d = observers[i];
        if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
            d.dependenciesState = IDerivationState.POSSIBLY_STALE;
            d.onBecomeStale();
        }
    }
}
var Reaction = (function () {
    function Reaction(name, onInvalidate) {
        if (name === void 0) { name = "Reaction@" + getNextId(); }
        this.name = name;
        this.onInvalidate = onInvalidate;
        this.observing = [];
        this.newObserving = [];
        this.dependenciesState = IDerivationState.NOT_TRACKING;
        this.diffValue = 0;
        this.runId = 0;
        this.unboundDepsCount = 0;
        this.__mapid = "#" + getNextId();
        this.isDisposed = false;
        this._isScheduled = false;
        this._isTrackPending = false;
        this._isRunning = false;
    }
    Reaction.prototype.onBecomeStale = function () {
        this.schedule();
    };
    Reaction.prototype.schedule = function () {
        if (!this._isScheduled) {
            this._isScheduled = true;
            globalState.pendingReactions.push(this);
            startBatch();
            runReactions();
            endBatch();
        }
    };
    Reaction.prototype.isScheduled = function () {
        return this._isScheduled;
    };
    Reaction.prototype.runReaction = function () {
        if (!this.isDisposed) {
            this._isScheduled = false;
            if (shouldCompute(this)) {
                this._isTrackPending = true;
                this.onInvalidate();
                if (this._isTrackPending && isSpyEnabled()) {
                    spyReport({
                        object: this,
                        type: "scheduled-reaction"
                    });
                }
            }
        }
    };
    Reaction.prototype.track = function (fn) {
        startBatch();
        var notify = isSpyEnabled();
        var startTime;
        if (notify) {
            startTime = Date.now();
            spyReportStart({
                object: this,
                type: "reaction",
                fn: fn
            });
        }
        this._isRunning = true;
        trackDerivedFunction(this, fn);
        this._isRunning = false;
        this._isTrackPending = false;
        if (this.isDisposed) {
            clearObserving(this);
        }
        if (notify) {
            spyReportEnd({
                time: Date.now() - startTime
            });
        }
        endBatch();
    };
    Reaction.prototype.recoverFromError = function () {
        this._isRunning = false;
        this._isTrackPending = false;
    };
    Reaction.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            if (!this._isRunning) {
                startBatch();
                clearObserving(this);
                endBatch();
            }
        }
    };
    Reaction.prototype.getDisposer = function () {
        var r = this.dispose.bind(this);
        r.$mobx = this;
        return r;
    };
    Reaction.prototype.toString = function () {
        return "Reaction[" + this.name + "]";
    };
    Reaction.prototype.whyRun = function () {
        var observing = unique(this._isRunning ? this.newObserving : this.observing).map(function (dep) { return dep.name; });
        return ("\nWhyRun? reaction '" + this.name + "':\n * Status: [" + (this.isDisposed ? "stopped" : this._isRunning ? "running" : this.isScheduled() ? "scheduled" : "idle") + "]\n * This reaction will re-run if any of the following observables changes:\n    " + joinStrings(observing) + "\n    " + ((this._isRunning) ? " (... or any observable accessed during the remainder of the current run)" : "") + "\n\tMissing items in this list?\n\t  1. Check whether all used values are properly marked as observable (use isObservable to verify)\n\t  2. Make sure you didn't dereference values too early. MobX observes props, not primitives. E.g: use 'person.name' instead of 'name' in your computation.\n");
    };
    return Reaction;
}());
exports.Reaction = Reaction;
var MAX_REACTION_ITERATIONS = 100;
function runReactions() {
    if (globalState.isRunningReactions === true || globalState.inTransaction > 0)
        { return; }
    globalState.isRunningReactions = true;
    var allReactions = globalState.pendingReactions;
    var iterations = 0;
    while (allReactions.length > 0) {
        if (++iterations === MAX_REACTION_ITERATIONS) {
            resetGlobalState();
            throw new Error(("Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations.")
                + (" Probably there is a cycle in the reactive function: " + allReactions[0]));
        }
        var remainingReactions = allReactions.splice(0);
        for (var i = 0, l = remainingReactions.length; i < l; i++)
            { remainingReactions[i].runReaction(); }
    }
    globalState.isRunningReactions = false;
}
var spyEnabled = false;
function isSpyEnabled() {
    return spyEnabled;
}
function spyReport(event) {
    if (!spyEnabled)
        { return false; }
    var listeners = globalState.spyListeners;
    for (var i = 0, l = listeners.length; i < l; i++)
        { listeners[i](event); }
}
function spyReportStart(event) {
    var change = objectAssign({}, event, { spyReportStart: true });
    spyReport(change);
}
var END_EVENT = { spyReportEnd: true };
function spyReportEnd(change) {
    if (change)
        { spyReport(objectAssign({}, change, END_EVENT)); }
    else
        { spyReport(END_EVENT); }
}
function spy(listener) {
    globalState.spyListeners.push(listener);
    spyEnabled = globalState.spyListeners.length > 0;
    return once(function () {
        var idx = globalState.spyListeners.indexOf(listener);
        if (idx !== -1)
            { globalState.spyListeners.splice(idx, 1); }
        spyEnabled = globalState.spyListeners.length > 0;
    });
}
exports.spy = spy;
function trackTransitions(onReport) {
    deprecated("trackTransitions is deprecated. Use mobx.spy instead");
    if (typeof onReport === "boolean") {
        deprecated("trackTransitions only takes a single callback function. If you are using the mobx-react-devtools, please update them first");
        onReport = arguments[1];
    }
    if (!onReport) {
        deprecated("trackTransitions without callback has been deprecated and is a no-op now. If you are using the mobx-react-devtools, please update them first");
        return function () { };
    }
    return spy(onReport);
}
function transaction(action, thisArg, report) {
    if (thisArg === void 0) { thisArg = undefined; }
    if (report === void 0) { report = true; }
    transactionStart((action.name) || "anonymous transaction", thisArg, report);
    var res = action.call(thisArg);
    transactionEnd(report);
    return res;
}
exports.transaction = transaction;
function transactionStart(name, thisArg, report) {
    if (thisArg === void 0) { thisArg = undefined; }
    if (report === void 0) { report = true; }
    startBatch();
    globalState.inTransaction += 1;
    if (report && isSpyEnabled()) {
        spyReportStart({
            type: "transaction",
            target: thisArg,
            name: name
        });
    }
}
function transactionEnd(report) {
    if (report === void 0) { report = true; }
    if (--globalState.inTransaction === 0) {
        runReactions();
    }
    if (report && isSpyEnabled())
        { spyReportEnd(); }
    endBatch();
}
function hasInterceptors(interceptable) {
    return (interceptable.interceptors && interceptable.interceptors.length > 0);
}
function registerInterceptor(interceptable, handler) {
    var interceptors = interceptable.interceptors || (interceptable.interceptors = []);
    interceptors.push(handler);
    return once(function () {
        var idx = interceptors.indexOf(handler);
        if (idx !== -1)
            { interceptors.splice(idx, 1); }
    });
}
function interceptChange(interceptable, change) {
    var prevU = untrackedStart();
    var interceptors = interceptable.interceptors;
    for (var i = 0, l = interceptors.length; i < l; i++) {
        change = interceptors[i](change);
        invariant(!change || change.type, "Intercept handlers should return nothing or a change object");
        if (!change)
            { return null; }
    }
    untrackedEnd(prevU);
    return change;
}
function hasListeners(listenable) {
    return listenable.changeListeners && listenable.changeListeners.length > 0;
}
function registerListener(listenable, handler) {
    var listeners = listenable.changeListeners || (listenable.changeListeners = []);
    listeners.push(handler);
    return once(function () {
        var idx = listeners.indexOf(handler);
        if (idx !== -1)
            { listeners.splice(idx, 1); }
    });
}
function notifyListeners(listenable, change) {
    var prevU = untrackedStart();
    var listeners = listenable.changeListeners;
    if (!listeners)
        { return; }
    listeners = listeners.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
        if (Array.isArray(change)) {
            listeners[i].apply(null, change);
        }
        else {
            listeners[i](change);
        }
    }
    untrackedEnd(prevU);
}
var ValueMode;
(function (ValueMode) {
    ValueMode[ValueMode["Recursive"] = 0] = "Recursive";
    ValueMode[ValueMode["Reference"] = 1] = "Reference";
    ValueMode[ValueMode["Structure"] = 2] = "Structure";
    ValueMode[ValueMode["Flat"] = 3] = "Flat";
})(ValueMode || (ValueMode = {}));
function asReference(value) {
    return new AsReference(value);
}
exports.asReference = asReference;
function asStructure(value) {
    return new AsStructure(value);
}
exports.asStructure = asStructure;
function asFlat(value) {
    return new AsFlat(value);
}
exports.asFlat = asFlat;
var AsReference = (function () {
    function AsReference(value) {
        this.value = value;
        assertUnwrapped(value, "Modifiers are not allowed to be nested");
    }
    return AsReference;
}());
var AsStructure = (function () {
    function AsStructure(value) {
        this.value = value;
        assertUnwrapped(value, "Modifiers are not allowed to be nested");
    }
    return AsStructure;
}());
var AsFlat = (function () {
    function AsFlat(value) {
        this.value = value;
        assertUnwrapped(value, "Modifiers are not allowed to be nested");
    }
    return AsFlat;
}());
function asMap(data, modifierFunc) {
    return map(data, modifierFunc);
}
exports.asMap = asMap;
function getValueModeFromValue(value, defaultMode) {
    if (value instanceof AsReference)
        { return [ValueMode.Reference, value.value]; }
    if (value instanceof AsStructure)
        { return [ValueMode.Structure, value.value]; }
    if (value instanceof AsFlat)
        { return [ValueMode.Flat, value.value]; }
    return [defaultMode, value];
}
function getValueModeFromModifierFunc(func) {
    if (func === asReference)
        { return ValueMode.Reference; }
    else if (func === asStructure)
        { return ValueMode.Structure; }
    else if (func === asFlat)
        { return ValueMode.Flat; }
    invariant(func === undefined, "Cannot determine value mode from function. Please pass in one of these: mobx.asReference, mobx.asStructure or mobx.asFlat, got: " + func);
    return ValueMode.Recursive;
}
function makeChildObservable(value, parentMode, name) {
    var childMode;
    if (isObservable(value))
        { return value; }
    switch (parentMode) {
        case ValueMode.Reference:
            return value;
        case ValueMode.Flat:
            assertUnwrapped(value, "Items inside 'asFlat' cannot have modifiers");
            childMode = ValueMode.Reference;
            break;
        case ValueMode.Structure:
            assertUnwrapped(value, "Items inside 'asStructure' cannot have modifiers");
            childMode = ValueMode.Structure;
            break;
        case ValueMode.Recursive:
            _a = getValueModeFromValue(value, ValueMode.Recursive), childMode = _a[0], value = _a[1];
            break;
        default:
            invariant(false, "Illegal State");
    }
    if (Array.isArray(value))
        { return createObservableArray(value, childMode, name); }
    if (isPlainObject(value) && Object.isExtensible(value))
        { return extendObservableHelper(value, value, childMode, name); }
    return value;
    var _a;
}
function assertUnwrapped(value, message) {
    if (value instanceof AsReference || value instanceof AsStructure || value instanceof AsFlat)
        { throw new Error("[mobx] asStructure / asReference / asFlat cannot be used here. " + message); }
}
var safariPrototypeSetterInheritanceBug = (function () {
    var v = false;
    var p = {};
    Object.defineProperty(p, "0", { set: function () { v = true; } });
    Object.create(p)["0"] = 1;
    return v === false;
})();
var OBSERVABLE_ARRAY_BUFFER_SIZE = 0;
var StubArray = (function () {
    function StubArray() {
    }
    return StubArray;
}());
StubArray.prototype = [];
var ObservableArrayAdministration = (function () {
    function ObservableArrayAdministration(name, mode, array, owned) {
        this.mode = mode;
        this.array = array;
        this.owned = owned;
        this.lastKnownLength = 0;
        this.interceptors = null;
        this.changeListeners = null;
        this.atom = new BaseAtom(name || ("ObservableArray@" + getNextId()));
    }
    ObservableArrayAdministration.prototype.makeReactiveArrayItem = function (value) {
        assertUnwrapped(value, "Array values cannot have modifiers");
        if (this.mode === ValueMode.Flat || this.mode === ValueMode.Reference)
            { return value; }
        return makeChildObservable(value, this.mode, this.atom.name + "[..]");
    };
    ObservableArrayAdministration.prototype.intercept = function (handler) {
        return registerInterceptor(this, handler);
    };
    ObservableArrayAdministration.prototype.observe = function (listener, fireImmediately) {
        if (fireImmediately === void 0) { fireImmediately = false; }
        if (fireImmediately) {
            listener({
                object: this.array,
                type: "splice",
                index: 0,
                added: this.values.slice(),
                addedCount: this.values.length,
                removed: [],
                removedCount: 0
            });
        }
        return registerListener(this, listener);
    };
    ObservableArrayAdministration.prototype.getArrayLength = function () {
        this.atom.reportObserved();
        return this.values.length;
    };
    ObservableArrayAdministration.prototype.setArrayLength = function (newLength) {
        if (typeof newLength !== "number" || newLength < 0)
            { throw new Error("[mobx.array] Out of range: " + newLength); }
        var currentLength = this.values.length;
        if (newLength === currentLength)
            { return; }
        else if (newLength > currentLength)
            { this.spliceWithArray(currentLength, 0, new Array(newLength - currentLength)); }
        else
            { this.spliceWithArray(newLength, currentLength - newLength); }
    };
    ObservableArrayAdministration.prototype.updateArrayLength = function (oldLength, delta) {
        if (oldLength !== this.lastKnownLength)
            { throw new Error("[mobx] Modification exception: the internal structure of an observable array was changed. Did you use peek() to change it?"); }
        this.lastKnownLength += delta;
        if (delta > 0 && oldLength + delta + 1 > OBSERVABLE_ARRAY_BUFFER_SIZE)
            { reserveArrayBuffer(oldLength + delta + 1); }
    };
    ObservableArrayAdministration.prototype.spliceWithArray = function (index, deleteCount, newItems) {
        checkIfStateModificationsAreAllowed();
        var length = this.values.length;
        if (index === undefined)
            { index = 0; }
        else if (index > length)
            { index = length; }
        else if (index < 0)
            { index = Math.max(0, length + index); }
        if (arguments.length === 1)
            { deleteCount = length - index; }
        else if (deleteCount === undefined || deleteCount === null)
            { deleteCount = 0; }
        else
            { deleteCount = Math.max(0, Math.min(deleteCount, length - index)); }
        if (newItems === undefined)
            { newItems = []; }
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                object: this.array,
                type: "splice",
                index: index,
                removedCount: deleteCount,
                added: newItems
            });
            if (!change)
                { return EMPTY_ARRAY; }
            deleteCount = change.removedCount;
            newItems = change.added;
        }
        newItems = newItems.map(this.makeReactiveArrayItem, this);
        var lengthDelta = newItems.length - deleteCount;
        this.updateArrayLength(length, lengthDelta);
        var res = (_a = this.values).splice.apply(_a, [index, deleteCount].concat(newItems));
        if (deleteCount !== 0 || newItems.length !== 0)
            { this.notifyArraySplice(index, newItems, res); }
        return res;
        var _a;
    };
    ObservableArrayAdministration.prototype.notifyArrayChildUpdate = function (index, newValue, oldValue) {
        var notifySpy = !this.owned && isSpyEnabled();
        var notify = hasListeners(this);
        var change = notify || notifySpy ? {
            object: this.array,
            type: "update",
            index: index, newValue: newValue, oldValue: oldValue
        } : null;
        if (notifySpy)
            { spyReportStart(change); }
        this.atom.reportChanged();
        if (notify)
            { notifyListeners(this, change); }
        if (notifySpy)
            { spyReportEnd(); }
    };
    ObservableArrayAdministration.prototype.notifyArraySplice = function (index, added, removed) {
        var notifySpy = !this.owned && isSpyEnabled();
        var notify = hasListeners(this);
        var change = notify || notifySpy ? {
            object: this.array,
            type: "splice",
            index: index, removed: removed, added: added,
            removedCount: removed.length,
            addedCount: added.length
        } : null;
        if (notifySpy)
            { spyReportStart(change); }
        this.atom.reportChanged();
        if (notify)
            { notifyListeners(this, change); }
        if (notifySpy)
            { spyReportEnd(); }
    };
    return ObservableArrayAdministration;
}());
var ObservableArray = (function (_super) {
    __extends(ObservableArray, _super);
    function ObservableArray(initialValues, mode, name, owned) {
        if (owned === void 0) { owned = false; }
        _super.call(this);
        var adm = new ObservableArrayAdministration(name, mode, this, owned);
        addHiddenFinalProp(this, "$mobx", adm);
        if (initialValues && initialValues.length) {
            adm.updateArrayLength(0, initialValues.length);
            adm.values = initialValues.map(adm.makeReactiveArrayItem, adm);
            adm.notifyArraySplice(0, adm.values.slice(), EMPTY_ARRAY);
        }
        else {
            adm.values = [];
        }
        if (safariPrototypeSetterInheritanceBug) {
            Object.defineProperty(adm.array, "0", ENTRY_0);
        }
    }
    ObservableArray.prototype.intercept = function (handler) {
        return this.$mobx.intercept(handler);
    };
    ObservableArray.prototype.observe = function (listener, fireImmediately) {
        if (fireImmediately === void 0) { fireImmediately = false; }
        return this.$mobx.observe(listener, fireImmediately);
    };
    ObservableArray.prototype.clear = function () {
        return this.splice(0);
    };
    ObservableArray.prototype.concat = function () {
        var arguments$1 = arguments;

        var arrays = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arrays[_i - 0] = arguments$1[_i];
        }
        this.$mobx.atom.reportObserved();
        return Array.prototype.concat.apply(this.slice(), arrays.map(function (a) { return isObservableArray(a) ? a.slice() : a; }));
    };
    ObservableArray.prototype.replace = function (newItems) {
        return this.$mobx.spliceWithArray(0, this.$mobx.values.length, newItems);
    };
    ObservableArray.prototype.toJS = function () {
        return this.slice();
    };
    ObservableArray.prototype.toJSON = function () {
        return this.toJS();
    };
    ObservableArray.prototype.peek = function () {
        return this.$mobx.values;
    };
    ObservableArray.prototype.find = function (predicate, thisArg, fromIndex) {
        var this$1 = this;

        if (fromIndex === void 0) { fromIndex = 0; }
        this.$mobx.atom.reportObserved();
        var items = this.$mobx.values, l = items.length;
        for (var i = fromIndex; i < l; i++)
            { if (predicate.call(thisArg, items[i], i, this$1))
                { return items[i]; } }
        return undefined;
    };
    ObservableArray.prototype.splice = function (index, deleteCount) {
        var arguments$1 = arguments;

        var newItems = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            newItems[_i - 2] = arguments$1[_i];
        }
        switch (arguments.length) {
            case 0:
                return [];
            case 1:
                return this.$mobx.spliceWithArray(index);
            case 2:
                return this.$mobx.spliceWithArray(index, deleteCount);
        }
        return this.$mobx.spliceWithArray(index, deleteCount, newItems);
    };
    ObservableArray.prototype.push = function () {
        var arguments$1 = arguments;

        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments$1[_i];
        }
        var adm = this.$mobx;
        adm.spliceWithArray(adm.values.length, 0, items);
        return adm.values.length;
    };
    ObservableArray.prototype.pop = function () {
        return this.splice(Math.max(this.$mobx.values.length - 1, 0), 1)[0];
    };
    ObservableArray.prototype.shift = function () {
        return this.splice(0, 1)[0];
    };
    ObservableArray.prototype.unshift = function () {
        var arguments$1 = arguments;

        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments$1[_i];
        }
        var adm = this.$mobx;
        adm.spliceWithArray(0, 0, items);
        return adm.values.length;
    };
    ObservableArray.prototype.reverse = function () {
        this.$mobx.atom.reportObserved();
        var clone = this.slice();
        return clone.reverse.apply(clone, arguments);
    };
    ObservableArray.prototype.sort = function (compareFn) {
        this.$mobx.atom.reportObserved();
        var clone = this.slice();
        return clone.sort.apply(clone, arguments);
    };
    ObservableArray.prototype.remove = function (value) {
        var idx = this.$mobx.values.indexOf(value);
        if (idx > -1) {
            this.splice(idx, 1);
            return true;
        }
        return false;
    };
    ObservableArray.prototype.toString = function () {
        return "[mobx.array] " + Array.prototype.toString.apply(this.$mobx.values, arguments);
    };
    ObservableArray.prototype.toLocaleString = function () {
        return "[mobx.array] " + Array.prototype.toLocaleString.apply(this.$mobx.values, arguments);
    };
    return ObservableArray;
}(StubArray));
declareIterator(ObservableArray.prototype, function () {
    return arrayAsIterator(this.slice());
});
makeNonEnumerable(ObservableArray.prototype, [
    "constructor",
    "intercept",
    "observe",
    "clear",
    "concat",
    "replace",
    "toJS",
    "toJSON",
    "peek",
    "find",
    "splice",
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "remove",
    "toString",
    "toLocaleString"
]);
Object.defineProperty(ObservableArray.prototype, "length", {
    enumerable: false,
    configurable: true,
    get: function () {
        return this.$mobx.getArrayLength();
    },
    set: function (newLength) {
        this.$mobx.setArrayLength(newLength);
    }
});
[
    "every",
    "filter",
    "forEach",
    "indexOf",
    "join",
    "lastIndexOf",
    "map",
    "reduce",
    "reduceRight",
    "slice",
    "some"
].forEach(function (funcName) {
    var baseFunc = Array.prototype[funcName];
    addHiddenProp(ObservableArray.prototype, funcName, function () {
        this.$mobx.atom.reportObserved();
        return baseFunc.apply(this.$mobx.values, arguments);
    });
});
var ENTRY_0 = {
    configurable: true,
    enumerable: false,
    set: createArraySetter(0),
    get: createArrayGetter(0)
};
function createArrayBufferItem(index) {
    var set = createArraySetter(index);
    var get = createArrayGetter(index);
    Object.defineProperty(ObservableArray.prototype, "" + index, {
        enumerable: false,
        configurable: true,
        set: set, get: get
    });
}
function createArraySetter(index) {
    return function (newValue) {
        var adm = this.$mobx;
        var values = adm.values;
        assertUnwrapped(newValue, "Modifiers cannot be used on array values. For non-reactive array values use makeReactive(asFlat(array)).");
        if (index < values.length) {
            checkIfStateModificationsAreAllowed();
            var oldValue = values[index];
            if (hasInterceptors(adm)) {
                var change = interceptChange(adm, {
                    type: "update",
                    object: adm.array,
                    index: index, newValue: newValue
                });
                if (!change)
                    { return; }
                newValue = change.newValue;
            }
            newValue = adm.makeReactiveArrayItem(newValue);
            var changed = (adm.mode === ValueMode.Structure) ? !deepEquals(oldValue, newValue) : oldValue !== newValue;
            if (changed) {
                values[index] = newValue;
                adm.notifyArrayChildUpdate(index, newValue, oldValue);
            }
        }
        else if (index === values.length) {
            adm.spliceWithArray(index, 0, [newValue]);
        }
        else
            { throw new Error("[mobx.array] Index out of bounds, " + index + " is larger than " + values.length); }
    };
}
function createArrayGetter(index) {
    return function () {
        var impl = this.$mobx;
        if (impl && index < impl.values.length) {
            impl.atom.reportObserved();
            return impl.values[index];
        }
        console.warn("[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + impl.values.length + "). Please check length first. Out of bound indices will not be tracked by MobX");
        return undefined;
    };
}
function reserveArrayBuffer(max) {
    for (var index = OBSERVABLE_ARRAY_BUFFER_SIZE; index < max; index++)
        { createArrayBufferItem(index); }
    OBSERVABLE_ARRAY_BUFFER_SIZE = max;
}
reserveArrayBuffer(1000);
function createObservableArray(initialValues, mode, name) {
    return new ObservableArray(initialValues, mode, name);
}
function fastArray(initialValues) {
    deprecated("fastArray is deprecated. Please use `observable(asFlat([]))`");
    return createObservableArray(initialValues, ValueMode.Flat, null);
}
exports.fastArray = fastArray;
function isObservableArray(thing) {
    return thing instanceof ObservableArray;
}
exports.isObservableArray = isObservableArray;
var ObservableMapMarker = {};
var ObservableMap = (function () {
    function ObservableMap(initialData, valueModeFunc) {
        var _this = this;
        this.$mobx = ObservableMapMarker;
        this._data = {};
        this._hasMap = {};
        this.name = "ObservableMap@" + getNextId();
        this._keys = new ObservableArray(null, ValueMode.Reference, this.name + ".keys()", true);
        this.interceptors = null;
        this.changeListeners = null;
        this._valueMode = getValueModeFromModifierFunc(valueModeFunc);
        if (this._valueMode === ValueMode.Flat)
            { this._valueMode = ValueMode.Reference; }
        allowStateChanges(true, function () {
            if (isPlainObject(initialData))
                { _this.merge(initialData); }
            else if (Array.isArray(initialData))
                { initialData.forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    return _this.set(key, value);
                }); }
        });
    }
    ObservableMap.prototype._has = function (key) {
        return typeof this._data[key] !== "undefined";
    };
    ObservableMap.prototype.has = function (key) {
        if (!this.isValidKey(key))
            { return false; }
        key = "" + key;
        if (this._hasMap[key])
            { return this._hasMap[key].get(); }
        return this._updateHasMapEntry(key, false).get();
    };
    ObservableMap.prototype.set = function (key, value) {
        this.assertValidKey(key);
        key = "" + key;
        var hasKey = this._has(key);
        assertUnwrapped(value, "[mobx.map.set] Expected unwrapped value to be inserted to key '" + key + "'. If you need to use modifiers pass them as second argument to the constructor");
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: hasKey ? "update" : "add",
                object: this,
                newValue: value,
                name: key
            });
            if (!change)
                { return; }
            value = change.newValue;
        }
        if (hasKey) {
            this._updateValue(key, value);
        }
        else {
            this._addValue(key, value);
        }
    };
    ObservableMap.prototype.delete = function (key) {
        var _this = this;
        this.assertValidKey(key);
        key = "" + key;
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: "delete",
                object: this,
                name: key
            });
            if (!change)
                { return false; }
        }
        if (this._has(key)) {
            var notifySpy = isSpyEnabled();
            var notify = hasListeners(this);
            var change = notify || notifySpy ? {
                type: "delete",
                object: this,
                oldValue: this._data[key].value,
                name: key
            } : null;
            if (notifySpy)
                { spyReportStart(change); }
            transaction(function () {
                _this._keys.remove(key);
                _this._updateHasMapEntry(key, false);
                var observable = _this._data[key];
                observable.setNewValue(undefined);
                _this._data[key] = undefined;
            }, undefined, false);
            if (notify)
                { notifyListeners(this, change); }
            if (notifySpy)
                { spyReportEnd(); }
            return true;
        }
        return false;
    };
    ObservableMap.prototype._updateHasMapEntry = function (key, value) {
        var entry = this._hasMap[key];
        if (entry) {
            entry.setNewValue(value);
        }
        else {
            entry = this._hasMap[key] = new ObservableValue(value, ValueMode.Reference, this.name + "." + key + "?", false);
        }
        return entry;
    };
    ObservableMap.prototype._updateValue = function (name, newValue) {
        var observable = this._data[name];
        newValue = observable.prepareNewValue(newValue);
        if (newValue !== UNCHANGED) {
            var notifySpy = isSpyEnabled();
            var notify = hasListeners(this);
            var change = notify || notifySpy ? {
                type: "update",
                object: this,
                oldValue: observable.value,
                name: name, newValue: newValue
            } : null;
            if (notifySpy)
                { spyReportStart(change); }
            observable.setNewValue(newValue);
            if (notify)
                { notifyListeners(this, change); }
            if (notifySpy)
                { spyReportEnd(); }
        }
    };
    ObservableMap.prototype._addValue = function (name, newValue) {
        var _this = this;
        transaction(function () {
            var observable = _this._data[name] = new ObservableValue(newValue, _this._valueMode, _this.name + "." + name, false);
            newValue = observable.value;
            _this._updateHasMapEntry(name, true);
            _this._keys.push(name);
        }, undefined, false);
        var notifySpy = isSpyEnabled();
        var notify = hasListeners(this);
        var change = notify || notifySpy ? {
            type: "add",
            object: this,
            name: name, newValue: newValue
        } : null;
        if (notifySpy)
            { spyReportStart(change); }
        if (notify)
            { notifyListeners(this, change); }
        if (notifySpy)
            { spyReportEnd(); }
    };
    ObservableMap.prototype.get = function (key) {
        key = "" + key;
        if (this.has(key))
            { return this._data[key].get(); }
        return undefined;
    };
    ObservableMap.prototype.keys = function () {
        return arrayAsIterator(this._keys.slice());
    };
    ObservableMap.prototype.values = function () {
        return arrayAsIterator(this._keys.map(this.get, this));
    };
    ObservableMap.prototype.entries = function () {
        var _this = this;
        return arrayAsIterator(this._keys.map(function (key) { return [key, _this.get(key)]; }));
    };
    ObservableMap.prototype.forEach = function (callback, thisArg) {
        var _this = this;
        this.keys().forEach(function (key) { return callback.call(thisArg, _this.get(key), key); });
    };
    ObservableMap.prototype.merge = function (other) {
        var _this = this;
        transaction(function () {
            if (other instanceof ObservableMap)
                { other.keys().forEach(function (key) { return _this.set(key, other.get(key)); }); }
            else
                { Object.keys(other).forEach(function (key) { return _this.set(key, other[key]); }); }
        }, undefined, false);
        return this;
    };
    ObservableMap.prototype.clear = function () {
        var _this = this;
        transaction(function () {
            untracked(function () {
                _this.keys().forEach(_this.delete, _this);
            });
        }, undefined, false);
    };
    Object.defineProperty(ObservableMap.prototype, "size", {
        get: function () {
            return this._keys.length;
        },
        enumerable: true,
        configurable: true
    });
    ObservableMap.prototype.toJS = function () {
        var _this = this;
        var res = {};
        this.keys().forEach(function (key) { return res[key] = _this.get(key); });
        return res;
    };
    ObservableMap.prototype.toJs = function () {
        deprecated("toJs is deprecated, use toJS instead");
        return this.toJS();
    };
    ObservableMap.prototype.toJSON = function () {
        return this.toJS();
    };
    ObservableMap.prototype.isValidKey = function (key) {
        if (key === null || key === undefined)
            { return false; }
        if (typeof key !== "string" && typeof key !== "number" && typeof key !== "boolean")
            { return false; }
        return true;
    };
    ObservableMap.prototype.assertValidKey = function (key) {
        if (!this.isValidKey(key))
            { throw new Error("[mobx.map] Invalid key: '" + key + "'"); }
    };
    ObservableMap.prototype.toString = function () {
        var _this = this;
        return this.name + "[{ " + this.keys().map(function (key) { return (key + ": " + ("" + _this.get(key))); }).join(", ") + " }]";
    };
    ObservableMap.prototype.observe = function (listener, fireImmediately) {
        invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable maps.");
        return registerListener(this, listener);
    };
    ObservableMap.prototype.intercept = function (handler) {
        return registerInterceptor(this, handler);
    };
    return ObservableMap;
}());
exports.ObservableMap = ObservableMap;
declareIterator(ObservableMap.prototype, function () {
    return this.entries();
});
function map(initialValues, valueModifier) {
    return new ObservableMap(initialValues, valueModifier);
}
exports.map = map;
function isObservableMap(thing) {
    return thing instanceof ObservableMap;
}
exports.isObservableMap = isObservableMap;
var ObservableObjectAdministration = (function () {
    function ObservableObjectAdministration(target, name, mode) {
        this.target = target;
        this.name = name;
        this.mode = mode;
        this.values = {};
        this.changeListeners = null;
        this.interceptors = null;
    }
    ObservableObjectAdministration.prototype.observe = function (callback, fireImmediately) {
        invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable objects.");
        return registerListener(this, callback);
    };
    ObservableObjectAdministration.prototype.intercept = function (handler) {
        return registerInterceptor(this, handler);
    };
    return ObservableObjectAdministration;
}());
function asObservableObject(target, name, mode) {
    if (mode === void 0) { mode = ValueMode.Recursive; }
    if (isObservableObject(target))
        { return target.$mobx; }
    if (!isPlainObject(target))
        { name = target.constructor.name + "@" + getNextId(); }
    if (!name)
        { name = "ObservableObject@" + getNextId(); }
    var adm = new ObservableObjectAdministration(target, name, mode);
    addHiddenFinalProp(target, "$mobx", adm);
    return adm;
}
function setObservableObjectInstanceProperty(adm, propName, descriptor) {
    if (adm.values[propName]) {
        invariant("value" in descriptor, "cannot redefine property " + propName);
        adm.target[propName] = descriptor.value;
    }
    else {
        if ("value" in descriptor)
            { defineObservableProperty(adm, propName, descriptor.value, true, undefined); }
        else
            { defineObservableProperty(adm, propName, descriptor.get, true, descriptor.set); }
    }
}
function defineObservableProperty(adm, propName, newValue, asInstanceProperty, setter) {
    if (asInstanceProperty)
        { assertPropertyConfigurable(adm.target, propName); }
    var observable;
    var name = adm.name + "." + propName;
    var isComputed = true;
    if (newValue instanceof ObservableValue) {
        observable = newValue;
        newValue.name = name;
        isComputed = false;
    }
    else if (newValue instanceof ComputedValue) {
        observable = newValue;
        newValue.name = name;
        if (!newValue.scope)
            { newValue.scope = adm.target; }
    }
    else if (typeof newValue === "function" && newValue.length === 0 && !isAction(newValue)) {
        observable = new ComputedValue(newValue, adm.target, false, name, setter);
    }
    else if (newValue instanceof AsStructure && typeof newValue.value === "function" && newValue.value.length === 0) {
        observable = new ComputedValue(newValue.value, adm.target, true, name, setter);
    }
    else {
        isComputed = false;
        if (hasInterceptors(adm)) {
            var change = interceptChange(adm, {
                object: adm.target,
                name: propName,
                type: "add",
                newValue: newValue
            });
            if (!change)
                { return; }
            newValue = change.newValue;
        }
        observable = new ObservableValue(newValue, adm.mode, name, false);
        newValue = observable.value;
    }
    adm.values[propName] = observable;
    if (asInstanceProperty) {
        Object.defineProperty(adm.target, propName, isComputed ? generateComputedPropConfig(propName) : generateObservablePropConfig(propName));
    }
    if (!isComputed)
        { notifyPropertyAddition(adm, adm.target, propName, newValue); }
}
var observablePropertyConfigs = {};
var computedPropertyConfigs = {};
function generateObservablePropConfig(propName) {
    var config = observablePropertyConfigs[propName];
    if (config)
        { return config; }
    return observablePropertyConfigs[propName] = {
        configurable: true,
        enumerable: true,
        get: function () {
            return this.$mobx.values[propName].get();
        },
        set: function (v) {
            setPropertyValue(this, propName, v);
        }
    };
}
function generateComputedPropConfig(propName) {
    var config = computedPropertyConfigs[propName];
    if (config)
        { return config; }
    return computedPropertyConfigs[propName] = {
        configurable: true,
        enumerable: false,
        get: function () {
            return this.$mobx.values[propName].get();
        },
        set: function (v) {
            return this.$mobx.values[propName].set(v);
        }
    };
}
function setPropertyValue(instance, name, newValue) {
    var adm = instance.$mobx;
    var observable = adm.values[name];
    if (hasInterceptors(adm)) {
        var change = interceptChange(adm, {
            type: "update",
            object: instance,
            name: name, newValue: newValue
        });
        if (!change)
            { return; }
        newValue = change.newValue;
    }
    newValue = observable.prepareNewValue(newValue);
    if (newValue !== UNCHANGED) {
        var notify = hasListeners(adm);
        var notifySpy = isSpyEnabled();
        var change = notifyListeners || hasListeners ? {
            type: "update",
            object: instance,
            oldValue: observable.value,
            name: name, newValue: newValue
        } : null;
        if (notifySpy)
            { spyReportStart(change); }
        observable.setNewValue(newValue);
        if (notify)
            { notifyListeners(adm, change); }
        if (notifySpy)
            { spyReportEnd(); }
    }
}
function notifyPropertyAddition(adm, object, name, newValue) {
    var notify = hasListeners(adm);
    var notifySpy = isSpyEnabled();
    var change = notify || notifySpy ? {
        type: "add",
        object: object, name: name, newValue: newValue
    } : null;
    if (notifySpy)
        { spyReportStart(change); }
    if (notify)
        { notifyListeners(adm, change); }
    if (notifySpy)
        { spyReportEnd(); }
}
function isObservableObject(thing) {
    if (typeof thing === "object" && thing !== null) {
        runLazyInitializers(thing);
        return thing.$mobx instanceof ObservableObjectAdministration;
    }
    return false;
}
exports.isObservableObject = isObservableObject;
var UNCHANGED = {};
var ObservableValue = (function (_super) {
    __extends(ObservableValue, _super);
    function ObservableValue(value, mode, name, notifySpy) {
        if (name === void 0) { name = "ObservableValue@" + getNextId(); }
        if (notifySpy === void 0) { notifySpy = true; }
        _super.call(this, name);
        this.mode = mode;
        this.hasUnreportedChange = false;
        this.value = undefined;
        var _a = getValueModeFromValue(value, ValueMode.Recursive), childmode = _a[0], unwrappedValue = _a[1];
        if (this.mode === ValueMode.Recursive)
            { this.mode = childmode; }
        this.value = makeChildObservable(unwrappedValue, this.mode, this.name);
        if (notifySpy && isSpyEnabled()) {
            spyReport({ type: "create", object: this, newValue: this.value });
        }
    }
    ObservableValue.prototype.set = function (newValue) {
        var oldValue = this.value;
        newValue = this.prepareNewValue(newValue);
        if (newValue !== UNCHANGED) {
            var notifySpy = isSpyEnabled();
            if (notifySpy) {
                spyReportStart({
                    type: "update",
                    object: this,
                    newValue: newValue, oldValue: oldValue
                });
            }
            this.setNewValue(newValue);
            if (notifySpy)
                { spyReportEnd(); }
        }
    };
    ObservableValue.prototype.prepareNewValue = function (newValue) {
        assertUnwrapped(newValue, "Modifiers cannot be used on non-initial values.");
        checkIfStateModificationsAreAllowed();
        if (hasInterceptors(this)) {
            var change = interceptChange(this, { object: this, type: "update", newValue: newValue });
            if (!change)
                { return UNCHANGED; }
            newValue = change.newValue;
        }
        var changed = valueDidChange(this.mode === ValueMode.Structure, this.value, newValue);
        if (changed)
            { return makeChildObservable(newValue, this.mode, this.name); }
        return UNCHANGED;
    };
    ObservableValue.prototype.setNewValue = function (newValue) {
        var oldValue = this.value;
        this.value = newValue;
        this.reportChanged();
        if (hasListeners(this))
            { notifyListeners(this, [newValue, oldValue]); }
    };
    ObservableValue.prototype.get = function () {
        this.reportObserved();
        return this.value;
    };
    ObservableValue.prototype.intercept = function (handler) {
        return registerInterceptor(this, handler);
    };
    ObservableValue.prototype.observe = function (listener, fireImmediately) {
        if (fireImmediately)
            { listener(this.value, undefined); }
        return registerListener(this, listener);
    };
    ObservableValue.prototype.toJSON = function () {
        return this.get();
    };
    ObservableValue.prototype.toString = function () {
        return this.name + "[" + this.value + "]";
    };
    return ObservableValue;
}(BaseAtom));
function getAtom(thing, property) {
    if (typeof thing === "object" && thing !== null) {
        if (isObservableArray(thing)) {
            invariant(property === undefined, "It is not possible to get index atoms from arrays");
            return thing.$mobx.atom;
        }
        if (isObservableMap(thing)) {
            if (property === undefined)
                { return getAtom(thing._keys); }
            var observable_2 = thing._data[property] || thing._hasMap[property];
            invariant(!!observable_2, "the entry '" + property + "' does not exist in the observable map '" + getDebugName(thing) + "'");
            return observable_2;
        }
        runLazyInitializers(thing);
        if (isObservableObject(thing)) {
            invariant(!!property, "please specify a property");
            var observable_3 = thing.$mobx.values[property];
            invariant(!!observable_3, "no observable property '" + property + "' found on the observable object '" + getDebugName(thing) + "'");
            return observable_3;
        }
        if (thing instanceof BaseAtom || thing instanceof ComputedValue || thing instanceof Reaction) {
            return thing;
        }
    }
    else if (typeof thing === "function") {
        if (thing.$mobx instanceof Reaction) {
            return thing.$mobx;
        }
    }
    invariant(false, "Cannot obtain atom from " + thing);
}
function getAdministration(thing, property) {
    invariant(thing, "Expection some object");
    if (property !== undefined)
        { return getAdministration(getAtom(thing, property)); }
    if (thing instanceof BaseAtom || thing instanceof ComputedValue || thing instanceof Reaction)
        { return thing; }
    if (isObservableMap(thing))
        { return thing; }
    runLazyInitializers(thing);
    if (thing.$mobx)
        { return thing.$mobx; }
    invariant(false, "Cannot obtain administration from " + thing);
}
function getDebugName(thing, property) {
    var named;
    if (property !== undefined)
        { named = getAtom(thing, property); }
    else if (isObservableObject(thing) || isObservableMap(thing))
        { named = getAdministration(thing); }
    else
        { named = getAtom(thing); }
    return named.name;
}
function createClassPropertyDecorator(onInitialize, get, set, enumerable, allowCustomArguments) {
    function classPropertyDecorator(target, key, descriptor, customArgs) {
        invariant(allowCustomArguments || quacksLikeADecorator(arguments), "This function is a decorator, but it wasn't invoked like a decorator");
        if (!descriptor) {
            var newDescriptor = {
                enumerable: enumerable,
                configurable: true,
                get: function () {
                    if (!this.__mobxInitializedProps || this.__mobxInitializedProps[key] !== true)
                        { typescriptInitializeProperty(this, key, undefined, onInitialize, customArgs, descriptor); }
                    return get.call(this, key);
                },
                set: function (v) {
                    if (!this.__mobxInitializedProps || this.__mobxInitializedProps[key] !== true) {
                        typescriptInitializeProperty(this, key, v, onInitialize, customArgs, descriptor);
                    }
                    else {
                        set.call(this, key, v);
                    }
                }
            };
            if (arguments.length < 3) {
                Object.defineProperty(target, key, newDescriptor);
            }
            return newDescriptor;
        }
        else {
            if (!hasOwnProperty(target, "__mobxLazyInitializers")) {
                addHiddenProp(target, "__mobxLazyInitializers", (target.__mobxLazyInitializers && target.__mobxLazyInitializers.slice()) || []);
            }
            var value_1 = descriptor.value, initializer_1 = descriptor.initializer;
            target.__mobxLazyInitializers.push(function (instance) {
                onInitialize(instance, key, (initializer_1 ? initializer_1.call(instance) : value_1), customArgs, descriptor);
            });
            return {
                enumerable: enumerable, configurable: true,
                get: function () {
                    if (this.__mobxDidRunLazyInitializers !== true)
                        { runLazyInitializers(this); }
                    return get.call(this, key);
                },
                set: function (v) {
                    if (this.__mobxDidRunLazyInitializers !== true)
                        { runLazyInitializers(this); }
                    set.call(this, key, v);
                }
            };
        }
    }
    if (allowCustomArguments) {
        return function () {
            if (quacksLikeADecorator(arguments))
                { return classPropertyDecorator.apply(null, arguments); }
            var outerArgs = arguments;
            return function (target, key, descriptor) { return classPropertyDecorator(target, key, descriptor, outerArgs); };
        };
    }
    return classPropertyDecorator;
}
function typescriptInitializeProperty(instance, key, v, onInitialize, customArgs, baseDescriptor) {
    if (!hasOwnProperty(instance, "__mobxInitializedProps"))
        { addHiddenProp(instance, "__mobxInitializedProps", {}); }
    instance.__mobxInitializedProps[key] = true;
    onInitialize(instance, key, v, customArgs, baseDescriptor);
}
function runLazyInitializers(instance) {
    if (instance.__mobxDidRunLazyInitializers === true)
        { return; }
    if (instance.__mobxLazyInitializers) {
        addHiddenProp(instance, "__mobxDidRunLazyInitializers", true);
        instance.__mobxDidRunLazyInitializers && instance.__mobxLazyInitializers.forEach(function (initializer) { return initializer(instance); });
    }
}
function quacksLikeADecorator(args) {
    return (args.length === 2 || args.length === 3) && typeof args[1] === "string";
}
function iteratorSymbol() {
    return (typeof Symbol === "function" && Symbol.iterator) || "@@iterator";
}
var IS_ITERATING_MARKER = "__$$iterating";
function arrayAsIterator(array) {
    invariant(array[IS_ITERATING_MARKER] !== true, "Illegal state: cannot recycle array as iterator");
    addHiddenFinalProp(array, IS_ITERATING_MARKER, true);
    var idx = -1;
    addHiddenFinalProp(array, "next", function next() {
        idx++;
        return {
            done: idx >= this.length,
            value: idx < this.length ? this[idx] : undefined
        };
    });
    return array;
}
function declareIterator(prototType, iteratorFactory) {
    addHiddenFinalProp(prototType, iteratorSymbol(), iteratorFactory);
}
var SimpleEventEmitter = (function () {
    function SimpleEventEmitter() {
        this.listeners = [];
        deprecated("extras.SimpleEventEmitter is deprecated and will be removed in the next major release");
    }
    SimpleEventEmitter.prototype.emit = function () {
        var arguments$1 = arguments;

        var listeners = this.listeners.slice();
        for (var i = 0, l = listeners.length; i < l; i++)
            { listeners[i].apply(null, arguments$1); }
    };
    SimpleEventEmitter.prototype.on = function (listener) {
        var _this = this;
        this.listeners.push(listener);
        return once(function () {
            var idx = _this.listeners.indexOf(listener);
            if (idx !== -1)
                { _this.listeners.splice(idx, 1); }
        });
    };
    SimpleEventEmitter.prototype.once = function (listener) {
        var subscription = this.on(function () {
            subscription();
            listener.apply(this, arguments);
        });
        return subscription;
    };
    return SimpleEventEmitter;
}());
exports.SimpleEventEmitter = SimpleEventEmitter;
var EMPTY_ARRAY = [];
Object.freeze(EMPTY_ARRAY);
function getNextId() {
    return ++globalState.mobxGuid;
}
function invariant(check, message, thing) {
    if (!check)
        { throw new Error("[mobx] Invariant failed: " + message + (thing ? " in '" + thing + "'" : "")); }
}
var deprecatedMessages = [];
function deprecated(msg) {
    if (deprecatedMessages.indexOf(msg) !== -1)
        { return; }
    deprecatedMessages.push(msg);
    console.error("[mobx] Deprecated: " + msg);
}
function once(func) {
    var invoked = false;
    return function () {
        if (invoked)
            { return; }
        invoked = true;
        return func.apply(this, arguments);
    };
}
var noop = function () { };
function unique(list) {
    var res = [];
    list.forEach(function (item) {
        if (res.indexOf(item) === -1)
            { res.push(item); }
    });
    return res;
}
function joinStrings(things, limit, separator) {
    if (limit === void 0) { limit = 100; }
    if (separator === void 0) { separator = " - "; }
    if (!things)
        { return ""; }
    var sliced = things.slice(0, limit);
    return "" + sliced.join(separator) + (things.length > limit ? " (... and " + (things.length - limit) + "more)" : "");
}
function isPlainObject(value) {
    if (value === null || typeof value !== "object")
        { return false; }
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}
function objectAssign() {
    var arguments$1 = arguments;

    var res = arguments[0];
    for (var i = 1, l = arguments.length; i < l; i++) {
        var source = arguments$1[i];
        for (var key in source)
            { if (hasOwnProperty(source, key)) {
                res[key] = source[key];
            } }
    }
    return res;
}
function valueDidChange(compareStructural, oldValue, newValue) {
    return compareStructural
        ? !deepEquals(oldValue, newValue)
        : oldValue !== newValue;
}
var prototypeHasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(object, propName) {
    return prototypeHasOwnProperty.call(object, propName);
}
function makeNonEnumerable(object, propNames) {
    for (var i = 0; i < propNames.length; i++) {
        addHiddenProp(object, propNames[i], object[propNames[i]]);
    }
}
function addHiddenProp(object, propName, value) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: true,
        configurable: true,
        value: value
    });
}
function addHiddenFinalProp(object, propName, value) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: false,
        configurable: true,
        value: value
    });
}
function isPropertyConfigurable(object, prop) {
    var descriptor = Object.getOwnPropertyDescriptor(object, prop);
    return !descriptor || (descriptor.configurable !== false && descriptor.writable !== false);
}
function assertPropertyConfigurable(object, prop) {
    invariant(isPropertyConfigurable(object, prop), "Cannot make property '" + prop + "' observable, it is not configurable and writable in the target object");
}
function getEnumerableKeys(obj) {
    var res = [];
    for (var key in obj)
        { res.push(key); }
    return res;
}
function deepEquals(a, b) {
    if (a === null && b === null)
        { return true; }
    if (a === undefined && b === undefined)
        { return true; }
    var aIsArray = Array.isArray(a) || isObservableArray(a);
    if (aIsArray !== (Array.isArray(b) || isObservableArray(b))) {
        return false;
    }
    else if (aIsArray) {
        if (a.length !== b.length)
            { return false; }
        for (var i = a.length - 1; i >= 0; i--)
            { if (!deepEquals(a[i], b[i]))
                { return false; } }
        return true;
    }
    else if (typeof a === "object" && typeof b === "object") {
        if (a === null || b === null)
            { return false; }
        if (getEnumerableKeys(a).length !== getEnumerableKeys(b).length)
            { return false; }
        for (var prop in a) {
            if (!(prop in b))
                { return false; }
            if (!deepEquals(a[prop], b[prop]))
                { return false; }
        }
        return true;
    }
    return a === b;
}
});














var Reaction = mobx.Reaction;











var isObservable = mobx.isObservable;














var extras = mobx.extras;

var recyclingEnabled = true;
var vComponentPools = new Map();

function recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount) {
    var bp = optVElement.bp;
    var key = optVElement.key;
    var pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed.get(key);
    if (!isUndefined(pool)) {
        var recycledOptVElement = pool.pop();
        if (!isUndefined(recycledOptVElement)) {
            patchOptVElement(recycledOptVElement, optVElement, null, lifecycle, context, isSVG, shallowUnmount);
            return optVElement.dom;
        }
    }
    return null;
}
function poolOptVElement(optVElement) {
    var bp = optVElement.bp;
    var key = optVElement.key;
    var pools = bp.pools;
    if (isNull(key)) {
        pools.nonKeyed.push(optVElement);
    }
    else {
        var pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(optVElement);
    }
}
function recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount) {
    var component = vComponent.component;
    var key = vComponent.key;
    var pools = vComponentPools.get(component);
    if (!isUndefined(pools)) {
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!isUndefined(pool)) {
            var recycledVComponent = pool.pop();
            if (!isUndefined(recycledVComponent)) {
                var failed = patchVComponent(recycledVComponent, vComponent, null, lifecycle, context, isSVG, shallowUnmount);
                if (!failed) {
                    return vComponent.dom;
                }
            }
        }
    }
    return null;
}
function poolVComponent(vComponent) {
    var component = vComponent.component;
    var key = vComponent.key;
    var pools = vComponentPools.get(component);
    if (isUndefined(pools)) {
        pools = {
            nonKeyed: [],
            keyed: new Map()
        };
        vComponentPools.set(component, pools);
    }
    if (isNull(key)) {
        pools.nonKeyed.push(vComponent);
    }
    else {
        var pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vComponent);
    }
}

function unmount(input, parentDom, lifecycle, canRecycle, shallowUnmount) {
    if (!isInvalid(input)) {
        if (isOptVElement(input)) {
            unmountOptVElement(input, parentDom, lifecycle, canRecycle, shallowUnmount);
        }
        else if (isVComponent(input)) {
            unmountVComponent(input, parentDom, lifecycle, canRecycle, shallowUnmount);
        }
        else if (isVElement(input)) {
            unmountVElement(input, parentDom, lifecycle, shallowUnmount);
        }
        else if (isVFragment(input)) {
            unmountVFragment(input, parentDom, true, lifecycle, shallowUnmount);
        }
        else if (isVText(input)) {
            unmountVText(input, parentDom);
        }
        else if (isVPlaceholder(input)) {
            unmountVPlaceholder(input, parentDom);
        }
    }
}
function unmountVPlaceholder(vPlaceholder, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vPlaceholder.dom);
    }
}
function unmountVText(vText, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vText.dom);
    }
}
function unmountOptVElement(optVElement, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var bp = optVElement.bp;
    var bp0 = bp.v0;
    if (!shallowUnmount) {
        if (!isNull(bp0)) {
            unmountOptVElementValue(optVElement, bp0, optVElement.v0, lifecycle, shallowUnmount);
            var bp1 = bp.v1;
            if (!isNull(bp1)) {
                unmountOptVElementValue(optVElement, bp1, optVElement.v1, lifecycle, shallowUnmount);
                var bp2 = bp.v2;
                if (!isNull(bp2)) {
                    unmountOptVElementValue(optVElement, bp2, optVElement.v2, lifecycle, shallowUnmount);
                }
            }
        }
    }
    if (!isNull(parentDom)) {
        parentDom.removeChild(optVElement.dom);
    }
    if (recyclingEnabled && (parentDom || canRecycle)) {
        poolOptVElement(optVElement);
    }
}
function unmountOptVElementValue(optVElement, valueType, value, lifecycle, shallowUnmount) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            unmountChildren(value, lifecycle, shallowUnmount);
            break;
        case ValueTypes.PROP_REF:
            unmountRef(value);
            break;
        case ValueTypes.PROP_SPREAD:
            unmountProps(value, lifecycle);
            break;
        default:
    }
}
function unmountVFragment(vFragment, parentDom, removePointer, lifecycle, shallowUnmount) {
    var children = vFragment.children;
    var childrenLength = children.length;
    var pointer = vFragment.pointer;
    if (!shallowUnmount && childrenLength > 0) {
        for (var i = 0; i < childrenLength; i++) {
            var child = children[i];
            if (isVFragment(child)) {
                unmountVFragment(child, parentDom, true, lifecycle, false);
            }
            else {
                unmount(child, parentDom, lifecycle, false, shallowUnmount);
            }
        }
    }
    if (parentDom && removePointer) {
        removeChild(parentDom, pointer);
    }
}
function unmountVComponent(vComponent, parentDom, lifecycle, canRecycle, shallowUnmount) {
    if (!shallowUnmount) {
        var instance = vComponent.instance;
        var instanceHooks = null;
        var instanceChildren = null;
        vComponent.unmounted = true;
        if (!isNullOrUndef(instance)) {
            var ref = vComponent.ref;
            if (ref) {
                ref(null);
            }
            instanceHooks = instance.hooks;
            instanceChildren = instance.children;
            if (instance.render !== undefined) {
                instance.componentWillUnmount();
                instance._unmounted = true;
                componentToDOMNodeMap.delete(instance);
                unmount(instance._lastInput, null, lifecycle, false, shallowUnmount);
            }
            else {
                unmount(instance, null, lifecycle, false, shallowUnmount);
            }
        }
        var hooks = vComponent.hooks || instanceHooks;
        if (!isNullOrUndef(hooks)) {
            if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
                hooks.onComponentWillUnmount(hooks);
            }
        }
    }
    if (parentDom) {
        removeChild(parentDom, vComponent.dom);
    }
    if (recyclingEnabled && (parentDom || canRecycle)) {
        poolVComponent(vComponent);
    }
}
function unmountVElement(vElement, parentDom, lifecycle, shallowUnmount) {
    var dom = vElement.dom;
    var ref = vElement.ref;
    if (!shallowUnmount) {
        if (ref) {
            unmountRef(ref);
        }
        var children = vElement.children;
        if (!isNullOrUndef(children)) {
            unmountChildren(children, lifecycle, shallowUnmount);
        }
    }
    if (parentDom) {
        removeChild(parentDom, dom);
    }
}
function unmountChildren(children, lifecycle, shallowUnmount) {
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (isObject(child)) {
                unmount(child, null, lifecycle, false, shallowUnmount);
            }
        }
    }
    else if (isObject(children)) {
        unmount(children, null, lifecycle, false, shallowUnmount);
    }
}
function unmountRef(ref) {
    if (isFunction(ref)) {
        ref(null);
    }
    else {
        if (isInvalid(ref)) {
            return;
        }
        {
            throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
        }
        throwError();
    }
}
function unmountProps(props, lifecycle) {
    for (var prop in props) {
        if (!props.hasOwnProperty(prop)) {
            continue;
        }
        var value = props[prop];
        if (prop === 'ref') {
            unmountRef(value);
        }
    }
}

function constructDefaults(string, object, value) {
    /* eslint no-return-assign: 0 */
    string.split(',').forEach(function (i) { return object[i] = value; });
}
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var svgNS = 'http://www.w3.org/2000/svg';
var strictProps = {};
var booleanProps = {};
var namespaces = {};
var isUnitlessNumber = {};
constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,value,defaultValue,defaultChecked', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
    unmount(lastInput, null, lifecycle, false, shallowUnmount);
}
function patch$1(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (lastInput !== nextInput) {
        if (isOptVElement(nextInput)) {
            if (isOptVElement(lastInput)) {
                patchOptVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountOptVElement(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (isOptVElement(lastInput)) {
            replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else if (isVComponent(nextInput)) {
            if (isVComponent(lastInput)) {
                patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (isVComponent(lastInput)) {
            replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else if (isVElement(nextInput)) {
            if (isVElement(lastInput)) {
                patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountVElement(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (isVFragment(nextInput)) {
            if (isVFragment(lastInput)) {
                patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountVFragment(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (isVFragment(lastInput)) {
            replaceVFragmentWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lifecycle, shallowUnmount);
        }
        else if (isVElement(lastInput)) {
            replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else if (isVText(nextInput)) {
            if (isVText(lastInput)) {
                patchVText(lastInput, nextInput);
            }
            else {
                replaceVNode(parentDom, mountVText(nextInput, null), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (isVText(lastInput)) {
            replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
        }
        else if (isVPlaceholder(nextInput)) {
            if (isVPlaceholder(lastInput)) {
                patchVPlaceholder(lastInput, nextInput);
            }
            else {
                replaceVNode(parentDom, mountVPlaceholder(nextInput, null), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (isVPlaceholder(lastInput)) {
            replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
        }
        else {
            {
                throwError('bad input argument called on patch(). Input argument may need normalising.');
            }
            throwError();
        }
    }
}
function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var nextTag = nextVElement.tag;
    var lastTag = lastVElement.tag;
    if (nextTag === 'svg') {
        isSVG = true;
    }
    if (lastTag !== nextTag) {
        replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else {
        var dom = lastVElement.dom;
        var lastProps = lastVElement.props;
        var nextProps = nextVElement.props;
        var lastChildren = lastVElement.children;
        var nextChildren = nextVElement.children;
        nextVElement.dom = dom;
        if (lastChildren !== nextChildren) {
            var lastChildrenType = lastVElement.childrenType;
            var nextChildrenType = nextVElement.childrenType;
            if (lastChildrenType === nextChildrenType) {
                patchChildren(lastChildrenType, lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                patchChildrenWithUnknownType(lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
            }
        }
        if (lastProps !== nextProps) {
            var formValue = patchProps(nextVElement, lastProps, nextProps, dom, shallowUnmount, false, isSVG, lifecycle, context);
            if (nextTag === 'select') {
                formSelectValue(dom, formValue);
            }
        }
    }
}
function patchOptVElement(lastOptVElement, nextOptVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var dom = lastOptVElement.dom;
    var lastBp = lastOptVElement.bp;
    var nextBp = nextOptVElement.bp;
    nextOptVElement.dom = dom;
    if (lastBp !== nextBp) {
        var newDom = mountOptVElement(nextOptVElement, null, lifecycle, context, isSVG, shallowUnmount);
        replaceChild(parentDom, newDom, dom);
        unmount(lastOptVElement, null, lifecycle, true, shallowUnmount);
    }
    else {
        var bp0 = nextBp.v0;
        var tag = nextBp.staticVElement.tag;
        var ignoreDiff = false;
        if (tag === 'svg') {
            isSVG = true;
        }
        else if (tag === 'input') {
            // input elements are problematic due to the large amount of internal state that hold
            // so instead of making lots of assumptions, we instead reset common values and re-apply
            // the the patching each time
            resetFormInputProperties(dom);
            ignoreDiff = true;
        }
        else if (tag === 'textarea') {
            // textarea elements are like input elements, except they have sligthly less internal state to
            // worry about
            ignoreDiff = true;
        }
        if (!isNull(bp0)) {
            var lastV0 = lastOptVElement.v0;
            var nextV0 = nextOptVElement.v0;
            var bp1 = nextBp.v1;
            if (lastV0 !== nextV0 || ignoreDiff) {
                patchOptVElementValue(nextOptVElement, bp0, lastV0, nextV0, nextBp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            if (!isNull(bp1)) {
                var lastV1 = lastOptVElement.v1;
                var nextV1 = nextOptVElement.v1;
                var bp2 = nextBp.v2;
                if (lastV1 !== nextV1 || ignoreDiff) {
                    patchOptVElementValue(nextOptVElement, bp1, lastV1, nextV1, nextBp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
                }
                if (!isNull(bp2)) {
                    var lastV2 = lastOptVElement.v2;
                    var nextV2 = nextOptVElement.v2;
                    var bp3 = nextBp.v3;
                    if (lastV2 !== nextV2 || ignoreDiff) {
                        patchOptVElementValue(nextOptVElement, bp2, lastV2, nextV2, nextBp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
                    }
                    if (!isNull(bp3)) {
                        var d3 = nextBp.d3;
                        var lastV3s = lastOptVElement.v3;
                        var nextV3s = nextOptVElement.v3;
                        for (var i = 0; i < lastV3s.length; i++) {
                            var lastV3 = lastV3s[i];
                            var nextV3 = nextV3s[i];
                            if (lastV3 !== nextV3 || ignoreDiff) {
                                patchOptVElementValue(nextOptVElement, bp3[i], lastV3, nextV3, d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
                            }
                        }
                    }
                }
            }
        }
        if (tag === 'select') {
            formSelectValue(dom, getPropFromOptElement(nextOptVElement, ValueTypes.PROP_VALUE));
        }
    }
}
function patchOptVElementValue(optVElement, valueType, lastValue, nextValue, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            patchChildren(descriptor, lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
            break;
        case ValueTypes.PROP_CLASS_NAME:
            if (isNullOrUndef(nextValue)) {
                dom.removeAttribute('class');
            }
            else {
                if (isSVG) {
                    dom.setAttribute('class', nextValue);
                }
                else {
                    dom.className = nextValue;
                }
            }
            break;
        case ValueTypes.PROP_DATA:
            dom.dataset[descriptor] = nextValue;
            break;
        case ValueTypes.PROP_STYLE:
            patchStyle(lastValue, nextValue, dom);
            break;
        case ValueTypes.PROP_VALUE:
            dom.value = isNullOrUndef(nextValue) ? '' : nextValue;
            break;
        case ValueTypes.PROP:
            patchProp(descriptor, lastValue, nextValue, dom, isSVG);
            break;
        case ValueTypes.PROP_SPREAD:
            patchProps(optVElement, lastValue, nextValue, dom, shallowUnmount, true, isSVG, lifecycle, context);
            break;
        default:
    }
}
function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (isTextChildrenType(childrenType)) {
        updateTextContent(parentDom, nextChildren);
    }
    else if (isNodeChildrenType(childrenType)) {
        patch$1(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isKeyedListChildrenType(childrenType)) {
        patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
    }
    else if (isNonKeyedListChildrenType(childrenType)) {
        patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, false, shallowUnmount);
    }
    else if (isUnknownChildrenType(childrenType)) {
        patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else {
        {
            throwError('bad childrenType value specified when attempting to patchChildren.');
        }
        throwError();
    }
}
function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (isInvalid(nextChildren)) {
        if (!isInvalid(lastChildren)) {
            if (isVNode(lastChildren)) {
                unmount(lastChildren, parentDom, lifecycle, true, shallowUnmount);
            }
            else {
                removeAllChildren(parentDom, lastChildren, lifecycle, shallowUnmount);
            }
        }
    }
    else if (isInvalid(lastChildren)) {
        if (isStringOrNumber(nextChildren)) {
            setTextContent(parentDom, nextChildren);
        }
        else if (!isInvalid(nextChildren)) {
            if (isArray(nextChildren)) {
                mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                mount(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
        }
    }
    else if (isVNode(lastChildren) && isVNode(nextChildren)) {
        patch$1(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isStringOrNumber(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            updateTextContent(parentDom, nextChildren);
        }
        else {
            setTextContent(parentDom, nextChildren);
        }
    }
    else if (isStringOrNumber(lastChildren)) {
        var child = normalise(lastChildren);
        child.dom = parentDom.firstChild;
        patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isArray(nextChildren)) {
        if (isArray(lastChildren)) {
            nextChildren.complex = lastChildren.complex;
            if (isKeyed(lastChildren, nextChildren)) {
                patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
            }
            else {
                patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
            }
        }
        else {
            patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
        }
    }
    else if (isArray(lastChildren)) {
        patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
    }
    else {
        {
            throwError('bad input argument called on patchChildrenWithUnknownType(). Input argument may need normalising.');
        }
        throwError();
    }
}
function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var lastComponent = lastVComponent.component;
    var nextComponent = nextVComponent.component;
    var nextProps = nextVComponent.props || {};
    if (lastComponent !== nextComponent) {
        if (isStatefulComponent(nextVComponent)) {
            var defaultProps = nextComponent.defaultProps;
            if (!isUndefined(defaultProps)) {
                nextVComponent.props = copyPropsTo(defaultProps, nextProps);
            }
            var lastInstance = lastVComponent.instance;
            var nextInstance = createStatefulComponentInstance(nextComponent, nextProps, context, isSVG);
            // we use || lastInstance because stateless components store their lastInstance
            var lastInput = lastInstance._lastInput || lastInstance;
            var nextInput = nextInstance._lastInput;
            var ref = nextVComponent.ref;
            nextInstance._vComponent = nextVComponent;
            nextVComponent.instance = nextInstance;
            patch$1(lastInput, nextInput, parentDom, lifecycle, nextInstance._childContext, isSVG, true);
            mountStatefulComponentCallbacks(ref, nextInstance, lifecycle);
            nextVComponent.dom = nextInput.dom;
            componentToDOMNodeMap.set(nextInstance, nextInput.dom);
        }
        else {
            var lastInput$1 = lastVComponent.instance._lastInput || lastVComponent.instance;
            var nextInput$1 = createStatelessComponentInput(nextComponent, nextProps, context);
            patch$1(lastInput$1, nextInput$1, parentDom, lifecycle, context, isSVG, true);
            var dom = nextVComponent.dom = nextInput$1.dom;
            nextVComponent.instance = nextInput$1;
            mountStatelessComponentCallbacks(nextVComponent.hooks, dom, lifecycle);
        }
        unmount(lastVComponent, null, lifecycle, false, shallowUnmount);
    }
    else {
        if (isStatefulComponent(nextVComponent)) {
            var instance = lastVComponent.instance;
            if (instance._unmounted) {
                if (isNull(parentDom)) {
                    return true;
                }
                replaceChild(parentDom, mountVComponent(nextVComponent, null, lifecycle, context, isSVG, shallowUnmount), lastVComponent.dom);
            }
            else {
                var defaultProps$1 = nextComponent.defaultProps;
                var lastProps = instance.props;
                if (!isUndefined(defaultProps$1)) {
                    copyPropsTo(lastProps, nextProps);
                    nextVComponent.props = nextProps;
                }
                var lastState = instance.state;
                var nextState = instance.state;
                var childContext = instance.getChildContext();
                nextVComponent.instance = instance;
                instance._isSVG = isSVG;
                if (!isNullOrUndef(childContext)) {
                    childContext = Object.assign({}, context, childContext);
                }
                else {
                    childContext = context;
                }
                var lastInput$2 = instance._lastInput;
                var nextInput$2 = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false);
                instance._childContext = childContext;
                if (nextInput$2 === NO_OP) {
                    nextInput$2 = lastInput$2;
                }
                else if (isArray(nextInput$2)) {
                    nextInput$2 = createVFragment(nextInput$2, null);
                }
                else if (isInvalid(nextInput$2)) {
                    nextInput$2 = createVPlaceholder();
                }
                instance._lastInput = nextInput$2;
                instance._vComponent = nextVComponent;
                instance._lastInput = nextInput$2;
                patch$1(lastInput$2, nextInput$2, parentDom, lifecycle, childContext, isSVG, shallowUnmount);
                instance.componentDidUpdate(lastProps, lastState);
                nextVComponent.dom = nextInput$2.dom;
                componentToDOMNodeMap.set(instance, nextInput$2.dom);
            }
        }
        else {
            var shouldUpdate = true;
            var lastProps$1 = lastVComponent.props;
            var nextHooks = nextVComponent.hooks;
            var nextHooksDefined = !isNullOrUndef(nextHooks);
            var lastInput$3 = lastVComponent.instance;
            nextVComponent.dom = lastVComponent.dom;
            nextVComponent.instance = lastInput$3;
            if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
                shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps$1, nextProps);
            }
            if (shouldUpdate !== false) {
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
                    nextHooks.onComponentWillUpdate(lastProps$1, nextProps);
                }
                var nextInput$3 = nextComponent(nextProps, context);
                if (nextInput$3 === NO_OP) {
                    return false;
                }
                else if (isArray(nextInput$3)) {
                    nextInput$3 = createVFragment(nextInput$3, null);
                }
                else if (isInvalid(nextInput$3)) {
                    nextInput$3 = createVPlaceholder();
                }
                patch$1(lastInput$3, nextInput$3, parentDom, lifecycle, context, isSVG, shallowUnmount);
                nextVComponent.instance = nextInput$3;
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
                    nextHooks.onComponentDidUpdate(lastProps$1, nextProps);
                }
            }
        }
    }
    return false;
}
function patchVText(lastVText, nextVText) {
    var nextText = nextVText.text;
    var dom = lastVText.dom;
    nextVText.dom = dom;
    if (lastVText.text !== nextText) {
        dom.nodeValue = nextText;
    }
}
function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
    nextVPlacholder.dom = lastVPlacholder.dom;
}
function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var lastChildren = lastVFragment.children;
    var nextChildren = nextVFragment.children;
    var pointer = lastVFragment.pointer;
    nextVFragment.dom = lastVFragment.dom;
    nextVFragment.pointer = pointer;
    if (!lastChildren !== nextChildren) {
        var lastChildrenType = lastVFragment.childrenType;
        var nextChildrenType = nextVFragment.childrenType;
        if (lastChildrenType === nextChildrenType) {
            if (isKeyedListChildrenType(nextChildrenType)) {
                return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
            }
            else if (isNonKeyedListChildrenType(nextChildrenType)) {
                return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, false, shallowUnmount);
            }
        }
        if (isKeyed(lastChildren, nextChildren)) {
            patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
        }
        else {
            patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, true, shallowUnmount);
        }
    }
}
function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList, shouldNormalise, shallowUnmount) {
    var lastChildrenLength = lastChildren.length;
    var nextChildrenLength = nextChildren.length;
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    for (; i < commonLength; i++) {
        var lastChild = lastChildren[i];
        var nextChild = shouldNormalise ? normaliseChild(nextChildren, i) : nextChildren[i];
        patch$1(lastChild, nextChild, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; i++) {
            var child = normaliseChild(nextChildren, i);
            insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG, shallowUnmount), parentVList && parentVList.pointer);
        }
    }
    else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; i++) {
            unmount(lastChildren[i], dom, lifecycle, false, shallowUnmount);
        }
    }
}
function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, parentVList, shallowUnmount) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i;
    var j;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    var aNode;
    var bNode;
    var nextNode;
    var nextPos;
    var node;
    if (aLength === 0) {
        if (bLength !== 0) {
            mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG, shallowUnmount);
        }
        return;
    }
    else if (bLength === 0) {
        if (aLength !== 0) {
            removeAllChildren(dom, a, lifecycle, shallowUnmount);
        }
        return;
    }
    // Step 1
    /* eslint no-constant-condition: 0 */
    outer: while (true) {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch$1(aStartNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
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
            patch$1(aEndNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
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
            patch$1(aEndNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
            insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
            aEnd--;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break;
            }
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            // In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
            // immediately jump to the start of this prefix/suffix algo.
            continue;
        }
        // Move and sync nodes from left to right.
        if (aStartNode.key === bEndNode.key) {
            patch$1(aStartNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
            insertOrAppend(dom, bEndNode.dom, nextNode);
            aStart++;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break;
            }
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            continue;
        }
        break;
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
            while (bStart <= bEnd) {
                insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), nextNode);
            }
        }
    }
    else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            unmount(a[aStart++], dom, lifecycle, false, shallowUnmount);
        }
    }
    else {
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
        if ((bLength <= 4) || (aLength * bLength <= 16)) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            }
                            else {
                                pos = j;
                            }
                            patch$1(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
                            patched++;
                            aNullable[i] = null;
                            break;
                        }
                    }
                }
            }
        }
        else {
            var keyIndex = new Map();
            for (i = bStart; i <= bEnd; i++) {
                node = b[i];
                keyIndex.set(node.key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex.get(aNode.key);
                    if (!isUndefined(j)) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        }
                        else {
                            pos = j;
                        }
                        patch$1(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
                        patched++;
                        aNullable[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            removeAllChildren(dom, a, lifecycle, shallowUnmount);
            while (bStart < bLength) {
                insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), null);
            }
        }
        else {
            i = aLength - patched;
            while (i > 0) {
                aNode = aNullable[aStart++];
                if (!isNull(aNode)) {
                    unmount(aNode, dom, lifecycle, false, shallowUnmount);
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
                        nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
                        insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG, shallowUnmount), nextNode);
                    }
                    else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
                            insertOrAppend(dom, node.dom, nextNode);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
            else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
                        insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG, shallowUnmount), nextNode);
                    }
                }
            }
        }
    }
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
    var p = a.slice(0);
    var result = [];
    result.push(0);
    var i;
    var j;
    var u;
    var v;
    var c;
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
            c = ((u + v) / 2) | 0;
            if (a[result[c]] < a[i]) {
                u = c + 1;
            }
            else {
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
// returns true if a property has been applied that can't be cloned via elem.cloneNode()
function patchProp(prop, lastValue, nextValue, dom, isSVG) {
    if (prop === 'children') {
        return;
    }
    if (strictProps[prop]) {
        dom[prop] = isNullOrUndef(nextValue) ? '' : nextValue;
    }
    else if (booleanProps[prop]) {
        dom[prop] = nextValue ? true : false;
    }
    else {
        if (lastValue !== nextValue) {
            if (isNullOrUndef(nextValue)) {
                dom.removeAttribute(prop);
                return false;
            }
            if (prop === 'className') {
                if (isSVG) {
                    dom.setAttribute('class', nextValue);
                }
                else {
                    dom.className = nextValue;
                }
                return false;
            }
            else if (prop === 'style') {
                patchStyle(lastValue, nextValue, dom);
            }
            else if (isAttrAnEvent(prop)) {
                dom[prop.toLowerCase()] = nextValue;
            }
            else if (prop === 'dangerouslySetInnerHTML') {
                var lastHtml = lastValue && lastValue.__html;
                var nextHtml = nextValue && nextValue.__html;
                if (isNullOrUndef(nextHtml)) {
                    {
                        throwError('dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.');
                    }
                    throwError();
                }
                if (lastHtml !== nextHtml) {
                    dom.innerHTML = nextHtml;
                }
            }
            else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
                var ns = namespaces[prop];
                if (ns) {
                    dom.setAttributeNS(ns, prop, nextValue);
                }
                else {
                    dom.setAttribute(prop, nextValue);
                }
                return false;
            }
        }
    }
    return true;
}
function patchProps(vNode, lastProps, nextProps, dom, shallowUnmount, isSpread, isSVG, lifecycle, context) {
    lastProps = lastProps || {};
    nextProps = nextProps || {};
    var formValue;
    for (var prop in nextProps) {
        if (!nextProps.hasOwnProperty(prop)) {
            continue;
        }
        var nextValue = nextProps[prop];
        var lastValue = lastProps[prop];
        if (prop === 'value') {
            formValue = nextValue;
        }
        if (isNullOrUndef(nextValue)) {
            removeProp(prop, dom);
        }
        else if (prop === 'children') {
            if (isSpread) {
                patchChildrenWithUnknownType(lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            else if (isVElement(vNode)) {
                vNode.children = nextValue;
            }
        }
        else {
            patchProp(prop, lastValue, nextValue, dom, isSVG);
        }
    }
    for (var prop$1 in lastProps) {
        if (isNullOrUndef(nextProps[prop$1])) {
            removeProp(prop$1, dom);
        }
    }
    return formValue;
}
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    if (isString(nextAttrValue)) {
        dom.style.cssText = nextAttrValue;
    }
    else if (isNullOrUndef(lastAttrValue)) {
        if (!isNullOrUndef(nextAttrValue)) {
            var styleKeys = Object.keys(nextAttrValue);
            for (var i = 0; i < styleKeys.length; i++) {
                var style = styleKeys[i];
                var value = nextAttrValue[style];
                if (isNumber(value) && !isUnitlessNumber[style]) {
                    dom.style[style] = value + 'px';
                }
                else {
                    dom.style[style] = value;
                }
            }
        }
    }
    else if (isNullOrUndef(nextAttrValue)) {
        dom.removeAttribute('style');
    }
    else {
        var styleKeys$1 = Object.keys(nextAttrValue);
        for (var i$1 = 0; i$1 < styleKeys$1.length; i$1++) {
            var style$1 = styleKeys$1[i$1];
            var value$1 = nextAttrValue[style$1];
            if (isNumber(value$1) && !isUnitlessNumber[style$1]) {
                dom.style[style$1] = value$1 + 'px';
            }
            else {
                dom.style[style$1] = value$1;
            }
        }
        var lastStyleKeys = Object.keys(lastAttrValue);
        for (var i$2 = 0; i$2 < lastStyleKeys.length; i$2++) {
            var style$2 = lastStyleKeys[i$2];
            if (isNullOrUndef(nextAttrValue[style$2])) {
                dom.style[style$2] = '';
            }
        }
    }
}
function removeProp(prop, dom) {
    if (prop === 'className') {
        dom.removeAttribute('class');
    }
    else if (prop === 'value') {
        dom.value = '';
    }
    else {
        dom.removeAttribute(prop);
    }
}

function convertVOptElementToVElement(optVElement) {
    var bp = optVElement.bp;
    var staticElement = bp.staticVElement;
    var vElement = createVElement(staticElement.tag, null, null, optVElement.key, null, null);
    var bp0 = bp.v0;
    var staticChildren = staticElement.children;
    var staticProps = staticElement.props;
    if (!isNull(staticChildren)) {
        vElement.children = staticChildren;
    }
    if (!isNull(staticProps)) {
        vElement.props = staticProps;
    }
    if (!isNull(bp0)) {
        attachOptVElementValue(vElement, optVElement, bp0, optVElement.v0, bp.d0);
        var bp1 = bp.v1;
        if (!isNull(bp1)) {
            attachOptVElementValue(vElement, optVElement, bp1, optVElement.v1, bp.d1);
            var bp2 = bp.v2;
            if (!isNull(bp2)) {
                attachOptVElementValue(vElement, optVElement, bp2, optVElement.v2, bp.d2);
                var bp3 = bp.v3;
                if (!isNull(bp3)) {
                    var v3 = optVElement.v3;
                    var d3 = bp.d3;
                    var bp3$1 = bp.v3;
                    for (var i = 0; i < bp3$1.length; i++) {
                        attachOptVElementValue(vElement, optVElement, bp3$1[i], v3[i], d3[i]);
                    }
                }
            }
        }
    }
    return vElement;
}
function attachOptVElementValue(vElement, vOptElement, valueType, value, descriptor) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            vElement.childrenType = descriptor;
            if (isNullOrUndef(vElement.children)) {
                vElement.children = value;
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_CLASS_NAME:
            if (!vElement.props) {
                vElement.props = { className: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_DATA:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props['data-' + descriptor] = value;
            break;
        case ValueTypes.PROP_STYLE:
            if (!vElement.props) {
                vElement.props = { style: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_VALUE:
            if (!vElement.props) {
                vElement.props = { value: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props[descriptor] = value;
            break;
        case ValueTypes.PROP_REF:
            vElement.ref = value;
            break;
        case ValueTypes.PROP_SPREAD:
            if (!vElement.props) {
                vElement.props = value;
            }
            else {
                debugger;
            }
            break;
        default:
            throw new Error('Unknown ValueType: ' + valueType);
    }
}
function cloneVNode(vNodeToClone, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    var children = _children;
    if (_children.length > 0 && !isNull(_children[0])) {
        if (!props) {
            props = {};
        }
        if (_children.length === 1) {
            children = _children[0];
        }
        if (isUndefined(props.children)) {
            props.children = children;
        }
        else {
            if (isArray(children)) {
                if (isArray(props.children)) {
                    props.children = props.children.concat(children);
                }
                else {
                    props.children = [props.children].concat(children);
                }
            }
            else {
                if (isArray(props.children)) {
                    props.children.push(children);
                }
                else {
                    props.children = [props.children];
                    props.children.push(children);
                }
            }
        }
    }
    children = null;
    var newVNode;
    if (isArray(vNodeToClone)) {
        newVNode = vNodeToClone.map(function (vNode) { return cloneVNode(vNode); });
    }
    else if (isNullOrUndef(props) && isNullOrUndef(children)) {
        newVNode = Object.assign({}, vNodeToClone);
    }
    else {
        if (isVComponent(vNodeToClone)) {
            newVNode = createVComponent(vNodeToClone.component, Object.assign({}, vNodeToClone.props, props), vNodeToClone.key, vNodeToClone.hooks, vNodeToClone.ref);
        }
        else if (isVElement(vNodeToClone)) {
            newVNode = createVElement(vNodeToClone.tag, Object.assign({}, vNodeToClone.props, props), (props && props.children) || children || vNodeToClone.children, vNodeToClone.key, vNodeToClone.ref, ChildrenTypes.UNKNOWN);
        }
        else if (isOptVElement(vNodeToClone)) {
            newVNode = cloneVNode(convertVOptElementToVElement(vNodeToClone), props, children);
        }
    }
    newVNode.dom = null;
    return newVNode;
}

function copyPropsTo(copyFrom, copyTo) {
    for (var prop in copyFrom) {
        if (isUndefined(copyTo[prop])) {
            copyTo[prop] = copyFrom[prop];
        }
    }
}
function createStatefulComponentInstance(Component, props, context, isSVG) {
    var instance = new Component(props, context);
    instance.context = context;
    instance._patch = patch$1;
    instance._componentToDOMNodeMap = componentToDOMNodeMap;
    var childContext = instance.getChildContext();
    if (!isNullOrUndef(childContext)) {
        instance._childContext = Object.assign({}, context, childContext);
    }
    else {
        instance._childContext = context;
    }
    instance._unmounted = false;
    instance._pendingSetState = true;
    instance._isSVG = isSVG;
    instance.componentWillMount();
    var input = instance.render(props, context);
    if (isArray(input)) {
        input = createVFragment(input, null);
    }
    else if (isInvalid(input)) {
        input = createVPlaceholder();
    }
    instance._pendingSetState = false;
    instance._lastInput = input;
    return instance;
}
function replaceVNode(parentDom, dom, vNode, shallowUnmount, lifecycle) {
    if (isVComponent(vNode)) {
        // if we are accessing a stateful or stateless component, we want to access their last rendered input
        // accessing their DOM node is not useful to us here
        vNode = vNode.instance._lastInput || vNode.instance;
    }
    if (isVFragment(vNode)) {
        replaceVFragmentWithNode(parentDom, vNode, dom, lifecycle, shallowUnmount);
    }
    else {
        replaceChild(parentDom, dom, vNode.dom);
        unmount(vNode, null, lifecycle, false, shallowUnmount);
    }
}
function createStatelessComponentInput(component, props, context) {
    var input = component(props, context);
    if (isArray(input)) {
        input = createVFragment(input, null);
    }
    else if (isInvalid(input)) {
        input = createVPlaceholder();
    }
    return input;
}
function setTextContent(dom, text) {
    if (text !== '') {
        dom.textContent = text;
    }
    else {
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
    if (isNullOrUndef(nextNode)) {
        appendChild(parentDom, newNode);
    }
    else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
function replaceVFragmentWithNode(parentDom, vFragment, dom, lifecycle, shallowUnmount) {
    var pointer = vFragment.pointer;
    unmountVFragment(vFragment, parentDom, false, lifecycle, shallowUnmount);
    replaceChild(parentDom, dom, pointer);
}
function getPropFromOptElement(optVElement, valueType) {
    var bp = optVElement.bp;
    // TODO check "prop" and "spread"
    if (!isNull(bp.v0)) {
        if (bp.v0 === valueType) {
            return optVElement.v0;
        }
        if (!isNull(bp.v1)) {
            if (bp.v1 === valueType) {
                return optVElement.v1;
            }
            if (!isNull(bp.v2)) {
                if (bp.v2 === valueType) {
                    return optVElement.v2;
                }
            }
        }
    }
}
function documentCreateElement(tag, isSVG) {
    var dom;
    if (isSVG === true) {
        dom = document.createElementNS(svgNS, tag);
    }
    else {
        dom = document.createElement(tag);
    }
    return dom;
}
function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var lastInstance = null;
    var instanceLastNode = lastNode._lastInput;
    if (!isNullOrUndef(instanceLastNode)) {
        lastInstance = lastNode;
        lastNode = instanceLastNode;
    }
    unmount(lastNode, null, lifecycle, true, shallowUnmount);
    var dom = mount(nextNode, null, lifecycle, context, isSVG, shallowUnmount);
    nextNode.dom = dom;
    replaceChild(parentDom, dom, lastNode.dom);
    if (lastInstance !== null) {
        lastInstance._lasInput = nextNode;
    }
}
function replaceChild(parentDom, nextDom, lastDom) {
    parentDom.replaceChild(nextDom, lastDom);
}
function normalise(object) {
    if (isStringOrNumber(object)) {
        return createVText(object);
    }
    else if (isInvalid(object)) {
        return createVPlaceholder();
    }
    else if (isArray(object)) {
        return createVFragment(object, null);
    }
    else if (isVNode(object) && object.dom) {
        return cloneVNode(object);
    }
    return object;
}
function normaliseChild(children, i) {
    var child = children[i];
    children[i] = normalise(child);
    return children[i];
}
function removeChild(parentDom, dom) {
    parentDom.removeChild(dom);
}
function removeAllChildren(dom, children, lifecycle, shallowUnmount) {
    dom.textContent = '';
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!isInvalid(child)) {
            unmount(child, null, lifecycle, true, shallowUnmount);
        }
    }
}
function isKeyed(lastChildren, nextChildren) {
    if (lastChildren.complex) {
        return false;
    }
    return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
        && lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
function formSelectValueFindOptions(dom, value, isMap) {
    var child = dom.firstChild;
    while (child) {
        var tagName = child.tagName;
        if (tagName === 'OPTION') {
            child.selected = !!((!isMap && child.value === value) || (isMap && value.get(child.value)));
        }
        else if (tagName === 'OPTGROUP') {
            formSelectValueFindOptions(child, value, isMap);
        }
        child = child.nextSibling;
    }
}
function formSelectValue(dom, value) {
    var isMap = false;
    if (!isNullOrUndef(value)) {
        if (isArray(value)) {
            // Map vs Object v using reduce here for perf?
            value = value.reduce(function (o, v) { return o.set(v, true); }, new Map());
            isMap = true;
        }
        else {
            // convert to string
            value = value + '';
        }
        formSelectValueFindOptions(dom, value, isMap);
    }
}
function resetFormInputProperties(dom) {
    if (dom.checked) {
        dom.checked = false;
    }
    if (dom.disabled) {
        dom.disabled = false;
    }
}

function mountStaticChildren(children, dom, isSVG) {
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            mountStaticChildren(child, dom, isSVG);
        }
    }
    else if (isStringOrNumber(children)) {
        dom.appendChild(document.createTextNode(children));
    }
    else if (!isInvalid(children)) {
        mountStaticNode(children, dom, isSVG);
    }
}
function mountStaticNode(node, parentDom, isSVG) {
    var tag = node.tag;
    if (tag === 'svg') {
        isSVG = true;
    }
    var dom = documentCreateElement(tag, isSVG);
    var children = node.children;
    if (!isNull(children)) {
        mountStaticChildren(children, dom, isSVG);
    }
    var props = node.props;
    if (!isNull(props)) {
        for (var prop in props) {
            if (!props.hasOwnProperty(prop)) {
                continue;
            }
            patchProp(prop, null, props[prop], dom, isSVG);
        }
    }
    if (parentDom) {
        parentDom.appendChild(dom);
    }
    return dom;
}
function createStaticVElementClone(bp, isSVG) {
    if (!isBrowser) {
        return null;
    }
    var staticNode = bp.staticVElement;
    var dom = mountStaticNode(staticNode, null, isSVG);
    if (isSVG) {
        bp.svgClone = dom;
    }
    else {
        bp.clone = dom;
    }
    return dom.cloneNode(true);
}

function mount(input, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (isOptVElement(input)) {
        return mountOptVElement(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isVComponent(input)) {
        return mountVComponent(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isVElement(input)) {
        return mountVElement(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isVText(input)) {
        return mountVText(input, parentDom);
    }
    else if (isVFragment(input)) {
        return mountVFragment(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isVPlaceholder(input)) {
        return mountVPlaceholder(input, parentDom);
    }
    else {
        {
            throwError('bad input argument called on mount(). Input argument may need normalising.');
        }
        throwError();
    }
}
function mountVPlaceholder(vPlaceholder, parentDom) {
    var dom = document.createTextNode('');
    vPlaceholder.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVElement(vElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var tag = vElement.tag;
    if (!isString(tag)) {
        {
            throwError('expects VElement to have a string as the tag name');
        }
        throwError();
    }
    if (tag === 'svg') {
        isSVG = true;
    }
    var dom = documentCreateElement(tag, isSVG);
    var children = vElement.children;
    var props = vElement.props;
    var ref = vElement.ref;
    var hasProps = !isNullOrUndef(props);
    var formValue;
    vElement.dom = dom;
    if (!isNullOrUndef(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (hasProps) {
        formValue = mountProps(vElement, props, dom, lifecycle, context, isSVG, false, shallowUnmount);
    }
    if (!isNullOrUndef(children)) {
        mountChildren(vElement.childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    if (tag === 'select' && formValue) {
        formSelectValue(dom, formValue);
    }
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var children = vFragment.children;
    var pointer = document.createTextNode('');
    var dom = document.createDocumentFragment();
    var childrenType = vFragment.childrenType;
    if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
        mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isUnknownChildrenType(childrenType)) {
        mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    vFragment.pointer = pointer;
    vFragment.dom = dom;
    appendChild(dom, pointer);
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVText(vText, parentDom) {
    var dom = document.createTextNode(vText.text);
    vText.dom = dom;
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountOptVElement(optVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var bp = optVElement.bp;
    var dom = null;
    if (recyclingEnabled) {
        dom = recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount);
    }
    var tag = bp.staticVElement.tag;
    if (isNull(dom)) {
        if (isSVG || tag === 'svg') {
            isSVG = true;
            dom = (bp.svgClone && bp.svgClone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
        }
        else {
            dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
        }
        optVElement.dom = dom;
        var bp0 = bp.v0;
        if (!isNull(bp0)) {
            mountOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
            var bp1 = bp.v1;
            if (!isNull(bp1)) {
                mountOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
                var bp2 = bp.v2;
                if (!isNull(bp2)) {
                    mountOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
                    var bp3 = bp.v3;
                    if (!isNull(bp3)) {
                        var v3 = optVElement.v3;
                        var d3 = bp.d3;
                        var bp3$1 = bp.v3;
                        for (var i = 0; i < bp3$1.length; i++) {
                            mountOptVElementValue(optVElement, bp3$1[i], v3[i], d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
                        }
                    }
                }
            }
        }
        if (tag === 'select') {
            formSelectValue(dom, getPropFromOptElement(optVElement, ValueTypes.PROP_VALUE));
        }
    }
    if (!isNull(parentDom)) {
        parentDom.appendChild(dom);
    }
    return dom;
}
function mountOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            mountChildren(descriptor, value, dom, lifecycle, context, isSVG, shallowUnmount);
            break;
        case ValueTypes.PROP_CLASS_NAME:
            if (!isNullOrUndef(value)) {
                if (isSVG) {
                    dom.setAttribute('class', value);
                }
                else {
                    dom.className = value;
                }
            }
            break;
        case ValueTypes.PROP_DATA:
            dom.dataset[descriptor] = value;
            break;
        case ValueTypes.PROP_STYLE:
            patchStyle(null, value, dom);
            break;
        case ValueTypes.PROP_VALUE:
            dom.value = isNullOrUndef(value) ? '' : value;
            break;
        case ValueTypes.PROP:
            patchProp(descriptor, null, value, dom, isSVG);
            break;
        case ValueTypes.PROP_REF:
            mountRef(dom, value, lifecycle);
            break;
        case ValueTypes.PROP_SPREAD:
            mountProps(optVElement, value, dom, lifecycle, context, isSVG, true, shallowUnmount);
            break;
        default:
    }
}
function mountChildren(childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount) {
    if (isTextChildrenType(childrenType)) {
        setTextContent(dom, children);
    }
    else if (isNodeChildrenType(childrenType)) {
        mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
        mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isUnknownChildrenType(childrenType)) {
        mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else {
        {
            throwError('bad childrenType value specified when attempting to mountChildren.');
        }
        throwError();
    }
}
function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
    for (var i = 0; i < children.length; i++) {
        mount(children[i], dom, lifecycle, context, isSVG, shallowUnmount);
    }
}
function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
    if (isArray(children)) {
        mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isStringOrNumber(children)) {
        setTextContent(dom, children);
    }
    else if (!isInvalid(children)) {
        mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
}
function mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
    children.complex = false;
    for (var i = 0; i < children.length; i++) {
        var child = normaliseChild(children, i);
        if (isVText(child)) {
            mountVText(child, dom);
            children.complex = true;
        }
        else if (isVPlaceholder(child)) {
            mountVPlaceholder(child, dom);
            children.complex = true;
        }
        else if (isVFragment(child)) {
            mountVFragment(child, dom, lifecycle, context, isSVG, shallowUnmount);
            children.complex = true;
        }
        else {
            mount(child, dom, lifecycle, context, isSVG, shallowUnmount);
        }
    }
}
function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (recyclingEnabled) {
        var dom$1 = recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount);
        if (!isNull(dom$1)) {
            if (!isNull(parentDom)) {
                appendChild(parentDom, dom$1);
            }
            return dom$1;
        }
    }
    var component = vComponent.component;
    var props = vComponent.props || EMPTY_OBJ;
    var hooks = vComponent.hooks;
    var ref = vComponent.ref;
    var dom;
    if (isStatefulComponent(vComponent)) {
        var defaultProps = component.defaultProps;
        if (!isUndefined(defaultProps)) {
            copyPropsTo(defaultProps, props);
            vComponent.props = props;
        }
        if (hooks) {
            {
                throwError('"hooks" are not supported on stateful components.');
            }
            throwError();
        }
        var instance = createStatefulComponentInstance(component, props, context, isSVG);
        var input = instance._lastInput;
        instance._vComponent = vComponent;
        vComponent.dom = dom = mount(input, null, lifecycle, instance._childContext, false, shallowUnmount);
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
        mountStatefulComponentCallbacks(ref, instance, lifecycle);
        componentToDOMNodeMap.set(instance, dom);
        vComponent.instance = instance;
    }
    else {
        if (ref) {
            {
                throwError('"refs" are not supported on stateless components.');
            }
            throwError();
        }
        var input$1 = createStatelessComponentInput(component, props, context);
        vComponent.dom = dom = mount(input$1, null, lifecycle, context, isSVG, shallowUnmount);
        vComponent.instance = input$1;
        mountStatelessComponentCallbacks(hooks, dom, lifecycle);
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
    }
    return dom;
}
function mountStatefulComponentCallbacks(ref, instance, lifecycle) {
    if (ref) {
        if (isFunction(ref)) {
            lifecycle.addListener(function () { return ref(instance); });
        }
        else {
            {
                throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
            }
            throwError();
        }
    }
    if (!isNull(instance.componentDidMount)) {
        lifecycle.addListener(function () {
            instance.componentDidMount();
        });
    }
}
function mountStatelessComponentCallbacks(hooks, dom, lifecycle) {
    if (!isNullOrUndef(hooks)) {
        if (!isNullOrUndef(hooks.onComponentWillMount)) {
            hooks.onComponentWillMount();
        }
        if (!isNullOrUndef(hooks.onComponentDidMount)) {
            lifecycle.addListener(function () { return hooks.onComponentDidMount(dom); });
        }
    }
}
function mountProps(vNode, props, dom, lifecycle, context, isSVG, isSpread, shallowUnmount) {
    var formValue;
    for (var prop in props) {
        if (!props.hasOwnProperty(prop)) {
            continue;
        }
        var value = props[prop];
        if (prop === 'value') {
            formValue = value;
        }
        if (prop === 'key') {
            vNode.key = value;
        }
        else if (prop === 'ref') {
            mountRef(dom, value, lifecycle);
        }
        else if (prop === 'children') {
            if (isSpread) {
                mountChildrenWithUnknownType(value, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            else if (isVElement(vNode)) {
                vNode.children = value;
            }
        }
        else {
            patchProp(prop, null, value, dom, isSVG);
        }
    }
    return formValue;
}
function mountRef(dom, value, lifecycle) {
    if (isFunction(value)) {
        lifecycle.addListener(function () { return value(dom); });
    }
    else {
        if (isInvalid(value)) {
            return;
        }
        {
            throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
        }
        throwError();
    }
}

function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context) {
    var domNode = childNodes[counter.i];
    if (isVText(child)) {
        var text = child.text;
        child.dom = domNode;
        if (domNode.nodeType === 3 && text !== '') {
            domNode.nodeValue = text;
        }
        else {
            var newDomNode = mountVText(text, null);
            replaceChild(parentDom, newDomNode, domNode);
            childNodes.splice(childNodes.indexOf(domNode), 1, newDomNode);
            child.dom = newDomNode;
        }
    }
    else if (isVPlaceholder(child)) {
        child.dom = domNode;
    }
    else if (isVFragment(child)) {
        var items = child.items;
        // this doesn't really matter, as it won't be used again, but it's what it should be given the purpose of VList
        child.dom = document.createDocumentFragment();
        for (var i = 0; i < items.length; i++) {
            var rebuild = hydrateChild(normaliseChild(items, i), childNodes, counter, parentDom, lifecycle, context);
            if (rebuild) {
                return true;
            }
        }
        // at the end of every VList, there should be a "pointer". It's an empty TextNode used for tracking the VList
        var pointer = childNodes[counter.i++];
        if (pointer && pointer.nodeType === 3) {
            child.pointer = pointer;
        }
        else {
            // there is a problem, we need to rebuild this tree
            return true;
        }
    }
    else {
        var rebuild$1 = hydrate(child, domNode, lifecycle, context);
        if (rebuild$1) {
            return true;
        }
    }
    counter.i++;
}
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
            }
            else {
                dom.removeChild(rawChild);
                length--;
            }
        }
        else {
            i++;
        }
    }
}
function hydrateVComponent(vComponent, dom, lifecycle, context) {
    var component = vComponent.component;
    var props = vComponent.props;
    var hooks = vComponent.hooks;
    var ref = vComponent.ref;
    vComponent.dom = dom;
    if (isStatefulComponent(vComponent)) {
        var isSVG = dom.namespaceURI === svgNS;
        var instance = createStatefulComponentInstance(component, props, context, isSVG);
        var input = instance._lastInput;
        instance._vComponent = vComponent;
        hydrate(input, dom, lifecycle, context);
        mountStatefulComponentCallbacks(ref, instance, lifecycle);
        componentToDOMNodeMap.set(instance, dom);
        vComponent.instance = instance;
    }
    else {
        var input$1 = createStatelessComponentInput(component, props, context);
        hydrate(input$1, dom, lifecycle, context);
        vComponent.instance = input$1;
        vComponent.dom = input$1.dom;
        mountStatelessComponentCallbacks(hooks, dom, lifecycle);
    }
}
function hydrateVElement(vElement, dom, lifecycle, context) {
    var tag = vElement.tag;
    if (!isString(tag)) {
        {
            throwError('expects VElement to have a string as the tag name');
        }
        throwError();
    }
    var children = vElement.children;
    vElement.dom = dom;
    if (children) {
        hydrateChildren(vElement.childrenType, children, dom, lifecycle, context);
    }
}
function hydrateArrayChildrenWithType(children, dom, lifecycle, context) {
    var domNodes = Array.prototype.slice.call(dom.childNodes);
    for (var i = 0; i < children.length; i++) {
        hydrate(children[i], domNodes[i], lifecycle, context);
    }
}
function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
    var domNodes = Array.prototype.slice.call(dom.childNodes);
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = normaliseChild(children, i);
            if (isObject(child)) {
                hydrate(child, domNodes[i], lifecycle, context);
            }
        }
    }
    else if (isObject(children)) {
        hydrate(children, dom.firstChild, lifecycle, context);
    }
}
function hydrateChildren(childrenType, children, dom, lifecycle, context) {
    if (isNodeChildrenType(childrenType)) {
        hydrate(children, dom.firstChild, lifecycle, context);
    }
    else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
        hydrateArrayChildrenWithType(children, dom, lifecycle, context);
    }
    else if (isUnknownChildrenType(childrenType)) {
        hydrateChildrenWithUnknownType(children, dom, lifecycle, context);
    }
    else if (!isTextChildrenType(childrenType)) {
        {
            throwError('Bad childrenType value specified when attempting to hydrateChildren.');
        }
        throwError();
    }
}
function hydrateStaticVElement(node, dom) {
    var children = node.children;
    if (!isNull(children)) {
        if (!isStringOrNumber(children) && !isInvalid(children)) {
            var childNode = dom.firstChild;
            if (isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (!isStringOrNumber(child) && !isInvalid(child)) {
                        normaliseChildNodes(childNode);
                        hydrateStaticVElement(child, normaliseChildNodes(childNode));
                    }
                    childNode = childNode.nextSibling;
                }
            }
            else {
                normaliseChildNodes(childNode);
                hydrateStaticVElement(children, childNode);
            }
        }
    }
}
function hydrateOptVElement(optVElement, dom, lifecycle, context) {
    var bp = optVElement.bp;
    var bp0 = bp.v0;
    var staticVElement = bp.staticVElement;
    hydrateStaticVElement(staticVElement, dom);
    optVElement.dom = dom;
    if (!isNull(bp0)) {
        hydrateOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context);
        var bp1 = bp.v1;
        if (!isNull(bp1)) {
            hydrateOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context);
            var bp2 = bp.v2;
            if (!isNull(bp2)) {
                hydrateOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context);
                var bp3 = bp.v3;
                if (!isNull(bp3)) {
                    var v3 = optVElement.v3;
                    var d3 = bp.d3;
                    var bp3$1 = bp.v3;
                    for (var i = 0; i < bp3$1.length; i++) {
                        hydrateOptVElementValue(optVElement, bp3$1[i], v3[i], d3[i], dom, lifecycle, context);
                    }
                }
            }
        }
    }
}
function hydrateVText(vText, dom) {
    vText.dom = dom;
}
function hydrateVFragment(vFragment, currentDom, lifecycle, context) {
    var children = vFragment.children;
    var parentDom = currentDom.parentNode;
    var pointer = vFragment.pointer = document.createTextNode('');
    for (var i = 0; i < children.length; i++) {
        var child = normaliseChild(children, i);
        var childDom = currentDom;
        if (isObject(child)) {
            hydrate(child, childDom, lifecycle, context);
        }
        currentDom = currentDom.nextSibling;
    }
    parentDom.insertBefore(pointer, currentDom);
}
function hydrateOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            hydrateChildren(descriptor, value, dom, lifecycle, context);
            break;
        case ValueTypes.PROP_SPREAD:
            debugger;
            break;
        default:
    }
}
function hydrate(input, dom, lifecycle, context) {
    normaliseChildNodes(dom);
    if (isOptVElement(input)) {
        hydrateOptVElement(input, dom, lifecycle, context);
    }
    else if (isVComponent(input)) {
        hydrateVComponent(input, dom, lifecycle, context);
    }
    else if (isVElement(input)) {
        hydrateVElement(input, dom, lifecycle, context);
    }
    else if (isVFragment(input)) {
        hydrateVFragment(input, dom, lifecycle, context);
    }
    else if (isVText(input)) {
        hydrateVText(input, dom);
    }
    else if (isVPlaceholder(input)) {
        debugger;
    }
    else {
        {
            throwError('bad input argument called on hydrate(). Input argument may need normalising.');
        }
        throwError();
    }
}
function hydrateRoot(input, parentDom, lifecycle) {
    if (parentDom && parentDom.nodeType === 1) {
        var rootNode = parentDom.querySelector('[data-infernoroot]');
        if (rootNode && rootNode.parentNode === parentDom) {
            rootNode.removeAttribute('data-infernoroot');
            hydrate(input, rootNode, lifecycle, {});
            return true;
        }
    }
    return false;
}

var roots = new Map();
var componentToDOMNodeMap = new Map();
function findDOMNode(domNode) {
    return componentToDOMNodeMap.get(domNode) || null;
}
var documetBody = isBrowser ? document.body : null;
function render$1(input, parentDom) {
    var root = roots.get(parentDom);
    var lifecycle = new Lifecycle();
    if (documetBody === parentDom) {
        {
            throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
        }
        throwError();
    }
    if (input === NO_OP) {
        return;
    }
    if (isUndefined(root)) {
        if (!isInvalid(input)) {
            if (input.dom) {
                input = cloneVNode(input);
            }
            if (!hydrateRoot(input, parentDom, lifecycle)) {
                mountChildrenWithUnknownType(input, parentDom, lifecycle, {}, false, false);
            }
            lifecycle.trigger();
            roots.set(parentDom, { input: input });
        }
    }
    else {
        if (isNullOrUndef(input)) {
            unmount(root.input, parentDom, lifecycle, false, false);
            roots.delete(parentDom);
        }
        else {
            if (input.dom) {
                input = cloneVNode(input);
            }
            patchChildrenWithUnknownType(root.input, input, parentDom, lifecycle, {}, false, false);
        }
        lifecycle.trigger();
        root.input = input;
    }
}

var EventEmitter = function EventEmitter() {
    this.listeners = [];
};
EventEmitter.prototype.on = function on (cb) {
        var this$1 = this;

    this.listeners.push(cb);
    return function () {
        var index = this$1.listeners.indexOf(cb);
        if (index !== -1) {
            this$1.listeners.splice(index, 1);
        }
    };
};
EventEmitter.prototype.emit = function emit (data) {
    this.listeners.forEach(function (fn) { return fn(data); });
};

// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = {
    constructor: 1,
    render: 1,
    shouldComponentUpdate: 1,
    componentWillRecieveProps: 1,
    componentWillUpdate: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1
};
function F() {
}
function extend(base, props, all) {
    for (var key in props) {
        if (all === true || !isNullOrUndef(props[key])) {
            base[key] = props[key];
        }
    }
    return base;
}
function bindAll(ctx) {
    for (var i in ctx) {
        var v = ctx[i];
        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.hasOwnProperty(i)) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}
function createClass(obj) {
    function Cl(props) {
        extend(this, obj);
        Component.call(this, props);
        bindAll(this);
        if (this.getInitialState) {
            this.state = this.getInitialState();
        }
    }
    F.prototype = Component.prototype;
    Cl.prototype = new F();
    Cl.prototype.constructor = Cl;
    Cl.displayName = obj.displayName || 'Component';
    return Cl;
}

var INFERNO_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    propTypes: true,
    type: true
};

var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    arguments: true,
    arity: true
};

var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
        var keys = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            if (!INFERNO_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {

                }
            }
        }
    }

    return targetComponent;
}

var index$1 = hoistNonReactStatics;

var elementHooks = {
    onCreated: true,
    onAttached: true,
    onWillUpdate: true,
    onDidUpdate: true,
    onWillDetach: true
};
var componentHooks = {
    onComponentWillMount: true,
    onComponentDidMount: true,
    onComponentWillUnmount: true,
    onComponentShouldUpdate: true,
    onComponentWillUpdate: true,
    onComponentDidUpdate: true
};
function createElement(name, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    if (isInvalid(name) || isObject(name)) {
        throw new Error('Inferno Error: createElement() name paramater cannot be undefined, null, false or true, It must be a string, class or function.');
    }
    var children = _children;
    var vNode;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        }
        else if (_children.length === 0) {
            children = null;
        }
    }
    if (isString(name)) {
        var hooks;
        vNode = createVElement(name, null, null, null, null, null);
        for (var prop in props) {
            if (prop === 'key') {
                vNode.key = props.key;
                delete props.key;
            }
            else if (prop === 'children') {
                vNode.children = children;
            }
            else if (elementHooks[prop]) {
                if (!hooks) {
                    hooks = {};
                }
                hooks[prop] = props[prop];
                delete props[prop];
            }
            else if (isAttrAnEvent(prop)) {
                var lowerCase = prop.toLowerCase();
                if (lowerCase !== prop) {
                    props[prop.toLowerCase()] = props[prop];
                    delete props[prop];
                }
            }
        }
        vNode.props = props;
        if (!isUndefined(children)) {
            vNode.children = children;
        }
        if (hooks) {
            vNode.hooks = hooks;
        }
    }
    else {
        var hooks$1;
        vNode = createVComponent(name, null, null, null, null);
        if (!isUndefined(children)) {
            if (!props) {
                props = {};
            }
            props.children = children;
        }
        for (var prop$1 in props) {
            if (componentHooks[prop$1]) {
                if (!hooks$1) {
                    hooks$1 = {};
                }
                hooks$1[prop$1] = props[prop$1];
            }
            else if (prop$1 === 'key') {
                vNode.key = props.key;
                delete props.key;
            }
        }
        vNode.props = props;
        if (hooks$1) {
            vNode.hooks = hooks$1;
        }
    }
    return vNode;
}

/**
 * Store Injection
 */
function createStoreInjector(grabStoresFn, component) {
    var Injector = createClass({
        displayName: 'MobXStoreInjector',
        render: function render() {
            var this$1 = this;

            var newProps = {};
            for (var key in this.props) {
                if (this$1.props.hasOwnProperty(key)) {
                    newProps[key] = this$1.props[key];
                }
            }
            var additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, this.context) || {};
            for (var key$1 in additionalProps) {
                newProps[key$1] = additionalProps[key$1];
            }
            newProps.ref = function (instance) {
                this$1.wrappedInstance = instance;
            };
            return createElement(component, newProps);
        }
    });
    Injector.contextTypes = {
        mobxStores: function () {
        }
    };
    Injector.wrappedComponent = component;
    injectStaticWarnings(Injector, component);
    index$1(Injector, component);
    return Injector;
}
function injectStaticWarnings(hoc, component) {
    if (typeof process === 'undefined' || !process.env || "development" === 'production') {
        return;
    }
    ['propTypes', 'defaultProps', 'contextTypes'].forEach(function (prop) {
        var propValue = hoc[prop];
        Object.defineProperty(hoc, prop, {
            set: function set(_) {
                // enable for testing:
                var name = component.displayName || component.name;
                console.warn('Mobx Injector: you are trying to attach ' + prop +
                    ' to HOC instead of ' + name + '. Use `wrappedComponent` property.');
            },
            get: function get() {
                return propValue;
            },
            configurable: true
        });
    });
}
function grabStoresByName(storeNames) {
    return function (baseStores, nextProps) {
        storeNames.forEach(function (storeName) {
            if (storeName in nextProps) {
                // prefer props over stores
                return;
            }
            if (!(storeName in baseStores)) {
                throw new Error('MobX observer: Store "' + storeName + '" is not available! Make sure it is provided by some Provider');
            }
            nextProps[storeName] = baseStores[storeName];
        });
        return nextProps;
    };
}
/*
 interface IInject {
 apply: () => {};
 }*/
/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
function inject() {
    var arguments$1 = arguments;

    var grabStoresFn = void 0;
    if (typeof arguments[0] === 'function') {
        grabStoresFn = arguments[0];
    }
    else {
        var storesNames = [];
        for (var i = 0; i < arguments.length; i++) {
            storesNames[i] = arguments$1[i];
        }
        grabStoresFn = grabStoresByName(storesNames);
    }
    return function (componentClass) {
        return createStoreInjector(grabStoresFn, componentClass);
    };
}

/*
 mklink /J D:\Projects\dating\node_modules\inferno\dist D:\Projects\inferno\packages\inferno\dist
*/
/**
 * dev tool support
 */
var isDevtoolsEnabled = false;
// WeakMap<Node, Object>;
var componentByNodeRegistery = new WeakMap();
var renderReporter = new EventEmitter();
function reportRendering(component) {
    var node = findDOMNode(component);
    if (node && exports.componentByNodeRegistery) {
        componentByNodeRegistery.set(node, component);
    }
    exports.renderReporter.emit({
        event: 'render',
        renderTime: component.__$mobRenderEnd - component.__$mobRenderStart,
        totalTime: Date.now() - component.__$mobRenderStart,
        component: component,
        node: node
    });
}

/**
 * Utilities
 */
function patch(target, funcName) {
    var base = target[funcName];
    var mixinFunc = reactiveMixin[funcName];
    if (!base) {
        target[funcName] = mixinFunc;
    }
    else {
        target[funcName] = function () {
            base.apply(this, arguments);
            mixinFunc.apply(this, arguments);
        };
    }
}
var reactiveMixin = {
    componentWillMount: function componentWillMount() {
        var this$1 = this;

        // Generate friendly name for debugging
        var initialName = this.displayName || this.name || (this.constructor && (this.constructor.displayName || this.constructor.name)) || "<component>";
        var rootNodeID = this._reactInternalInstance && this._reactInternalInstance._rootNodeID;
        var baseRender = this.render.bind(this);
        var reaction$$1;
        var isRenderingPending = false;
        var reactiveRender = function () {
            isRenderingPending = false;
            var rendering = undefined;
            reaction$$1.track(function () {
                if (isDevtoolsEnabled) {
                    this$1.__$mobRenderStart = Date.now();
                }
                rendering = extras.allowStateChanges(false, baseRender);
                if (isDevtoolsEnabled) {
                    this$1.__$mobRenderEnd = Date.now();
                }
            });
            return rendering;
        };
        var initialRender = function () {
            reaction$$1 = new Reaction((initialName + "#" + rootNodeID + ".render()"), function () {
                if (!isRenderingPending) {
                    // N.B. Getting here *before mounting* means that a component constructor has side effects (see the relevant test in misc.js)
                    // This unidiomatic React usage but React will correctly warn about this so we continue as usual
                    // See #85 / Pull #44
                    isRenderingPending = true;
                    if (typeof this$1.componentWillReact === 'function') {
                        this$1.componentWillReact(); // TODO: wrap in action?
                    }
                    if (this$1.__$mobxIsUnmounted !== true) {
                        // If we are unmounted at this point, componentWillReact() had a side effect causing the component to unmounted
                        // TODO: remove this check? Then react will properly warn about the fact that this should not happen? See #73
                        // However, people also claim this migth happen during unit tests..
                        // React.Component.prototype.forceUpdate.call(this)
                        Component.prototype.forceUpdate.call(this$1);
                    }
                }
            });
            reactiveRender.$mobx = reaction$$1;
            this$1.render = reactiveRender;
            return reactiveRender();
        };
        this.render = initialRender;
    },
    componentWillUnmount: function componentWillUnmount() {
        this.render.$mobx && this.render.$mobx.dispose();
        this.__$mobxIsUnmounted = true;
        if (isDevtoolsEnabled) {
            var node = findDOMNode(this);
            if (node && componentByNodeRegistery) {
                componentByNodeRegistery.delete(node);
            }
            renderReporter.emit({
                event: 'destroy',
                component: this,
                node: node
            });
        }
    },
    componentDidMount: function componentDidMount() {
        if (isDevtoolsEnabled) {
            reportRendering(this);
        }
    },
    componentDidUpdate: function componentDidUpdate() {
        if (isDevtoolsEnabled) {
            reportRendering(this);
        }
    },
    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        var this$1 = this;

        // TODO: if context changed, return true.., see #18
        // if props or state did change, but a render was scheduled already, no additional render needs to be scheduled
        if (this.render.$mobx && this.render.$mobx.isScheduled() === true) {
            return false;
        }
        // update on any state changes (as is the default)
        if (this.state !== nextState) {
            return true;
        }
        // update if props are shallowly not equal, inspired by PureRenderMixin
        var keys = Object.keys(this.props);
        if (keys.length !== Object.keys(nextProps).length) {
            return true;
        }
        for (var i = keys.length - 1; i >= 0; i--) {
            var key = keys[i];
            var newValue = nextProps[key];
            if (newValue !== this$1.props[key]) {
                return true;
            }
            else if (newValue && typeof newValue === 'object' && !isObservable(newValue)) {
                /**
                 * If the newValue is still the same object, but that object is not observable,
                 * fallback to the default React behavior: update, because the object *might* have changed.
                 * If you need the non default behavior, just use the React pure render mixin, as that one
                 * will work fine with mobx as well, instead of the default implementation of
                 * observer.
                 */
                return true;
            }
        }
        return false;
    }
};
function connect(arg1, arg2) {
    var this$1 = this;
    if ( arg2 === void 0 ) arg2 = null;

    invariant_1(typeof arg1 !== 'string', 'Store names should be provided as array');
    console.debug('---', arg1, arg2);
    if (Array.isArray(arg1)) {
        // component needs stores
        if (!arg2) {
            // invoked as decorator
            return function (componentClass) { return connect(arg1, componentClass); };
        }
        else {
            // TODO: deprecate this invocation style
            return inject.apply(null, arg1)(connect(arg2));
        }
    }
    var componentClass = arg1;
    console.log(typeof componentClass === 'function', (!componentClass.prototype || !componentClass.prototype.render), !componentClass.isReactClass && !Component.isPrototypeOf(componentClass));
    console.info(componentClass.prototype);
    console.info(componentClass.prototype.render);
    console.info(componentClass.prototype);
    // Stateless function component:
    // If it is function but doesn't seem to be a react class constructor,
    // wrap it to a react class automatically
    if (typeof componentClass === 'function'
        && (!componentClass.prototype || !componentClass.prototype.render)
        && !componentClass.isReactClass
        && !Component.isPrototypeOf(componentClass)) {
        return connect(createClass({
            displayName: componentClass.displayName || componentClass.name,
            propTypes: componentClass.propTypes,
            contextTypes: componentClass.contextTypes,
            getDefaultProps: function () { return componentClass.defaultProps; },
            render: function () { return componentClass.call(this$1, this$1.props, this$1.context); }
        }));
    }
    invariant_1(componentClass, 'Please pass a valid component to "observer"');
    var target = componentClass.prototype || componentClass;
    ['componentWillMount', 'componentWillUnmount', 'componentDidMount', 'componentDidUpdate'].forEach(function (funcName) {
        patch(target, funcName);
    });
    if (!target.shouldComponentUpdate) {
        target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
    }
    componentClass.isMobXReactObserver = true;
    return componentClass;
}

var index = {
	Provider: Provider,
	connect: connect,
};

return index;

})));
