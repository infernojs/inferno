/*!
 * inferno-component v1.0.0-beta40
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno')) :
    typeof define === 'function' && define.amd ? define(['inferno'], factory) :
    (global.Inferno = global.Inferno || {}, global.Inferno.Component = factory(global.Inferno));
}(this, (function (inferno) { 'use strict';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
var isArray = Array.isArray;


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

var Lifecycle = function Lifecycle() {
    this.listeners = [];
    this.fastUnmount = true;
};
Lifecycle.prototype.addListener = function addListener (callback) {
    this.listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger () {
        var this$1 = this;

    for (var i = 0; i < this.listeners.length; i++) {
        this$1.listeners[i]();
    }
};

var noOp = ERROR_MSG;
if (process.env.NODE_ENV !== 'production') {
    noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
}
var componentCallbackQueue = new Map();
// when a components root VNode is also a component, we can run into issues
// this will recursively look for vNode.parentNode if the VNode is a component
function updateParentComponentVNodes(vNode, dom) {
    if (vNode.flags & 28 /* Component */) {
        var parentVNode = vNode.parentVNode;
        if (parentVNode) {
            parentVNode.dom = dom;
            updateParentComponentVNodes(parentVNode, dom);
        }
    }
}
// this is in shapes too, but we don't want to import from shapes as it will pull in a duplicate of createVNode
function createVoidVNode() {
    return inferno.createVNode(4096 /* Void */);
}
function addToQueue(component, force, callback) {
    // TODO this function needs to be revised and improved on
    var queue = componentCallbackQueue.get(component);
    if (!queue) {
        queue = [];
        componentCallbackQueue.set(component, queue);
        Promise.resolve().then(function () {
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
    if (!component._pendingSetState && isBrowser) {
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
    if ((!component._deferSetState || force) && !component._blockRender && !component._unmounted) {
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
            nextInput = createVoidVNode();
        }
        else if (isArray(nextInput)) {
            if (process.env.NODE_ENV !== 'production') {
                throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
            }
            throwError();
        }
        else if (nextInput === inferno.NO_OP) {
            nextInput = component._lastInput;
            didUpdate = false;
        }
        var lastInput = component._lastInput;
        var vNode = component._vNode;
        var parentDom = (lastInput.dom && lastInput.dom.parentNode) || (lastInput.dom = vNode.dom);
        component._lastInput = nextInput;
        if (didUpdate) {
            var subLifecycle = component._lifecycle;
            if (!subLifecycle) {
                subLifecycle = new Lifecycle();
            }
            else {
                subLifecycle.listeners = [];
            }
            component._lifecycle = subLifecycle;
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
            inferno.options.afterUpdate && inferno.options.afterUpdate(vNode);
        }
        var dom = vNode.dom = nextInput.dom;
        var componentToDOMNodeMap = component._componentToDOMNodeMap;
        componentToDOMNodeMap && componentToDOMNodeMap.set(component, nextInput.dom);
        updateParentComponentVNodes(vNode, dom);
        if (!isNullOrUndef(callback)) {
            callback();
        }
    }
}
var Component$1 = function Component(props, context) {
    this.state = {};
    this.refs = {};
    this._processingSetState = false;
    this._blockRender = false;
    this._ignoreSetState = false;
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
    this.props = props || inferno.EMPTY_OBJ;
    /** @type {object} */
    this.context = context || {};
    if (!this.componentDidMount) {
        this.componentDidMount = null;
    }
};
Component$1.prototype.render = function render (nextProps, nextState, nextContext) {
};
Component$1.prototype.forceUpdate = function forceUpdate (callback) {
    if (this._unmounted) {
        return;
    }
    isBrowser && applyState(this, true, callback);
};
Component$1.prototype.setState = function setState (newState, callback) {
    if (this._unmounted) {
        return;
    }
    if (!this._blockSetState) {
        if (!this._ignoreSetState) {
            queueStateChanges(this, newState, callback);
        }
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError('cannot update state via setState() in componentWillUpdate().');
        }
        throwError();
    }
};
Component$1.prototype.componentWillMount = function componentWillMount () {
};
Component$1.prototype.componentDidMount = function componentDidMount () {
};
Component$1.prototype.componentWillUnmount = function componentWillUnmount () {
};
Component$1.prototype.componentDidUpdate = function componentDidUpdate (prevProps, prevState, prevContext) {
};
Component$1.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState, context) {
    return true;
};
Component$1.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps, context) {
};
Component$1.prototype.componentWillUpdate = function componentWillUpdate (nextProps, nextState, nextContext) {
};
Component$1.prototype.getChildContext = function getChildContext () {
};
Component$1.prototype._updateComponent = function _updateComponent (prevState, nextState, prevProps, nextProps, context, force) {
    if (this._unmounted === true) {
        if (process.env.NODE_ENV !== 'production') {
            throwError(noOp);
        }
        throwError();
    }
    if ((prevProps !== nextProps || nextProps === inferno.EMPTY_OBJ) || prevState !== nextState || force) {
        if (prevProps !== nextProps || nextProps === inferno.EMPTY_OBJ) {
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
            var state = this.state = nextState;
            this.context = context;
            inferno.options.beforeRender && inferno.options.beforeRender(this);
            var render = this.render(nextProps, state, context);
            inferno.options.afterRender && inferno.options.afterRender(this);
            return render;
        }
    }
    return inferno.NO_OP;
};

return Component$1;

})));
