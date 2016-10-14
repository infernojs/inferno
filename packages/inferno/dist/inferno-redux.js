/*!
 * inferno-redux v1.0.0-beta4
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('redux'), require('hoist-non-inferno-statics')) :
	typeof define === 'function' && define.amd ? define(['redux', 'hoist-non-inferno-statics'], factory) :
	(global.InfernoRedux = factory(global.redux,global.hoistStatics));
}(this, (function (redux,hoistStatics) { 'use strict';

hoistStatics = 'default' in hoistStatics ? hoistStatics['default'] : hoistStatics;

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

function toArray(children) {
    return isArray(children) ? children : (children ? [children] : children);
}
function isArray(obj) {
    return obj instanceof Array;
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



function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}

function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
}

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
        if (component._processingSetState || callback) {
            addToQueue(component, false, callback);
        }
        else {
            component._pendingSetState = true;
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
        var didUpdate = true;
        if (isInvalid(nextInput)) {
            nextInput = createVPlaceholder();
        }
        else if (isArray(nextInput)) {
            nextInput = createVFragment(nextInput, null);
        }
        else if (nextInput === NO_OP) {
            nextInput = component._lastInput;
            didUpdate = false;
        }
        var lastInput = component._lastInput;
        var parentDom = lastInput.dom.parentNode;
        component._lastInput = nextInput;
        if (didUpdate) {
            var subLifecycle = new Lifecycle();
            var childContext = component.getChildContext();
            if (!isNullOrUndef(childContext)) {
                childContext = Object.assign({}, context, component._childContext, childContext);
            }
            else {
                childContext = Object.assign({}, context, component._childContext);
            }
            component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
            subLifecycle.trigger();
            component.componentDidUpdate(props, prevState);
        }
        component._vComponent.dom = nextInput.dom;
        component._componentToDOMNodeMap.set(component, nextInput.dom);
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
    this._devToolsStatus = null;
    this._devToolsId = null;
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
        if (process.env.NODE_ENV !== 'production') {
            throwError('cannot update state via setState() in componentWillUpdate().');
        }
        throwError();
    }
};
Component.prototype.componentWillMount = function componentWillMount () {
};
Component.prototype.componentWillUnmount = function componentWillUnmount () {
};
Component.prototype.componentDidUpdate = function componentDidUpdate (prevProps, prevState, prevContext) {
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
function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    // Test for A's keys different from B.
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(objB, keysA[i]) ||
            objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }
    return true;
}
function wrapActionCreators(actionCreators) {
    return function (dispatch) { return redux.bindActionCreators(actionCreators, dispatch); };
}

var didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
        return;
    }
    didWarnAboutReceivingStore = true;
    warning$1('<Provider> does not support changing `store` on the fly.');
}
var Provider = (function (Component$$1) {
    function Provider(props, context) {
        Component$$1.call(this, props, context);
        this.store = props.store;
    }

    if ( Component$$1 ) Provider.__proto__ = Component$$1;
    Provider.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Provider.prototype.constructor = Provider;
    Provider.prototype.getChildContext = function getChildContext () {
        return { store: this.store };
    };
    Provider.prototype.render = function render () {
        if (isNullOrUndef(this.props.children) || toArray(this.props.children).length !== 1) {
            throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
        }
        return this.props.children;
    };

    return Provider;
}(Component));
if (process.env.NODE_ENV !== 'production') {
    Provider.prototype.componentWillReceiveProps = function (nextProps) {
        var ref = this;
        var store = ref.store;
        var nextStore = nextProps.store;
        if (store !== nextStore) {
            warnAboutReceivingStore();
        }
    };
}

// From https://github.com/lodash/lodash/blob/es
function overArg(func, transform) {
    return function (arg) {
        return func(transform(arg));
    };
}
var getPrototype = overArg(Object.getPrototypeOf, Object);
function isObjectLike(value) {
    return value != null && typeof value === 'object';
}
var objectTag = '[object Object]';
var funcProto = Function.prototype;
var objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
var objectToString = objectProto.toString;
function isPlainObject(value) {
    if (!isObjectLike(value) || objectToString.call(value) !== objectTag) {
        return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
        return true;
    }
    var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return (typeof Ctor === 'function' &&
        Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString);
}

var errorObject = { value: null };
var defaultMapStateToProps = function (state) { return ({}); }; // eslint-disable-line no-unused-vars
var defaultMapDispatchToProps = function (dispatch) { return ({ dispatch: dispatch }); };
var defaultMergeProps = function (stateProps, dispatchProps, parentProps) { return Object.assign({}, parentProps, stateProps, dispatchProps); };
function tryCatch(fn, ctx) {
    try {
        return fn.apply(ctx);
    }
    catch (e) {
        errorObject.value = e;
        return errorObject;
    }
}
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
// Helps track hot reloading.
var nextVersion = 0;
function connect(mapStateToProps, mapDispatchToProps, mergeProps, options) {
    if ( options === void 0 ) options = {};

    var shouldSubscribe = Boolean(mapStateToProps);
    var mapState = mapStateToProps || defaultMapStateToProps;
    var mapDispatch;
    if (isFunction(mapDispatchToProps)) {
        mapDispatch = mapDispatchToProps;
    }
    else if (!mapDispatchToProps) {
        mapDispatch = defaultMapDispatchToProps;
    }
    else {
        mapDispatch = wrapActionCreators(mapDispatchToProps);
    }
    var finalMergeProps = mergeProps || defaultMergeProps;
    var pure = options.pure; if ( pure === void 0 ) pure = true;
    var withRef = options.withRef; if ( withRef === void 0 ) withRef = false;
    var checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;
    // Helps track hot reloading.
    var version = nextVersion++;
    return function wrapWithConnect(WrappedComponent) {
        var connectDisplayName = "Connect(" + (getDisplayName(WrappedComponent)) + ")";
        function checkStateShape(props, methodName) {
            if (!isPlainObject(props)) {
                warning$1(methodName + "() in " + connectDisplayName + " must return a plain object. " +
                    "Instead received " + props + ".");
            }
        }
        function computeMergedProps(stateProps, dispatchProps, parentProps) {
            var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
            if (process.env.NODE_ENV !== 'production') {
                checkStateShape(mergedProps, 'mergeProps');
            }
            return mergedProps;
        }
        var Connect = (function (Component$$1) {
            function Connect(props, context) {
                var this$1 = this;

                Component$$1.call(this, props, context);
                this.version = version;
                this.store = (props && props.store) || (context && context.store);
                this.componentDidMount = function () {
                    this$1.trySubscribe();
                };
                if (!this.store) {
                    throwError('Could not find "store" in either the context or ' +
                        "props of \"" + connectDisplayName + "\". " +
                        'Either wrap the root component in a <Provider>, ' +
                        "or explicitly pass \"store\" as a prop to \"" + connectDisplayName + "\".");
                }
                var storeState = this.store.getState();
                this.state = { storeState: storeState };
                this.clearCache();
            }

            if ( Component$$1 ) Connect.__proto__ = Component$$1;
            Connect.prototype = Object.create( Component$$1 && Component$$1.prototype );
            Connect.prototype.constructor = Connect;
            Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate () {
                return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
            };
            Connect.prototype.computeStateProps = function computeStateProps (store, props) {
                if (!this.finalMapStateToProps) {
                    return this.configureFinalMapState(store, props);
                }
                var state = store.getState();
                var stateProps = this.doStatePropsDependOnOwnProps ?
                    this.finalMapStateToProps(state, props) :
                    this.finalMapStateToProps(state);
                return stateProps;
            };
            Connect.prototype.configureFinalMapState = function configureFinalMapState (store, props) {
                var mappedState = mapState(store.getState(), props);
                var isFactory = isFunction(mappedState);
                this.finalMapStateToProps = isFactory ? mappedState : mapState;
                this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;
                if (isFactory) {
                    return this.computeStateProps(store, props);
                }
                return mappedState;
            };
            Connect.prototype.computeDispatchProps = function computeDispatchProps (store, props) {
                if (!this.finalMapDispatchToProps) {
                    return this.configureFinalMapDispatch(store, props);
                }
                var dispatch = store.dispatch;
                var dispatchProps = this.doDispatchPropsDependOnOwnProps ?
                    this.finalMapDispatchToProps(dispatch, props) :
                    this.finalMapDispatchToProps(dispatch);
                return dispatchProps;
            };
            Connect.prototype.configureFinalMapDispatch = function configureFinalMapDispatch (store, props) {
                var mappedDispatch = mapDispatch(store.dispatch, props);
                var isFactory = isFunction(mappedDispatch);
                this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
                this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;
                if (isFactory) {
                    return this.computeDispatchProps(store, props);
                }
                return mappedDispatch;
            };
            Connect.prototype.updateStatePropsIfNeeded = function updateStatePropsIfNeeded () {
                var nextStateProps = this.computeStateProps(this.store, this.props);
                if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
                    return false;
                }
                this.stateProps = nextStateProps;
                return true;
            };
            Connect.prototype.updateDispatchPropsIfNeeded = function updateDispatchPropsIfNeeded () {
                var nextDispatchProps = this.computeDispatchProps(this.store, this.props);
                if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
                    return false;
                }
                this.dispatchProps = nextDispatchProps;
                return true;
            };
            Connect.prototype.updateMergedPropsIfNeeded = function updateMergedPropsIfNeeded () {
                var nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);
                if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
                    return false;
                }
                this.mergedProps = nextMergedProps;
                return true;
            };
            Connect.prototype.isSubscribed = function isSubscribed () {
                return isFunction(this.unsubscribe);
            };
            Connect.prototype.trySubscribe = function trySubscribe () {
                if (shouldSubscribe && !this.unsubscribe) {
                    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
                    this.handleChange();
                }
            };
            Connect.prototype.tryUnsubscribe = function tryUnsubscribe () {
                if (this.unsubscribe) {
                    this.unsubscribe();
                    this.unsubscribe = null;
                }
            };
            Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps) {
                if (!pure || !shallowEqual(nextProps, this.props)) {
                    this.haveOwnPropsChanged = true;
                }
            };
            Connect.prototype.componentWillUnmount = function componentWillUnmount () {
                this.tryUnsubscribe();
                this.clearCache();
            };
            Connect.prototype.clearCache = function clearCache () {
                this.dispatchProps = null;
                this.stateProps = null;
                this.mergedProps = null;
                this.haveOwnPropsChanged = true;
                this.hasStoreStateChanged = true;
                this.haveStatePropsBeenPrecalculated = false;
                this.statePropsPrecalculationError = null;
                this.renderedElement = null;
                this.finalMapDispatchToProps = null;
                this.finalMapStateToProps = null;
            };
            Connect.prototype.handleChange = function handleChange () {
                if (!this.unsubscribe) {
                    return;
                }
                var storeState = this.store.getState();
                var prevStoreState = this.state.storeState;
                if (pure && prevStoreState === storeState) {
                    return;
                }
                if (pure && !this.doStatePropsDependOnOwnProps) {
                    var haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
                    if (!haveStatePropsChanged) {
                        return;
                    }
                    if (haveStatePropsChanged === errorObject) {
                        this.statePropsPrecalculationError = errorObject.value;
                    }
                    this.haveStatePropsBeenPrecalculated = true;
                }
                this.hasStoreStateChanged = true;
                this.setState({ storeState: storeState });
            };
            Connect.prototype.getWrappedInstance = function getWrappedInstance () {
                return this.refs.wrappedInstance;
            };
            Connect.prototype.render = function render () {
                var ref = this;
                var haveOwnPropsChanged = ref.haveOwnPropsChanged;
                var hasStoreStateChanged = ref.hasStoreStateChanged;
                var haveStatePropsBeenPrecalculated = ref.haveStatePropsBeenPrecalculated;
                var statePropsPrecalculationError = ref.statePropsPrecalculationError;
                var renderedElement = ref.renderedElement;
                this.haveOwnPropsChanged = false;
                this.hasStoreStateChanged = false;
                this.haveStatePropsBeenPrecalculated = false;
                this.statePropsPrecalculationError = null;
                if (statePropsPrecalculationError) {
                    throw statePropsPrecalculationError;
                }
                var shouldUpdateStateProps = true;
                var shouldUpdateDispatchProps = true;
                if (pure && renderedElement) {
                    shouldUpdateStateProps = hasStoreStateChanged || (haveOwnPropsChanged && this.doStatePropsDependOnOwnProps);
                    shouldUpdateDispatchProps =
                        haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
                }
                var haveStatePropsChanged = false;
                var haveDispatchPropsChanged = false;
                if (haveStatePropsBeenPrecalculated) {
                    haveStatePropsChanged = true;
                }
                else if (shouldUpdateStateProps) {
                    haveStatePropsChanged = this.updateStatePropsIfNeeded();
                }
                if (shouldUpdateDispatchProps) {
                    haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
                }
                var haveMergedPropsChanged = true;
                if (haveStatePropsChanged ||
                    haveDispatchPropsChanged ||
                    haveOwnPropsChanged) {
                    haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
                }
                else {
                    haveMergedPropsChanged = false;
                }
                if (!haveMergedPropsChanged && renderedElement) {
                    return renderedElement;
                }
                if (withRef) {
                    this.renderedElement = createVComponent(WrappedComponent, Object.assign({}, this.mergedProps, { ref: 'wrappedInstance' }));
                }
                else {
                    this.renderedElement = createVComponent(WrappedComponent, this.mergedProps);
                }
                return this.renderedElement;
            };

            return Connect;
        }(Component));
        Connect.displayName = connectDisplayName;
        Connect.WrappedComponent = WrappedComponent;
        if (process.env.NODE_ENV !== 'production') {
            Connect.prototype.componentWillUpdate = function componentWillUpdate() {
                if (this.version === version) {
                    return;
                }
                // We are hot reloading!
                this.version = version;
                this.trySubscribe();
                this.clearCache();
            };
        }
        return hoistStatics(Connect, WrappedComponent);
    };
}

var index = {
	Provider: Provider,
	connect: connect,
};

return index;

})));
