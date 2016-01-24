/*!
 * inferno v0.5.21
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

var isArray = (function (x) {
  return x.constructor === Array;
})

var isVoid = (function (x) {
  return x === null || x === undefined;
})

function createVariable(index) {
	return {
		index: index
	};
}

function scanTreeForDynamicNodes(node, nodes) {
	var nodeIsDynamic = false;
	var dynamicFlags = {
		NODE: false,
		TEXT: false,
		ATTRS: false, // attrs can also be an object
		CHILDREN: false,
		KEY: false,
		COMPONENTS: false
	};

	if (isVoid(node)) {
		return false;
	}
	if (node.index !== undefined) {
		nodeIsDynamic = true;
		dynamicFlags.NODE = true;
	} else {
		if (!isVoid(node)) {
			if (!isVoid(node.tag)) {
				if (babelHelpers.typeof(node.tag) === 'object') {
					if (node.tag.index !== undefined) {
						nodeIsDynamic = true;
						dynamicFlags.COMPONENTS = true;
					} else {
						throw Error('Inferno Error: Incorrect tag name passed. Tag name must be a reference to a component, function or string.');
					}
				}
			}
			if (!isVoid(node.text)) {
				if (node.text.index !== undefined) {
					nodeIsDynamic = true;
					dynamicFlags.TEXT = true;
				}
			}
			if (!isVoid(node.attrs)) {
				if (node.attrs.index !== undefined) {
					nodeIsDynamic = true;
					dynamicFlags.ATTRS = true;
				} else {
					for (var attr in node.attrs) {
						var attrVal = node.attrs[attr];

						if (!isVoid(attrVal) && attrVal.index !== undefined) {
							if (attr === 'xmlns') {
								throw Error('Inferno Error: The \'xmlns\' attribute cannot be dynamic. Please use static value for \'xmlns\' attribute instead.');
							}
							if (dynamicFlags.ATTRS === false) {
								dynamicFlags.ATTRS = {};
							}
							dynamicFlags.ATTRS[attr] = attrVal.index;
							nodeIsDynamic = true;
						}
					}
				}
			}
			if (!isVoid(node.children)) {
				if (node.children.index !== undefined) {
					nodeIsDynamic = true;
				} else {
					if (isArray(node.children)) {
						for (var i = 0; i < node.children.length; i++) {
							var childItem = node.children[i];
							var result = scanTreeForDynamicNodes(childItem, nodes);

							if (result === true) {
								nodeIsDynamic = true;
								dynamicFlags.CHILDREN = true;
							}
						}
					} else if ((typeof node === 'undefined' ? 'undefined' : babelHelpers.typeof(node)) === 'object') {
						var result = scanTreeForDynamicNodes(node.children, nodes);

						if (result === true) {
							nodeIsDynamic = true;
							dynamicFlags.CHILDREN = true;
						}
					}
				}
			}
			if (!isVoid(node.key)) {
				if (node.key.index !== undefined) {
					nodeIsDynamic = true;
					dynamicFlags.KEY = true;
				}
			}
		}
	}
	if (nodeIsDynamic === true) {
		nodes.push({ node: node, dynamicFlags: dynamicFlags });
	}
	return nodeIsDynamic;
}

var uniqueId = 1;

var treeConstructors = {};

function addTreeConstructor(name, treeConstructor) {
	treeConstructors[name] = treeConstructor;
}

function applyTreeConstructors(schema, dynamicNodeMap) {
	var tree = {};

	for (var treeConstructor in treeConstructors) {
		tree[treeConstructor] = treeConstructors[treeConstructor](schema, true, dynamicNodeMap);
	}
	return tree;
}

function createTemplate(callback) {
	if (typeof callback === 'function') {
		var construct = callback.construct || null;

		if (isVoid(construct)) {
			(function () {
				var callbackLength = callback.length;
				var callbackArguments = new Array(callbackLength);

				for (var i = 0; i < callbackLength; i++) {
					callbackArguments[i] = createVariable(i);
				}
				var schema = callback.apply(undefined, callbackArguments);
				var dynamicNodeMap = [];

				scanTreeForDynamicNodes(schema, dynamicNodeMap);
				var tree = applyTreeConstructors(schema, dynamicNodeMap);
				var key = schema.key;
				var keyIndex = key ? key.index : -1;

				switch (callbackLength) {
					case 0:
						construct = function construct() {
							return {
								tree: tree,
								id: '' + uniqueId++,
								key: null,
								nextItem: null,
								rootNode: null
							};
						};
						break;
					case 1:
						construct = function construct(v0) {
							var key = undefined;

							if (keyIndex === 0) {
								key = v0;
							}
							return {
								tree: tree,
								id: '' + uniqueId++,
								key: key,
								nextItem: null,
								rootNode: null,
								v0: v0
							};
						};
						break;
					case 2:
						construct = function construct(v0, v1) {
							var key = undefined;

							if (keyIndex === 0) {
								key = v0;
							} else if (keyIndex === 1) {
								key = v1;
							}
							return {
								tree: tree,
								id: '' + uniqueId++,
								key: key,
								nextItem: null,
								rootNode: null,
								v0: v0,
								v1: v1
							};
						};
						break;
					default:
						construct = function construct(v0, v1) {
							for (var _len = arguments.length, values = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
								values[_key - 2] = arguments[_key];
							}

							var key = undefined;

							if (keyIndex === 0) {
								key = v0;
							} else if (keyIndex === 1) {
								key = v1;
							} else if (keyIndex > 1) {
								key = values[keyIndex];
							}
							return {
								tree: tree,
								id: '' + uniqueId++,
								key: key,
								nextItem: null,
								rootNode: null,
								v0: v0,
								v1: v1,
								values: values
							};
						};
						break;
				}
				if (!isVoid(construct)) {
					callback.construct = construct;
				}
			})();
		}

		return construct;
	}
}

function createElement(tag, attrs) {
	if (tag) {
		var vNode = {
			tag: tag
		};

		if (attrs) {
			if (attrs.key !== undefined) {
				vNode.key = attrs.key;
				delete attrs.key;
			}
			vNode.attrs = attrs;
		}

		for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			children[_key - 2] = arguments[_key];
		}

		if (children.length) {
			vNode.children = children;
		}
		return vNode;
	} else {
		return {
			text: tag
		};
	}
}

var TemplateFactory = {
	createElement: createElement
};

var index = {
	createTemplate: createTemplate,
	TemplateFactory: TemplateFactory,
	addTreeConstructor: addTreeConstructor
};

export default index;