/*!
 * inferno-server v0.6.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
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
		var tag = node.tag;
		var attrs = [];

		if (!isNullOrUndefined(node.className)) {
			attrs.push('class="' + node.className + '"');
		}

		return '<' + tag + (attrs.length > 0 ? ' ' + attrs.join(' ') : '') + '>' + (renderChildren(node.children) || '') + '</' + tag + '>';
	}
}

function renderToString(node) {
	return renderNode(node);
}

var index = {
	renderToString: renderToString
};

export default index;