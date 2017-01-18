/*!
 * inferno-compat v1.2.1
 * (c) 2017 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('inferno-component'), require('inferno')) :
	typeof define === 'function' && define.amd ? define(['exports', 'inferno-component', 'inferno'], factory) :
	(factory((global.Inferno = global.Inferno || {}),global.Inferno.Component,global.Inferno));
}(this, (function (exports,Component,inferno) { 'use strict';

Component = 'default' in Component ? Component['default'] : Component;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  if (typeof undefined === 'function' && undefined.amd) {
    undefined('PropTypes', ['exports', 'module'], factory);
  } else {
    factory(exports, module);
  }
})(commonjsGlobal, function (exports, module) {

  'use strict';

  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;

  var ReactElement = {};

  ReactElement.isValidElement = function (object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  };

  var ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };

  var emptyFunction = {
    thatReturns: function thatReturns(what) {
      return function () {
        return what;
      };
    }
  };

  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  var ANONYMOUS = '<<anonymous>>';

  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  function createChainableTypeChecker(validate) {
    function checkType(isRequired, props, propName, componentName, location, propFullName) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;
      if (props[propName] == null) {
        var locationName = ReactPropTypeLocationNames[location];
        if (isRequired) {
          return new Error('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        var locationName = ReactPropTypeLocationNames[location];

        var preciseType = getPreciseType(propValue);

        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturns(null));
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var locationName = ReactPropTypeLocationNames[location];
        var propType = getPropType(propValue);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']');
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!ReactElement.isValidElement(props[propName])) {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var locationName = ReactPropTypeLocationNames[location];
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      return createChainableTypeChecker(function () {
        return new Error('Invalid argument supplied to oneOf, expected an instance of array.');
      });
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (propValue === expectedValues[i]) {
          return null;
        }
      }

      var locationName = ReactPropTypeLocationNames[location];
      var valuesString = JSON.stringify(expectedValues);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      return createChainableTypeChecker(function () {
        return new Error('Invalid argument supplied to oneOfType, expected an instance of array.');
      });
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName) == null) {
          return null;
        }
      }

      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || ReactElement.isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      return 'object';
    }
    return propType;
  }

  function getPreciseType(propValue) {
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  module.exports = ReactPropTypes;
});


});

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though

function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}

function isNullOrUndef$1(obj) {
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

function isValidElement(obj) {
    var isNotANullObject = isObject(obj) && isNull(obj) === false;
    if (isNotANullObject === false) {
        return false;
    }
    var flags = obj.flags;
    return !!(flags & (28 /* Component */ | 3970 /* Element */));
}

// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = {
    constructor: 1,
    render: 1,
    shouldComponentUpdate: 1,
    componentWillReceiveProps: 1,
    componentWillUpdate: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1,
};
function extend(base, props, all) {
    for (var key in props) {
        if (all === true || !isNullOrUndef$1(props[key])) {
            base[key] = props[key];
        }
    }
    return base;
}
function bindAll(ctx) {
    for (var i in ctx) {
        var v = ctx[i];
        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST[i]) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}
function collateMixins(mixins, keyed) {
    if ( keyed === void 0 ) keyed = {};

    for (var i = 0; i < mixins.length; i++) {
        var mixin = mixins[i];
        // Surprise: Mixins can have mixins
        if (mixin.mixins) {
            // Recursively collate sub-mixins
            collateMixins(mixin.mixins, keyed);
        }
        for (var key in mixin) {
            if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
                (keyed[key] || (keyed[key] = [])).push(mixin[key]);
            }
        }
    }
    return keyed;
}
function applyMixin(key, inst, mixin) {
    var original = inst[key];
    inst[key] = function () {
        var arguments$1 = arguments;

        var ret;
        for (var i = 0; i < mixin.length; i++) {
            var method = mixin[i];
            var _ret = method.apply(inst, arguments$1);
            if (!isUndefined(_ret)) {
                ret = _ret;
            }
        }
        if (original) {
            var _ret$1 = original.call(inst);
            if (!isUndefined(_ret$1)) {
                ret = _ret$1;
            }
        }
        return ret;
    };
}
function applyMixins(inst, mixins) {
    for (var key in mixins) {
        if (mixins.hasOwnProperty(key)) {
            var mixin = mixins[key];
            if (isFunction(mixin[0])) {
                applyMixin(key, inst, mixin);
            }
            else {
                inst[key] = mixin;
            }
        }
    }
}
function createClass(obj) {
    var Cl = (function (Component$$1) {
        function Cl(props, context) {
            Component$$1.call(this, props, context);
            this.isMounted = function () {
                return !this._unmounted;
            };
            extend(this, obj);
            if (Cl.mixins) {
                applyMixins(this, Cl.mixins);
            }
            bindAll(this);
            if (obj.getInitialState) {
                this.state = obj.getInitialState.call(this);
            }
        }

        if ( Component$$1 ) Cl.__proto__ = Component$$1;
        Cl.prototype = Object.create( Component$$1 && Component$$1.prototype );
        Cl.prototype.constructor = Cl;

        return Cl;
    }(Component));
    Cl.displayName = obj.displayName || 'Component';
    Cl.propTypes = obj.propTypes;
    Cl.defaultProps = obj.getDefaultProps ? obj.getDefaultProps() : undefined;
    Cl.mixins = obj.mixins && collateMixins(obj.mixins);
    if (obj.statics) {
        extend(Cl, obj.statics);
    }
    return Cl;
}

