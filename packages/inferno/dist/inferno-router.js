/*!
 * inferno-router v1.0.0-beta6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno-component'), require('./inferno-create-element')) :
  typeof define === 'function' && define.amd ? define(['inferno-component', 'inferno-create-element'], factory) :
  (global.InfernoRouter = factory(global.Component,global.createElement));
}(this, (function (Component,createElement) { 'use strict';

Component = 'default' in Component ? Component['default'] : Component;
createElement = 'default' in createElement ? createElement['default'] : createElement;

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
    Route.prototype.onEnter = function onEnter () {
        var ref = this.props;
        var onEnter = ref.onEnter;
        if (onEnter) {
            onEnter(this.props, this.context.router);
        }
    };
    Route.prototype.onLeave = function onLeave () {
        var ref = this.props;
        var onLeave = ref.onLeave;
        if (onLeave) {
            onLeave(this.props, this.context.router);
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
        this.onLeave();
    };
    Route.prototype.componentWillMount = function componentWillMount () {
        this.async();
    };
    Route.prototype.componentDidUpdate = function componentDidUpdate () {
        this.onEnter();
    };
    Route.prototype.render = function render () {
        var ref = this.props;
        var component = ref.component;
        var children = ref.children;
        var params = ref.params;
        return createElement(component, {
            params: params,
            async: this.state.async
        }, children);
    };

    return Route;
}(Component));

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


function isArray(obj) {
    return obj instanceof Array;
}

/**
 * Expose `pathtoRegexp`.
 */

var index$1 = pathtoRegexp;

/**
 * Match matching groups in a regular expression.
 */
var MATCHING_GROUP_REGEXP = /\((?!\?)/g;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  keys = keys || [];
  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var extraOffset = 0;
  var keysOffset = keys.length;
  var i = 0;
  var name = 0;
  var m;

  if (path instanceof RegExp) {
    while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
      keys.push({
        name: name++,
        optional: false,
        offset: m.index
      });
    }

    return path;
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    return new RegExp('(?:' + path.join('|') + ')', flags);
  }

  path = ('^' + path + (strict ? '' : path[path.length - 1] === '/' ? '?' : '/?'))
    .replace(/\/\(/g, '/(?:')
    .replace(/([\/\.])/g, '\\$1')
    .replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional, offset) {
      slash = slash || '';
      format = format || '';
      capture = capture || '([^\\/' + format + ']+?)';
      optional = optional || '';

      keys.push({
        name: key,
        optional: !!optional,
        offset: offset + extraOffset
      });

      var result = ''
        + (optional ? '' : slash)
        + '(?:'
        + format + (optional ? slash : '') + capture
        + (star ? '((?:[\\/' + format + '].+?)?)' : '')
        + ')'
        + optional;

      extraOffset += result.length - match.length;

      return result;
    })
    .replace(/\*/g, function (star, index) {
      var len = keys.length;

      while (len-- > keysOffset && keys[len].offset > index) {
        keys[len].offset += 3; // Replacement length minus asterisk length.
      }

      return '(.*)';
    });

  // This is a workaround for handling unnamed matching groups.
  while (m = MATCHING_GROUP_REGEXP.exec(path)) {
    var escapeCount = 0;
    var index = m.index;

    while (path.charAt(--index) === '\\') {
      escapeCount++;
    }

    // It's possible to escape the bracket.
    if (escapeCount % 2 === 1) {
      continue;
    }

    if (keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) {
      keys.splice(keysOffset + i, 0, {
        name: name++, // Unnamed matching groups must be consistently linear.
        optional: false,
        offset: m.index
      });
    }

    i++;
  }

  // If the path is non-ending, match until the end or a slash.
  path += (end ? '$' : (path[path.length - 1] === '/' ? '' : '(?=\\/|$)'));

  return new RegExp(path, flags);
}

var pathToRegExp = index$1 || pathToRegExp1;
var cache = new Map();
var emptyObject = {};
function decode(val) {
    return typeof val !== 'string' ? val : decodeURIComponent(val);
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

function getRoutes(routing, currentURL) {
    var params = {};
    function grabRoutes(_routes, url, lastPath) {
        if (!_routes) {
            return _routes;
        }
        var routes = toArray$$1(_routes);
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
var Router = (function (Component$$1) {
    function Router(props, context) {
        Component$$1.call(this, props, context);
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
        var routes = toArray$$1(children);
        return getRoutes(routes, url || this.state.url);
    };

    return Router;
}(Component));
function toArray$$1(children) {
    return isArray(children) ? children : (children ? [children] : children);
}

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

var index = {
	Route: Route,
	Router: Router,
	Link: Link,
	getRoutes: getRoutes
};

return index;

})));
