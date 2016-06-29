/*!
 * inferno-server v0.7.12
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

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(obj) {
		return obj.prototype.render !== void 0;
	}

	function isStringOrNumber(obj) {
		return isString(obj) || isNumber(obj);
	}

	function isNullOrUndefined(obj) {
		return obj === void 0 || isNull(obj);
	}

	function isInvalidNode(obj) {
		return isNull(obj) || obj === false || obj === void 0;
	}

	function isFunction(obj) {
		return typeof obj === 'function';
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

	var screenWidth = isBrowser && window.screen.width;
	var screenHeight = isBrowser && window.screen.height;
	var scrollX = 0;
	var scrollY = 0;
	var lastScrollTime = 0;

	if (isBrowser) {
		window.onscroll = function (e) {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
			lastScrollTime = performance.now();
		};

		window.resize = function (e) {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
			screenWidth = window.screen.width;
			screenHeight = window.screen.height;
			lastScrollTime = performance.now();
		};
	}

	function constructDefaults(string, object, value) {
		/* eslint no-return-assign: 0 */
		string.split(',').forEach(function (i) {
			return object[i] = value;
		});
	}

	var xlinkNS = 'http://www.w3.org/1999/xlink';
	var xmlNS = 'http://www.w3.org/XML/1998/namespace';
	var strictProps = {};
	var booleanProps = {};
	var namespaces = {};
	var isUnitlessNumber = {};

	constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
	constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
	constructDefaults('volume,value', strictProps, true);
	constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
	constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

	function renderComponent(Component, props, children, context, isRoot) {
		props = addChildrenToProps(children, props);

		if (isStatefulComponent(Component)) {
			var instance = new Component(props);
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			instance.componentWillMount();
			var node = instance.render();

			instance._pendingSetState = false;
			return renderNode(node, context, isRoot);
		} else {
			return renderNode(Component(props), context, isRoot);
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
					childrenResult.push(renderNode(child, context, false));
				}
			}
			return childrenResult.join('');
		} else if (!isInvalidNode(children)) {
			if (isStringOrNumber(children)) {
				return children;
			} else {
				return renderNode(children, context, false) || '';
			}
		}
		return '';
	}

	function toHyphenCase(str) {
		return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
	}

	function renderStyleToString(style) {
		if (isStringOrNumber(style)) {
			return style;
		} else {
			var styles = [];
			var keys = Object.keys(style);

			for (var i = 0; i < keys.length; i++) {
				var styleName = keys[i];
				var value = style[styleName];
				var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

				if (!isNullOrUndefined(value)) {
					styles.push(toHyphenCase(styleName) + ':' + value + px + ';');
				}
			}
			return styles.join();
		}
	}

	function renderNode(node, context, isRoot) {
		if (!isInvalidNode(node)) {
			var _ret = function () {
				var bp = node.bp;
				var tag = node.tag || bp && bp.tag;
				var outputAttrs = [];
				var className = node.className;
				var style = node.style;

				if (isFunction(tag)) {
					return {
						v: renderComponent(tag, node.attrs, node.children, context, isRoot)
					};
				}
				if (!isNullOrUndefined(className)) {
					outputAttrs.push('class="' + className + '"');
				}
				if (!isNullOrUndefined(style)) {
					outputAttrs.push('style="' + renderStyleToString(style) + '"');
				}
				var attrs = node.attrs;
				var attrKeys = attrs && Object.keys(attrs) || [];

				if (bp && bp.hasAttrs === true) {
					attrKeys = bp.attrKeys = bp.attrKeys ? bp.attrKeys.concat(attrKeys) : attrKeys;
				}
				attrKeys.forEach(function (attrsKey, i) {
					var attr = attrKeys[i];

					outputAttrs.push(attr + '="' + attrs[attr] + '"');
				});

				if (isRoot) {
					outputAttrs.push('data-infernoroot');
				}
				return {
					v: '<' + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + '>' + renderChildren(node.children, context) + '</' + tag + '>'
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
		}
	}

	function renderToString(node, noMetadata) {
		return renderNode(node, null, !noMetadata);
	}

	var index = {
		renderToString: renderToString
	};

	return index;

}));