var componentHooks = {
    onComponentWillMount: true,
    onComponentDidMount: true,
    onComponentWillUnmount: true,
    onComponentShouldUpdate: true,
    onComponentWillUpdate: true,
    onComponentDidUpdate: true,
};
function createElement$1(name, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    if (isInvalid(name) || isObject(name)) {
        throw new Error('Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class or function.');
    }
    var children = _children;
    var ref = null;
    var key = null;
    var events = null;
    var flags = 0;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        }
        else if (_children.length === 0) {
            children = undefined;
        }
    }
    if (isString(name)) {
        flags = 2 /* HtmlElement */;
        switch (name) {
            case 'svg':
                flags = 128 /* SvgElement */;
                break;
            case 'input':
                flags = 512 /* InputElement */;
                break;
            case 'textarea':
                flags = 1024 /* TextareaElement */;
                break;
            case 'select':
                flags = 2048 /* SelectElement */;
                break;
            default:
        }
        for (var prop in props) {
            if (prop === 'key') {
                key = props.key;
                delete props.key;
            }
            else if (prop === 'children' && isUndefined(children)) {
                children = props.children; // always favour children args, default to props
            }
            else if (prop === 'ref') {
                ref = props.ref;
            }
            else if (isAttrAnEvent(prop)) {
                if (!events) {
                    events = {};
                }
                events[prop] = props[prop];
                delete props[prop];
            }
        }
    }
    else {
        flags = isStatefulComponent(name) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
        if (!isUndefined(children)) {
            if (!props) {
                props = {};
            }
            props.children = children;
            children = null;
        }
        for (var prop$1 in props) {
            if (componentHooks[prop$1]) {
                if (!ref) {
                    ref = {};
                }
                ref[prop$1] = props[prop$1];
            }
            else if (prop$1 === 'key') {
                key = props.key;
                delete props.key;
            }
        }
    }
    return inferno.createVNode(flags, name, props, children, events, key, ref);
}

inferno.options.findDOMNodeEnabled = true;

function unmountComponentAtNode(container) {
	inferno.render(null, container);
	return true;
}

function isNullOrUndef(children) {
	return children === null || children === undefined;
}

var ARR = [];

