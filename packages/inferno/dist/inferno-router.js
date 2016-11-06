/*!
 * inferno-router v1.0.0-beta6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno-create-element'), require('./inferno-component'), require('./inferno'), require('path-to-regexp')) :
	typeof define === 'function' && define.amd ? define(['inferno-create-element', 'inferno-component', 'inferno', 'path-to-regexp'], factory) :
	(global.InfernoRouter = factory(global.createElement,global.Component,global.Inferno,global.pathToRegExp0));
}(this, (function (createElement,Component,Inferno,pathToRegExp0) { 'use strict';

createElement = 'default' in createElement ? createElement['default'] : createElement;
Component = 'default' in Component ? Component['default'] : Component;
Inferno = 'default' in Inferno ? Inferno['default'] : Inferno;
pathToRegExp0 = 'default' in pathToRegExp0 ? pathToRegExp0['default'] : pathToRegExp0;

function Link(props, ref) {
    var router = ref.router;

    var activeClassName = props.activeClassName;
    var activeStyle = props.activeStyle;
    var className = props.className;
    var to = props.to;
    var elemProps = {
        href: to
    };
    if (className) {
        elemProps.className = className;
    }
    if (router.location.pathname === to) {
        if (activeClassName) {
            elemProps.className = (className ? className + ' ' : '') + activeClassName;
        }
        if (activeStyle) {
            elemProps.style = Object.assign({}, props.style, activeStyle);
        }
    }
    elemProps.onclick = function navigate(e) {
        if (e.button !== 0 || e.ctrlKey || e.altKey) {
            return;
        }
        e.preventDefault();
        if (props.onEnter) {
            props.onEnter(props, function (confirm) {
                router.push(to, e.target.textContent);
            });
        }
        else {
            router.push(to, e.target.textContent);
        }
    };
    return createElement('a', elemProps, props.children);
}

var Route = (function (Component$$1) {
    function Route(props, context) {
        Component$$1.call(this, props, context);
    }

    if ( Component$$1 ) Route.__proto__ = Component$$1;
    Route.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Route.prototype.constructor = Route;
    Route.prototype.componentWillMount = function componentWillMount () {
        var ref = this.props;
        var onEnter = ref.onEnter;
        if (onEnter) {
            onEnter(this.props, this.context.router);
        }
    };
    Route.prototype.componentWillUnmount = function componentWillUnmount () {
        var ref = this.props;
        var onLeave = ref.onLeave;
        if (onLeave) {
            onLeave(this.props, this.context);
        }
    };
    Route.prototype.render = function render () {
        var ref = this.props;
        var component = ref.component;
        var children = ref.children;
        var params = ref.params;
        return createElement(component, {
            params: params,
            children: children
        });
    };

    return Route;
}(Component));

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

var createVPlaceholder = Inferno.createVPlaceholder;
var createVFragment = Inferno.createVFragment;
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
var Component$1 = function Component$1(props, context) {
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
Component$1.prototype.render = function render (nextProps, nextContext) {
};
Component$1.prototype.forceUpdate = function forceUpdate (callback) {
    if (this._unmounted) {
        throw Error(noOp);
    }
    applyState(this, true, callback);
};
Component$1.prototype.setState = function setState (newState, callback) {
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
            this.beforeRender && this.beforeRender();
            var render = this.render(nextProps, context);
            this.afterRender && this.afterRender();
            return render;
        }
    }
    return NO_OP;
};

var pathToRegExp = pathToRegExp0 || pathToRegExp1;
var cache = new Map();
var emptyObject = {};
function decode(val) {
    return typeof val !== 'string' ? val : decodeURIComponent(val);
}
function getRoutes(routing, currentURL) {
    var params = {};
    function grabRoutes(_routes, url, lastPath) {
        if (!_routes) {
            return _routes;
        }
        var routes = toArray(_routes);
        routes.sort(pathRankSort);
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (isArray(route)) {
                return grabRoutes(route, url, lastPath);
            }
            var ref = route.props;
            var children = ref.children;
            var path = ref.path; if ( path === void 0 ) path = '/';
            var fullPath = (lastPath + path).replace('//', '/');
            var isLast = isEmpty(children);
            if (children) {
                route.props.children = grabRoutes(children, url, fullPath);
            }
            var match = matchPath(isLast, fullPath, url.replace('//', '/'));
            if (match) {
                route.props.params = Object.assign(params, match.params);
                if (route.instance) {
                    return route.type(route.instance.props, route.instance.context);
                }
                else {
                    return route;
                }
            }
        }
    }
    return grabRoutes(routing, currentURL, '');
}
function isEmpty(children) {
    return !children || !(isArray(children) ? children : Object.keys(children)).length;
}
function matchPath(end, routePath, urlPath, parentParams) {
    var key = routePath + "|" + end;
    var regexp = cache.get(key);
    if (!regexp) {
        var keys = [];
        regexp = { pattern: pathToRegExp(routePath, keys, { end: end }), keys: keys };
        cache.set(key, regexp);
    }
    var m = regexp.pattern.exec(urlPath);
    if (!m) {
        return null;
    }
    var path = m[0];
    var params = Object.assign({}, parentParams);
    for (var i = 1; i < m.length; i += 1) {
        params[regexp.keys[i - 1].name] = decode(m[i]);
    }
    return {
        path: path === '' ? '/' : path,
        params: params
    };
}
function pathRankSort(a, b) {
    var aAttr = a.props || emptyObject;
    var bAttr = b.props || emptyObject;
    var diff = rank(bAttr.path) - rank(aAttr.path);
    return diff || (bAttr.path && aAttr.path) ? (bAttr.path.length - aAttr.path.length) : 0;
}
function strip(url) {
    return url.replace(/(^\/+|\/+$)/g, '');
}
function rank(url) {
    if ( url === void 0 ) url = '';

    return (strip(url).match(/\/+/g) || '').length;
}

var Router = (function (Component$$1) {
    function Router(props, context) {
        Component$$1.call(this, props, context);
        if (!props.history && !props.matched) {
            throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed, or a matched Route');
        }
        this._didRoute = false;
        this.router = props.history;
        this.state = {
            url: props.url || (this.router.location.pathname + this.router.location.search)
        };
    }

    if ( Component$$1 ) Router.__proto__ = Component$$1;
    Router.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Router.prototype.constructor = Router;
    Router.prototype.getChildContext = function getChildContext () {
        return {
            router: this.router || {
                location: {
                    pathname: this.props.url
                }
            }
        };
    };
    Router.prototype.componentWillMount = function componentWillMount () {
        var this$1 = this;

        if (this.router) {
            this.unlisten = this.router.listen(function (url) {
                this$1.routeTo(url.pathname);
            });
        }
    };
    Router.prototype.componentWillUnmount = function componentWillUnmount () {
        if (this.unlisten) {
            this.unlisten();
        }
    };
    Router.prototype.routeTo = function routeTo (url) {
        this._didRoute = false;
        this.setState({ url: url });
        return this._didRoute;
    };
    Router.prototype.render = function render () {
        // If we're injecting a single route (ex: result from getRoutes)
        // then we don't need to go through all routes again
        var ref = this.props;
        var matched = ref.matched;
        var children = ref.children;
        var url = ref.url;
        if (matched) {
            return matched;
        }
        var routes = toArray(children);
        return getRoutes(routes, url || this.state.url);
    };

    return Router;
}(Component$1));

var index = {
	Route: Route,
	Router: Router,
	Link: Link,
	getRoutes: getRoutes
};

return index;

})));
