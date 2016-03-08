/*!
 * inferno-server v0.6.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};
babelHelpers;

function isArray(obj) {
	return obj.constructor === Array;
}

function isStringOrNumber(obj) {
	return typeof obj === 'string' || typeof obj === 'number';
}

function isNullOrUndefined(obj) {
	return obj === undefined || obj === null;
}

function isInvalidNode(obj) {
	return obj === undefined || obj === null || obj === false;
}

function renderChildren(children) {
	if (children && isArray(children)) {
		var childrenResult = [];

		for (var i = 0; i < children.length; i++) {
			var child = children[i];

			if (isStringOrNumber(child)) {
				childrenResult.push(child);
			} else {
				childrenResult.push(renderNode(child));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalidNode(children)) {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return renderNode(children);
		}
	}
}

function renderNode(node) {
	if (!isInvalidNode(node)) {
		var _ret = function () {
			var tag = node.tag;
			var outputAttrs = [];

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
				v: '<' + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + '>' + (renderChildren(node.children) || '') + '</' + tag + '>'
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
	}
}

function renderToString(node) {
	return renderNode(node);
}

var index = {
	renderToString: renderToString
};

export default index;