var Children = {
	map: function map(children, fn, ctx) {
		if (isNullOrUndef(children)) {return children;}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {fn = fn.bind(ctx);}
		return children.map(fn);
	},
	forEach: function forEach(children, fn, ctx) {
		if (isNullOrUndef(children)) {return children;}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {fn = fn.bind(ctx);}
		children.forEach(fn);
	},
	count: function count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only: function only(children) {
		children = Children.toArray(children);
		if (children.length !== 1) {throw new Error('Children.only() expects only one child.');}
		return children[0];
	},
	toArray: function toArray(children) {
		if (isNullOrUndef(children)) {return [];}
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

var currentComponent = null;

Component.prototype.isReactComponent = {};
inferno.options.beforeRender = function (component) {
	currentComponent = component;
};
inferno.options.afterRender = function () {
	currentComponent = null;
};

var version = '15.4.1';

var xlinkAttrs = {
	xlinkActuate: 'xlink:actuate',
	xlinkArcrole: 'xlink:arcrole',
	xlinkHref: 'xlink:href',
	xlinkRole: 'xlink:role',
	xlinkShow: 'xlink:show',
	xlinkTitle: 'xlink:title',
	xlinkType: 'xlink:type'
};

function normalizeProps(name, props) {
	if ((name === 'input' || name === 'textarea') && props.onChange) {
		var type = props.type;
		var eventName;

		if (type === 'checkbox') {
			eventName = 'onclick';
		} else if (type === 'file') {
			eventName = 'onchange';
		} else {
			eventName = 'oninput';
		}
		if (!props[eventName]) {
			props[eventName] = props.onChange;
			delete props.onChange;
		}
	}
	for (var prop in props) {
		if (prop === 'onDoubleClick') {
			props.onDblClick = props[prop];
			delete props[prop];
		}
		if (xlinkAttrs[prop]) {
			props[xlinkAttrs[prop]] = props[prop];
			delete props[prop];
		}
	}
}

// we need to add persist() to Event (as React has it for synthetic events)
// this is a hack and we really shouldn't be modifying a global object this way,
// but there isn't a performant way of doing this apart from trying to proxy
// every prop event that starts with "on", i.e. onClick or onKeyPress
// but in reality devs use onSomething for many things, not only for
// input events
if (typeof Event !== 'undefined' && !Event.prototype.persist) {
	Event.prototype.persist = function () {};
}

var injectStringRefs = function (originalFunction) {
	return function (name, _props) {
		var children = [], len = arguments.length - 2;
		while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

		var props = _props || {};
		var ref = props.ref;

		if (typeof ref === 'string') {
			props.ref = function (val) {
				if (this && this.refs) {
					this.refs[ref] = val;
				}
			}.bind(currentComponent || null);
		}
		if (typeof name === 'string') {
			normalizeProps(name, props);
		}
		return originalFunction.apply(void 0, [ name, props ].concat( children ));
	};
};

var createElement = injectStringRefs(createElement$1);
var cloneElement = injectStringRefs(inferno.cloneVNode);

var oldCreateVNode = inferno.options.createVNode;

inferno.options.createVNode = function (vNode) {
	var children = vNode.children;
	var props = vNode.props;

	if (isNullOrUndef(vNode.props)) {
		props = vNode.props = {};
	}
	if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
		props.children = children;
	}
	if (oldCreateVNode) {
		oldCreateVNode(vNode);
	}
};

// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers(a, b) {
	for (var i in a) {if (!(i in b)) {return true;}}
	for (var i$1 in b) {if (a[i$1] !== b[i$1]) {return true;}}
	return false;
}

function PureComponent(props, context) {
	Component.call(this, props, context);
}

PureComponent.prototype = new Component({}, {});
PureComponent.prototype.shouldComponentUpdate = function (props, state) {
	return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};

var WrapperComponent = (function (Component$$1) {
	function WrapperComponent () {
		Component$$1.apply(this, arguments);
	}

	if ( Component$$1 ) WrapperComponent.__proto__ = Component$$1;
	WrapperComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
	WrapperComponent.prototype.constructor = WrapperComponent;

	WrapperComponent.prototype.getChildContext = function getChildContext () {
		return this.props.context;
	};
	WrapperComponent.prototype.render = function render$$1 (props) {
		return props.children;
	};

	return WrapperComponent;
}(Component));

function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
	var wrapperVNode = inferno.createVNode(4, WrapperComponent, { context: parentComponent.context, children: vNode });
	var component = inferno.render(wrapperVNode, container);

	if (callback) {
		// callback gets the component as context, no other argument.
		callback.call(component);
	}
	return component;
}

// Credit: preact-compat - https://github.com/developit/preact-compat
var ELEMENTS = 'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan'.split(' ');

function createFactory(type) {
	return createElement.bind(null, type);
}

var DOM = {};
for (var i = ELEMENTS.length; i--;) {
	DOM[ELEMENTS[i]] = createFactory(ELEMENTS[i]);
}

var index = {
	createVNode: inferno.createVNode,
	render: inferno.render,
	isValidElement: isValidElement,
	createElement: createElement,
	Component: Component,
	PureComponent: PureComponent,
	unmountComponentAtNode: unmountComponentAtNode,
	cloneElement: cloneElement,
	PropTypes: index$1,
	createClass: createClass,
	findDOMNode: inferno.findDOMNode,
	Children: Children,
	cloneVNode: inferno.cloneVNode,
	NO_OP: inferno.NO_OP,
	version: version,
	unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
	createFactory: createFactory,
	DOM: DOM
};

exports.createVNode = inferno.createVNode;
exports.render = inferno.render;
exports.isValidElement = isValidElement;
exports.createElement = createElement;
exports.Component = Component;
exports.PureComponent = PureComponent;
exports.unmountComponentAtNode = unmountComponentAtNode;
exports.cloneElement = cloneElement;
exports.PropTypes = index$1;
exports.createClass = createClass;
exports.findDOMNode = inferno.findDOMNode;
exports.Children = Children;
exports.cloneVNode = inferno.cloneVNode;
exports.NO_OP = inferno.NO_OP;
exports.version = version;
exports.unstable_renderSubtreeIntoContainer = unstable_renderSubtreeIntoContainer;
exports.createFactory = createFactory;
exports.DOM = DOM;
exports['default'] = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
