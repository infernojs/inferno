/*!
 * inferno-router v1.0.0-beta1
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.InfernoRouter = factory());
}(this, (function () { 'use strict';

var NO_OP = '$NO_OP';
var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;

function isArray(obj) {
    return obj instanceof Array;
}


function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}

function isFunction(obj) {
    return typeof obj === 'function';
}



function isNull(obj) {
    return obj === null;
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

var ASYNC_STATUS = {
    pending: 'pending',
    fulfilled: 'fulfilled',
    rejected: 'rejected'
};
var Route = (function (Component$$1) {
    function Route(props, context) {
        Component$$1.call(this, props, context);
        this.state = {
            async: null
        };
    }

    if ( Component$$1 ) Route.__proto__ = Component$$1;
    Route.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Route.prototype.constructor = Route;
    Route.prototype.async = function async () {
        var this$1 = this;

        var async = this.props.async;
        if (async) {
            this.setState({
                async: { status: ASYNC_STATUS.pending }
            });
            async(this.props.params).then(function (value) {
                this$1.setState({
                    async: {
                        status: ASYNC_STATUS.fulfilled,
                        value: value
                    }
                });
            }, this.reject).catch(this.reject);
        }
    };
    Route.prototype.reject = function reject (value) {
        this.setState({
            async: {
                status: ASYNC_STATUS.rejected,
                value: value
            }
        });
    };
    Route.prototype.componentWillReceiveProps = function componentWillReceiveProps () {
        this.async();
    };
    Route.prototype.componentWillMount = function componentWillMount () {
        this.async();
    };
    Route.prototype.render = function render () {
        var ref = this.props;
        var component = ref.component;
        var params = ref.params;
        return createVComponent(component, { params: params, async: this.state.async });
    };

    return Route;
}(Component));

var EMPTY = {};
function segmentize(url) {
    return strip(url).split('/');
}
function strip(url) {
    return url.replace(/(^\/+|\/+$)/g, '');
}
function convertToHashbang(url) {
    if (url.indexOf('#') === -1) {
        url = '/';
    }
    else {
        var splitHashUrl = url.split('#!');
        splitHashUrl.shift();
        url = splitHashUrl.join('');
    }
    return url;
}
// Thanks goes to Preact for this function: https://github.com/developit/preact-router/blob/master/src/util.js#L4
// Wildcard support is added on top of that.
function exec(url, route, opts) {
    if ( opts === void 0 ) opts = EMPTY;

    var reg = /(?:\?([^#]*))?(#.*)?$/, c = url.match(reg), matches = {}, ret;
    if (c && c[1]) {
        var p = c[1].split('&');
        for (var i = 0; i < p.length; i++) {
            var r = p[i].split('=');
            matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
        }
    }
    url = segmentize(url.replace(reg, ''));
    route = segmentize(route || '');
    var max = Math.max(url.length, route.length);
    var hasWildcard = false;
    for (var i$1 = 0; i$1 < max; i$1++) {
        if (route[i$1] && route[i$1].charAt(0) === ':') {
            var param = route[i$1].replace(/(^\:|[+*?]+$)/g, ''), flags = (route[i$1].match(/[+*?]+$/) || EMPTY)[0] || '', plus = ~flags.indexOf('+'), star = ~flags.indexOf('*'), val = url[i$1] || '';
            if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
                ret = false;
                break;
            }
            matches[param] = decodeURIComponent(val);
            if (plus || star) {
                matches[param] = url.slice(i$1).map(decodeURIComponent).join('/');
                break;
            }
        }
        else if (route[i$1] !== url[i$1] && !hasWildcard) {
            if (route[i$1] === '*' && route.length === i$1 + 1) {
                hasWildcard = true;
            }
            else {
                ret = false;
                break;
            }
        }
    }
    if (opts.default !== true && ret === false) {
        return false;
    }
    return matches;
}
function pathRankSort(a, b) {
    var aAttr = a.props || EMPTY, bAttr = b.props || EMPTY;
    var diff = rank(bAttr.path) - rank(aAttr.path);
    return diff || (bAttr.path.length - aAttr.path.length);
}
function rank(url) {
    return (strip(url).match(/\/+/g) || '').length;
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

var Router = (function (Component$$1) {
    function Router(props, context) {
        Component$$1.call(this, props, context);
        if (!props.history) {
            throw new Error('Inferno Error: "inferno-router" Router components require a "history" prop passed.');
        }
        this._didRoute = false;
        this.state = {
            url: props.url || props.history.getCurrentUrl()
        };
    }

    if ( Component$$1 ) Router.__proto__ = Component$$1;
    Router.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Router.prototype.constructor = Router;
    Router.prototype.getChildContext = function getChildContext () {
        return {
            history: this.props.history,
            hashbang: this.props.hashbang
        };
    };
    Router.prototype.componentWillMount = function componentWillMount () {
        this.props.history.addRouter(this);
    };
    Router.prototype.componentWillUnmount = function componentWillUnmount () {
        this.props.history.removeRouter(this);
    };
    Router.prototype.handleRoutes = function handleRoutes (routes, url, hashbang, wrapperComponent, lastPath) {
        var this$1 = this;

        routes.sort(pathRankSort);
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var ref = route.props;
            var path = ref.path;
            var fullPath = lastPath + path;
            var params = exec(hashbang ? convertToHashbang(url) : url, fullPath);
            var children = toArray$1(route.props.children);
            if (children) {
                var subRoute = this$1.handleRoutes(children, url, hashbang, wrapperComponent, fullPath);
                if (!isNull(subRoute)) {
                    return subRoute;
                }
            }
            if (params) {
                if (wrapperComponent) {
                    return createVComponent(wrapperComponent, {
                        params: params,
                        children: cloneVNode(route, {
                            params: params
                        })
                    }, null, null, null);
                }
                return cloneVNode(route, {
                    params: params
                });
            }
        }
        if (!lastPath && wrapperComponent) {
            this._didRoute = true;
            return createVComponent(wrapperComponent, null, null, null, null);
        }
        return null;
    };
    Router.prototype.routeTo = function routeTo (url) {
        this._didRoute = false;
        this.setState({ url: url }, null);
        return this._didRoute;
    };
    Router.prototype.render = function render () {
        var children = toArray$1(this.props.children);
        var url = this.props.url || this.state.url;
        var wrapperComponent = this.props.component;
        var hashbang = this.props.hashbang;
        return this.handleRoutes(children, url, hashbang, wrapperComponent, '');
    };

    return Router;
}(Component));
function toArray$1(children) {
    return isArray(children) ? children : (children ? [children] : children);
}

function Link(props, ref) {
    var hashbang = ref.hashbang;
    var history = ref.history;

    var activeClassName = props.activeClassName;
    var activeStyle = props.activeStyle;
    var className = props.className;
    var to = props.to;
    var href = hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to;
    var elemProps = { href: href };
    var element = createVElement('a', elemProps, props.children, null, null, null);
    if (className) {
        elemProps.className = className;
    }
    if (history.isActive(to, hashbang)) {
        if (activeClassName) {
            elemProps.className = (className ? className + ' ' : '') + activeClassName;
        }
        if (activeStyle) {
            elemProps.style = Object.assign({}, props.style, activeStyle);
        }
    }
    if (!hashbang) {
        elemProps.onclick = function navigate(e) {
            if (e.button !== 0 || e.ctrlKey || e.altKey) {
                return;
            }
            e.preventDefault();
            var target = e.target;
            window.history.pushState(null, target.textContent, to);
            history.routeTo(to);
        };
    }
    return element;
}

var routers = [];
function getCurrentUrl() {
    var url = typeof location !== 'undefined' ? location : EMPTY;
    return ("" + (url.pathname || '') + (url.search || '') + (url.hash || ''));
}
function getHashbangRoot() {
    var url = typeof location !== 'undefined' ? location : EMPTY;
    return ("" + (url.protocol + '//' || '') + (url.host || '') + (url.pathname || '') + (url.search || '') + "#!");
}
function isActive(path, hashbang) {
    if (isBrowser) {
        if (hashbang) {
            var currentURL = getCurrentUrl() + (getCurrentUrl().indexOf('#!') === -1 ? '#!' : '');
            var matchURL = currentURL.match(/#!(.*)/);
            var matchHash = matchURL && typeof matchURL[1] !== 'undefined' && (matchURL[1] || '/');
            return matchHash === path;
        }
        return location.pathname === path;
    }
    return false;
}
function routeTo$1(url) {
    for (var i = 0; i < routers.length; i++) {
        if (routers[i].routeTo(url) === true) {
            return true;
        }
    }
    return false;
}
if (isBrowser) {
    window.addEventListener('popstate', function () { return routeTo$1(getCurrentUrl()); });
}
var browserHistory = {
    addRouter: function addRouter(router) {
        routers.push(router);
    },
    removeRouter: function removeRouter(router) {
        routers.splice(routers.indexOf(router), 1);
    },
    getCurrentUrl: getCurrentUrl,
    getHashbangRoot: getHashbangRoot,
    isActive: isActive,
    routeTo: routeTo$1
};

var index = {
    Route: Route,
    Router: Router,
    Link: Link,
    browserHistory: browserHistory
};

return index;

})));
