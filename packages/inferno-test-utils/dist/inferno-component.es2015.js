/*!
 * inferno-component v0.5.21
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
import Inferno from 'inferno';

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

var isVoid = (function (x) {
  return x === null || x === undefined;
})

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
	var parent = item.rootNode.parentNode;

	if (parent === parentNode) {
		parentNode.removeChild(item.rootNode);
	} else {
		parentNode.removeChild(item.rootNode.parentNode);
	}

	if (isVoid(rootNode) || !rootNode.nodeType) {
		return null;
	}
	if (rootNode === parentNode) {
		parentNode.innerHTML = '';
	} else {
		var _parent = item.rootNode.parentNode;

		if (_parent === parentNode) {
			parentNode.removeChild(item.rootNode);
		} else {
			parentNode.removeChild(item.rootNode.parentNode);
		}
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

function createTreeLifecycle() {
	var treeLifecycle = {
		treeSuccessListeners: [],
		addTreeSuccessListener: function addTreeSuccessListener(listener) {
			treeLifecycle.treeSuccessListeners.push(listener);
		},
		removeTreeSuccessListener: function removeTreeSuccessListener(listener) {
			for (var i = 0; i < treeLifecycle.treeSuccessListeners.length; i++) {
				var treeSuccessListener = treeLifecycle.treeSuccessListeners[i];

				if (treeSuccessListener === listener) {
					treeLifecycle.treeSuccessListeners.splice(i, 1);
					return;
				}
			}
		},
		reset: function reset() {
			treeLifecycle.treeSuccessListeners = [];
		},
		trigger: function trigger() {
			if (treeLifecycle.treeSuccessListeners.length > 0) {
				for (var i = 0; i < treeLifecycle.treeSuccessListeners.length; i++) {
					treeLifecycle.treeSuccessListeners[i]();
				}
			}
		}
	};
	return treeLifecycle;
}

function createDOMFragment(parentNode, nextNode) {
	var lastItem = undefined;
	var context = {};
	var treeLifecycle = createTreeLifecycle();
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
					treeLifecycle.trigger();
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
			treeLifecycle.treeSuccessListeners = [];
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

if (Inferno) {
	if (typeof Inferno.addTreeConstructor !== 'function') {
		throw 'Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.';
	} else {
		Inferno.addTreeConstructor('test', createDOMTree);
	}
}

var index = {
	shallowRender: shallowRender,
	deepRender: deepRender,
	renderIntoDocument: renderIntoDocument
	//Simulate
};

export default index;