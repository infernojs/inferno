/*!
 * inferno-server v0.7.10
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoServer = factory());
}(this, function () { 'use strict';

	var babelHelpers = {};
	babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	babelHelpers.extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	babelHelpers.inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	babelHelpers.possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	babelHelpers;

	function addChildrenToProps(children, props) {
		if (!isNullOrUndefined(children)) {
			var isChildrenArray = isArray(children);
			if (isChildrenArray && children.length > 0 || !isChildrenArray) {
				if (props) {
					props = Object.assign({}, props, { children: children });
				} else {
					props = {
						children: children
					};
				}
			}
		}
		return props;
	}

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(obj) {
		return obj.prototype.render !== void 0;
	}

	function isStringOrNumber(obj) {
		return typeof obj === 'string' || typeof obj === 'number';
	}

	function isNullOrUndefined(obj) {
		return obj === void 0 || obj === null;
	}

	function isInvalidNode(obj) {
		return obj === null || obj === false || obj === void 0;
	}

	function isFunction(obj) {
		return typeof obj === 'function';
	}

	function renderComponent(Component, props, children, context) {
		props = addChildrenToProps(children, props);

		if (isStatefulComponent(Component)) {
			var instance = new Component(props);
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = babelHelpers.extends({}, context, childContext);
			}
			instance.context = context;
			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			instance.componentWillMount();
			var node = instance.render();
			instance._pendingSetState = false;
			return renderNode(node, context);
		} else {
			var _node = Component(props);
			return renderNode(_node, context);
		}
	}

	function renderChildren(children, context) {
		if (children && isArray(children)) {
			var childrenResult = [];
			var insertComment = false;

			for (var i = 0; i < children.length; i++) {
				var child = children[i];

				if (isStringOrNumber(child)) {
					if (insertComment === true) {
						childrenResult.push('<!-- -->');
					}
					childrenResult.push(child);
					insertComment = true;
				} else {
					insertComment = false;
					childrenResult.push(renderNode(child, context));
				}
			}
			return childrenResult.join('');
		} else if (!isInvalidNode(children)) {
			if (isStringOrNumber(children)) {
				return children;
			} else {
				return renderNode(children, context) || '';
			}
		}

		return '';
	}

	function renderNode(node, context) {
		if (!isInvalidNode(node)) {
			var _ret = function () {
				var tag = node.tag;
				var outputAttrs = [];

				if (isFunction(tag)) {
					return {
						v: renderComponent(tag, node.attrs, node.children, context)
					};
				}
				if (!isNullOrUndefined(node.className)) {
					outputAttrs.push('class="' + node.className + '"');
				}
				var attrs = node.attrs;

				if (!isNullOrUndefined(attrs)) {
					(function () {
						var attrsKeys = Object.keys(attrs);

						attrsKeys.forEach(function (attrsKey, i) {
							var attr = attrsKeys[i];

							outputAttrs.push(attr + '="' + attrs[attr] + '"');
						});
					})();
				}

				return {
					v: '<' + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + '>' + renderChildren(node.children, context) + '</' + tag + '>'
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
		}
	}

	function renderToString(node) {
		return renderNode(node, null);
	}

	var index = {
		renderToString: renderToString
	};

	return index;

}));