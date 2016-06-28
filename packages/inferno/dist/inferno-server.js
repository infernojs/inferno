/*!
 * inferno-server v0.7.11
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.InfernoServer = factory());
}(this, function () { 'use strict';

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
  	return obj === void 0 || isNull(obj);
  }

  function isInvalidNode(obj) {
  	return isNull(obj) || obj === false || obj === void 0;
  }

  function isFunction(obj) {
  	return typeof obj === 'function';
  }

  function isNull(obj) {
  	return obj === null;
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

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

  function renderNode(node, context, isRoot) {
  	if (!isInvalidNode(node)) {
  		var _ret = function () {
  			var bp = node.bp;
  			var tag = node.tag || bp && bp.tag;
  			var outputAttrs = [];
  			var className = node.className || bp && bp.className;

  			if (isFunction(tag)) {
  				return {
  					v: renderComponent(tag, node.attrs, node.children, context, isRoot)
  				};
  			}
  			if (!isNullOrUndefined(className)) {
  				outputAttrs.push('class="' + className + '"');
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
  			if (isRoot) {
  				outputAttrs.push('data-infernoroot');
  			}
  			return {
  				v: '<' + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + '>' + renderChildren(node.children, context) + '</' + tag + '>'
  			};
  		}();

  		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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