/*!
 * inferno-component v0.5.21
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

function shallowRender(item) {
	return item.tree.test.create(item, 1);
}

function deepRender(item) {
	return item.tree.test.create(item, 99);
}

var isArray = (function (x) {
  return x.constructor === Array;
})

var isVoid = (function (x) {
  return x === null || x === undefined;
})

var isStringOrNumber = (function (x) {
  return typeof x === 'string' || typeof x === 'number';
})

function getValueWithIndex(item, index) {
	return index < 2 ? index === 0 ? item.v0 : item.v1 : item.values[index - 2];
}

function constructVirtualChildren(children, item, depth, maxDepth) {

	if (!children) {
		return;
	}
	if (isArray(children)) {
		var vChildren = new Array(children.length);
		for (var i = 0; i < children.length; i++) {
			var childNode = children[i];

			if ((typeof childNode === 'undefined' ? 'undefined' : babelHelpers.typeof(childNode)) === 'object') {
				if (childNode.index !== undefined) {
					vChildren[i] = constructVirtualNode(getValueWithIndex(item, childNode.index), item, depth, maxDepth);
				}
			} else {
				vChildren[i] = constructVirtualNode(childNode, item, depth, maxDepth);
			}
		}
		return vChildren;
	} else if ((typeof children === 'undefined' ? 'undefined' : babelHelpers.typeof(children)) === 'object') {
		if (children.index !== undefined) {
			return constructVirtualNode(getValueWithIndex(item, children.index), item, depth, maxDepth);
		} else {
			return constructVirtualNode(children, item, depth, maxDepth);
		}
	} else if (isStringOrNumber(children)) {
		return children;
	}
}

function constructVirtualNode(node, item, depth, maxDepth) {
	var vNode = undefined;

	if (isStringOrNumber(node)) {
		return node;
	} else if (node && typeof node.tag === 'string') {
		vNode = {
			tag: node.tag,
			attrs: {}
		};
		if (node.attrs) {
			for (var attr in node.attrs) {
				var value = node.attrs[attr];

				if (value.index !== undefined) {
					vNode.attrs[attr] = getValueWithIndex(item, value.index);
				} else {
					vNode.attrs[attr] = value;
				}
			}
		}
		if (node.children && depth < maxDepth) {
			vNode.children = constructVirtualChildren(node.children, item, depth + 1, maxDepth);
		}
	} else if (node && babelHelpers.typeof(node.tag.index) !== undefined) {
		var Component = getValueWithIndex(item, node.tag.index);

		if (typeof Component === 'function') {
			var props = {};

			if (node.attrs) {
				for (var attr in node.attrs) {
					var value = node.attrs[attr];

					if (value.index !== undefined) {
						props[attr] = getValueWithIndex(item, value.index);
					} else {
						props[attr] = value;
					}
				}
			}
			// stateless
			if (!Component.prototype.render) {
				return Component(props).tree.test.create(item, depth + 1, maxDepth);
			} else {
				var instance = new Component(props);

				instance.componentWillMount();
				var render = instance.render().tree.test.create(item, depth + 1, maxDepth);

				instance.componentDidMount();
				return render;
			}
		}
	}
	return vNode;
}

function createTree(schema, isRoot, dynamicNodes) {
	return {
		create: function create(item, maxDepth) {
			return constructVirtualNode(schema, item, 0, maxDepth);
		}
	};
}

var recyclingEnabled$1 = true;

function pool(item) {
	var key = item.key;
	var tree = item.tree.dom;

	if (key === null) {
		tree.pool.push(item);
	} else {
		var keyedPool = tree.keyedPool; // TODO rename

		(keyedPool[key] || (keyedPool[key] = [])).push(item);
	}
}

function isRecyclingEnabled() {
	return recyclingEnabled$1;
}

var recyclingEnabled = isRecyclingEnabled();
function remove(item, parentNode) {
	var rootNode = item.rootNode;

	if (isVoid(rootNode) || !rootNode.nodeType) {
		return null;
	}
	if (rootNode === parentNode) {
		parentNode.innerHTML = '';
	} else {
		parentNode.removeChild(item.rootNode);
		if (recyclingEnabled) {
			pool(item);
		}
	}
}

function canHydrate(domNode, nextDomNode) {
	if (nextDomNode) {
		if (nextDomNode.nodeType === 1 && nextDomNode.hasAttribute('data-inferno')) {
			return true;
		} else {
			// otherwise clear the DOM node
			domNode.innerHTML = '';
		}
	}
}

function createDOMFragment(parentNode, nextNode) {
	var lastItem = undefined;
	var treeSuccessListeners = [];
	var context = {};
	var treeLifecycle = {
		addTreeSuccessListener: function addTreeSuccessListener(listener) {
			treeSuccessListeners.push(listener);
		},
		removeTreeSuccessListener: function removeTreeSuccessListener(listener) {
			for (var i = 0; i < treeSuccessListeners.length; i++) {
				var treeSuccessListener = treeSuccessListeners[i];

				if (treeSuccessListener === listener) {
					treeSuccessListeners.splice(i, 1);
					return;
				}
			}
		}
	};
	return {
		parentNode: parentNode,
		render: function render(nextItem) {
			if (nextItem) {
				var tree = nextItem.tree && nextItem.tree.dom;

				if (tree) {
					var activeNode = document.activeElement;

					if (lastItem) {
						tree.update(lastItem, nextItem, treeLifecycle, context);

						if (!nextItem.rootNode) {
							lastItem = null;
							return;
						}
					} else {
						if (tree) {
							var hydrateNode = parentNode.firstChild;

							if (canHydrate(parentNode, hydrateNode)) {
								tree.hydrate(hydrateNode, nextItem, treeLifecycle, context);
							} else {
								var dom = tree.create(nextItem, treeLifecycle, context);

								if (!dom) {
									return;
								}
								if (nextNode) {
									parentNode.insertBefore(dom, nextNode);
								} else if (parentNode) {
									parentNode.appendChild(dom);
								}
							}
						}
					}
					if (treeSuccessListeners.length > 0) {
						for (var i = 0; i < treeSuccessListeners.length; i++) {
							treeSuccessListeners[i]();
						}
					}
					lastItem = nextItem;
					if (activeNode !== document.body && document.activeElement !== activeNode) {
						activeNode.focus();
					}
				}
			}
		},
		remove: function remove$$() {
			if (lastItem) {
				var tree = lastItem.tree.dom;

				if (lastItem) {
					tree.remove(lastItem, treeLifecycle);
				}
				if (lastItem.rootNode.parentNode) {
					remove(lastItem, parentNode);
				}
			}
			treeSuccessListeners = [];
		}
	};
}

var rootFragments = [];

function getRootFragmentAtNode(node) {
	var rootFragmentsLength = rootFragments.length;

	if (rootFragmentsLength === 0) {
		return null;
	}
	for (var i = 0; i < rootFragmentsLength; i++) {
		var rootFragment = rootFragments[i];

		if (rootFragment.parentNode === node) {
			return rootFragment;
		}
	}
	return null;
}

function removeRootFragment(rootFragment) {
	for (var i = 0; i < rootFragments.length; i++) {
		if (rootFragments[i] === rootFragment) {
			rootFragments.splice(i, 1);
			return true;
		}
	}
	return false;
}

function render(nextItem, parentNode) {
	var rootFragment = getRootFragmentAtNode(parentNode);

	if (isVoid(rootFragment)) {
		var fragment = createDOMFragment(parentNode);

		fragment.render(nextItem);
		rootFragments.push(fragment);
	} else {
		if (isVoid(nextItem)) {
			rootFragment.remove();
			removeRootFragment(rootFragment);
		} else {
			rootFragment.render(nextItem);
		}
	}
}

function renderIntoDocument(nextItem) {
	var parentNode = document.createElement('div');

	render(nextItem, parentNode);
	return parentNode.firstChild;
}

var GLOBAL = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : null;

// browser
if (GLOBAL && GLOBAL.Inferno) {
	GLOBAL.Inferno.addTreeConstructor('test', createTree);
	// nodeJS
	// TODO! Find a better way to detect if we are running in Node, and test if this actually works!!!
} else if (GLOBAL && !GLOBAL.Inferno) {
		var Inferno = undefined;

		// TODO! Avoid try / catch
		try {
			Inferno = require('inferno');
		} catch (e) {
			Inferno = null;
			// TODO Should we throw a warning and inform that the Inferno package is not installed?
		}

		if (Inferno != null) {
			if (typeof Inferno.addTreeConstructor !== 'function') {
				throw 'Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoTestUtils package.';
			} else {
				Inferno.addTreeConstructor('test', createTree);
			}
		}
	}

var index = {
	shallowRender: shallowRender,
	deepRender: deepRender,
	renderIntoDocument: renderIntoDocument
	//Simulate
};

export default index;