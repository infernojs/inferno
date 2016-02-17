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

function renderChildren(children) {
	if (children && isArray(children)) {} else if (!isNullOrUndefined(children)) {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return renderNode(children);
		}
	}
}

function renderNode(node) {
	if (!isNullOrUndefined(node)) {
		var tag = node.tag;

		return '<' + tag + '>' + (renderChildren(node.children) || '') + '</' + tag + '>';
	}
}

function renderToString(node) {
	return renderNode(node);
}

var index = {
	renderToString: renderToString
};

export default index;