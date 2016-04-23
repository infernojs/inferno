/*!
 * inferno-server v0.7.1
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
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

	babelHelpers;

	function addChildrenToProps(children, props) {
		if (!isNullOrUndefined(children)) {
			var isChildrenArray = isArray(children);
			if (isChildrenArray && children.length > 0 || !isChildrenArray) {
				if (props) {
					props.children = children;
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
		return obj === void 0 || obj === null || obj === false;
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
			var shouldUpdate = instance.shouldComponentUpdate();
			if (shouldUpdate) {
				instance.componentWillUpdate();
				var pendingState = instance._pendingState;
				var oldState = instance.state;
				instance.state = babelHelpers.extends({}, oldState, pendingState);
			}
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
				return renderNode(children, context);
			}
		}
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
					v: '<' + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + '>' + (renderChildren(node.children, context) || '') + '</' + tag + '>'
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