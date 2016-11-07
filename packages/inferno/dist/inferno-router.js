/*!
 * inferno-router v1.0.0-beta7
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno-create-element'), require('./inferno-component'), require('path-to-regexp'), require('./inferno')) :
	typeof define === 'function' && define.amd ? define(['inferno-create-element', 'inferno-component', 'path-to-regexp', 'inferno'], factory) :
	(global.InfernoRouter = factory(global.createElement,global.Component,global.pathToRegExp0,global.Inferno));
}(this, (function (createElement,Component,pathToRegExp0,Inferno) { 'use strict';

createElement = 'default' in createElement ? createElement['default'] : createElement;
Component = 'default' in Component ? Component['default'] : Component;
pathToRegExp0 = 'default' in pathToRegExp0 ? pathToRegExp0['default'] : pathToRegExp0;
Inferno = 'default' in Inferno ? Inferno['default'] : Inferno;

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

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

function toArray(children) {
    return isArray(children) ? children : (children ? [children] : children);
}
function isArray(obj) {
    return obj instanceof Array;
}






function isString(obj) {
    return typeof obj === 'string';
}

var emptyObject = Object.create(null);
function decode(val) {
    return typeof val !== 'string' ? val : decodeURIComponent(val);
}
function isEmpty(children) {
    return !children || !(isArray(children) ? children : Object.keys(children)).length;
}
function flatten(oldArray) {
    var newArray = [];
    flattenArray(oldArray, newArray);
    return newArray;
}
function getURLString(location) {
    return isString(location) ? location : (location.pathname + location.search);
}
function mapSearchParams(search) {
    if (search === '') {
        return emptyObject;
    }
    // Create an object with no prototype
    var map = Object.create(null);
    var fragment = search.split('&');
    for (var i = 0; i < fragment.length; i++) {
        var ref = fragment[i].split('=').map(mapFragment);
        var k = ref[0];
        var v = ref[1];
        if (map[k]) {
            map[k] = isArray(map[k]) ? map[k] : [map[k]];
            map[k].push(v);
        }
        else {
            map[k] = v;
        }
    }
    return map;
}
function pathRankSort(a, b) {
    var aAttr = a.props || emptyObject;
    var bAttr = b.props || emptyObject;
    var diff = rank(bAttr.path) - rank(aAttr.path);
    return diff || (bAttr.path && aAttr.path) ? (bAttr.path.length - aAttr.path.length) : 0;
}
function mapFragment(p, isVal) {
    return decodeURIComponent(isVal | 0 ? p : p.replace('[]', ''));
}
function strip(url) {
    return url.replace(/(^\/+|\/+$)/g, '');
}
function rank(url) {
    if ( url === void 0 ) url = '';

    return (strip(url).match(/\/+/g) || '').length;
}
function flattenArray(oldArray, newArray) {
    for (var i = 0; i < oldArray.length; i++) {
        var item = oldArray[i];
        if (isArray(item)) {
            flattenArray(item, newArray);
        }
        else {
            newArray.push(item);
        }
    }
}

var pathToRegExp = pathToRegExp0 || pathToRegExp1;
var cache = new Map();
function matchRoutes(_routes, urlToMatch, lastPath) {
    if ( urlToMatch === void 0 ) urlToMatch = '/';
    if ( lastPath === void 0 ) lastPath = '/';

    if (!Object.keys(_routes).length) {
        return _routes;
    }
    var routes = isArray(_routes) ? flatten(_routes) : toArray(_routes);
    var ref = urlToMatch.split('?');
    var pathToMatch = ref[0];
    var search = ref[1]; if ( search === void 0 ) search = '';
    var params = mapSearchParams(search);
    routes.sort(pathRankSort);
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var fullPath = (lastPath + (route.props && route.props.path || '/')).replace('//', '/');
        var isLast = !route.props || isEmpty(route.props.children);
        var match = matchPath(isLast, fullPath, pathToMatch);
        if (match) {
            var children = null;
            if (route.props && route.props.children) {
                var matched = matchRoutes(route.props.children, pathToMatch, fullPath);
                if (matched) {
                    children = matched;
                    Object.assign(params, matched.props.params);
                }
            }
            var node = Inferno.cloneVNode(route, {
                children: children,
                params: Object.assign(params, match.params),
                component: route.props.component
            });
            return node;
        }
    }
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

function getRoutes(_routes, currentURL) {
    var routes = toArray(_routes);
    var location = getURLString(currentURL);
    var matched = matchRoutes(routes, location, '/');
    return matched;
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
        var url = ref.url; if ( url === void 0 ) url = this.state.url;
        if (matched) {
            return matched;
        }
        var node = getRoutes(toArray(children), url);
        return node;
    };

    return Router;
}(Component));

var index = {
	Route: Route,
	Router: Router,
	Link: Link,
	getRoutes: getRoutes
};

return index;

})));
