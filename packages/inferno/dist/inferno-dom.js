/*!
 * inferno-dom v0.5.20
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.InfernoDOM = factory());
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

  var isVoid = (function (x) {
    return x === null || x === undefined;
  })

  var isArray = (function (x) {
    return x.constructor === Array;
  })

  var isStringOrNumber = (function (x) {
    return typeof x === 'string' || typeof x === 'number';
  })

  var ObjectTypes = {
  	VARIABLE: 1
  };

  var ValueTypes = {
  	TEXT: 0,
  	ARRAY: 1,
  	TREE: 2,
  	EMPTY_OBJECT: 3,
  	FUNCTION: 4,
  	FRAGMENT: 5
  };

  function getValueWithIndex(item, index) {
  	return index < 2 ? index === 0 ? item.v0 : item.v1 : item.values[index - 2];
  }

  function getTypeFromValue(value) {

  	if (isStringOrNumber(value) || isVoid(value)) {
  		return ValueTypes.TEXT;
  	} else if (isArray(value)) {
  		return ValueTypes.ARRAY;
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.create) {
  		return ValueTypes.TREE;
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && Object.keys(value).length === 0) {
  		return ValueTypes.EMPTY_OBJECT;
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.tree.dom) {
  		return ValueTypes.FRAGMENT;
  	} else if (typeof value === 'function') {
  		return ValueTypes.FUNCTION;
  	}
  }

  function getValueForProps(props, item) {
  	var newProps = {};

  	if (props.index) {
  		return getValueWithIndex(item, props.index);
  	}
  	for (var name in props) {
  		var val = props[name];

  		if (val && val.index !== undefined) {
  			newProps[name] = getValueWithIndex(item, val.index);
  		} else {
  			newProps[name] = val;
  		}

  		if (name === 'children') {
  			newProps[name].overrideItem = item;
  		}
  	}
  	return newProps;
  }

  function removeValueTree(value, treeLifecycle) {
  	if (isVoid(value)) {
  		return;
  	}
  	if (isArray(value)) {
  		for (var i = 0; i < value.length; i++) {
  			var child = value[i];

  			removeValueTree(child, treeLifecycle);
  		}
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
  		var tree = value.tree;

  		if (tree) {
  			tree.dom.remove(value, treeLifecycle);
  		} else if (value.create) {
  			value.remove(value, treeLifecycle);
  		}
  	}
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

  function recycle(tree, item, treeLifecycle, context) {
  	// TODO use depth as key
  	var key = item.key;
  	var recyclableItem = undefined;

  	// TODO faster to check pool size first?
  	if (key !== null) {
  		var keyPool = tree.keyedPool[key];

  		recyclableItem = keyPool && keyPool.pop();
  	} else {
  		recyclableItem = tree.pool.pop();
  	}
  	if (recyclableItem) {
  		tree.update(recyclableItem, item, treeLifecycle, context);
  		return item.rootNode;
  	}
  }
  function isRecyclingEnabled() {
  	return recyclingEnabled$1;
  }

  var recyclingEnabled$2 = isRecyclingEnabled();
  var infernoBadTemplate = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';

  function updateKeyed(items, oldItems, parentNode, parentNextNode, treeLifecycle, context) {

  	var stop = false;
  	var startIndex = 0;
  	var oldStartIndex = 0;

  	var itemsLength = items.length;
  	var oldItemsLength = oldItems.length;

  	var startItem = itemsLength > 0 && items[startIndex];

  	// Edge case! In cases where someone try to update from [null] to [null], 'startitem' will be null.
  	// Also in cases where someone try to update from [{}] to [{}] (empty object to empty object)
  	// We solve that with avoiding going into the iteration loop.
  	if (!isVoid(startItem) && !isVoid(startItem.tree)) {

  		if (items == null || itemsLength === 0 && oldItemsLength >= 5) {
  			if (recyclingEnabled$2) {
  				for (var i = 0; i < oldItemsLength; i++) {
  					pool(oldItems[i]);
  				}
  			}
  			parentNode.textContent = '';
  			return;
  		}

  		var endIndex = itemsLength - 1;
  		var oldEndIndex = oldItemsLength - 1;
  		var oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
  		var endItem = undefined;
  		var oldEndItem = undefined;
  		var nextNode = undefined;
  		var oldItem = undefined;
  		var item = undefined;
  		var endItemKey = undefined;
  		var oldEndItemKey = undefined;
  		var oldStartItemKey = undefined;
  		var startItemKey = undefined;
  		var updateTree = function updateTree(item, oldItem, startItem, treeLifecycle, context) {
  			item.tree.dom.update(oldItem, startItem, treeLifecycle, context);
  		};

  		outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {

  			oldStartItemKey = oldStartItem.key;
  			startItemKey = startItem.key;

  			stop = true;
  			while (startItemKey === oldStartItemKey) {
  				updateTree(startItem, oldStartItem, startItem);
  				startIndex++;
  				oldStartIndex++;
  				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
  					break outer;
  				} else {
  					startItem = items[startIndex];
  					oldStartItem = oldItems[oldStartIndex];
  					stop = false;
  				}
  			}
  			endItem = items[endIndex];
  			oldEndItem = oldItems[oldEndIndex];
  			oldEndItemKey = oldEndItem.key;
  			endItemKey = endItem.key;

  			while (endItemKey === oldEndItemKey) {
  				updateTree(endItem, oldEndItem, endItem);
  				endIndex--;
  				oldEndIndex--;
  				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
  					break outer;
  				} else {
  					endItem = items[endIndex];
  					oldEndItem = oldItems[oldEndIndex];
  					stop = false;
  				}
  			}
  			while (endItemKey === oldStartItemKey) {
  				nextNode = endIndex + 1 < itemsLength ? items[endIndex + 1].rootNode : parentNextNode;
  				updateTree(endItem, oldStartItem, endItem);
  				insertOrAppend(parentNode, endItem.rootNode, nextNode);
  				endIndex--;
  				oldStartIndex++;
  				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
  					break outer;
  				} else {
  					endItem = items[endIndex];
  					oldStartItem = oldItems[oldStartIndex];
  					stop = false;
  				}
  			}
  			while (startItemKey === oldEndItemKey) {
  				nextNode = oldItems[oldStartIndex].rootNode;
  				updateTree(startItem, oldEndItem, startItem);
  				insertOrAppend(parentNode, startItem.rootNode, nextNode);
  				startIndex++;
  				oldEndIndex--;
  				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
  					break outer;
  				} else {
  					startItem = items[startIndex];
  					oldEndItem = oldItems[oldEndIndex];
  					stop = false;
  				}
  			}
  		}

  		if (oldStartIndex > oldEndIndex) {
  			if (startIndex <= endIndex) {
  				nextNode = endIndex + 1 < itemsLength ? items[endIndex + 1].rootNode : parentNextNode;
  				for (; startIndex <= endIndex; startIndex++) {
  					item = items[startIndex];
  					insertOrAppend(parentNode, item.tree.dom.create(item, treeLifecycle, context), nextNode);
  				}
  			}
  		} else if (startIndex > endIndex) {
  			for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
  				oldItem = oldItems[oldStartIndex];
  				remove(oldItem, parentNode);
  			}
  		} else {
  			var oldItemsMap = {};
  			var oldNextItem = oldEndIndex + 1 < oldItemsLength ? oldItems[oldEndIndex + 1] : null;

  			for (var i = oldEndIndex; i >= oldStartIndex; i--) {
  				oldItem = oldItems[i];
  				oldItem.nextItem = oldNextItem;
  				oldItemsMap[oldItem.key] = oldItem;
  				oldNextItem = oldItem;
  			}
  			var nextItem = endIndex + 1 < itemsLength ? items[endIndex + 1] : null;

  			for (var i = endIndex; i >= startIndex; i--) {
  				item = items[i];
  				var key = item.key;

  				oldItem = oldItemsMap[key];
  				if (oldItem) {
  					oldItemsMap[key] = null;
  					oldNextItem = oldItem.nextItem;
  					updateTree(item, oldItem, item);

  					if (item.rootNode.nextSibling !== (nextItem && nextItem.rootNode)) {
  						nextNode = nextItem && nextItem.rootNode || parentNextNode;
  						insertOrAppend(parentNode, item.rootNode, nextNode);
  					}
  				} else {
  					nextNode = nextItem && nextItem.rootNode || parentNextNode;
  					insertOrAppend(parentNode, item.tree.dom.create(item, treeLifecycle, context), nextNode);
  				}
  				nextItem = item;
  			}
  			for (var i = oldStartIndex; i <= oldEndIndex; i++) {
  				oldItem = oldItems[i];
  				if (oldItemsMap[oldItem.key] !== null) {
  					oldItem = oldItems[oldStartIndex];
  					remove(item, parentNode);
  				}
  			}
  		}
  	}
  }

  function updateNonKeyed(items, oldItems, domNodeList, parentNode, parentNextNode, treeLifecycle, context) {
  	var itemsLength = undefined;

  	if (items) {
  		if (!isVoid(oldItems)) {
  			itemsLength = Math.max(items.length, oldItems.length);

  			for (var i = 0; i < itemsLength; i++) {
  				var item = items[i];
  				var oldItem = oldItems[i];

  				if (!isVoid(item)) {

  					if (!isVoid(oldItem)) {
  						if (isStringOrNumber(item)) {
  							var domNode = domNodeList[i];

  							if (domNode) {
  								domNode.nodeValue = item;
  							}
  						} else if ((typeof item === 'undefined' ? 'undefined' : babelHelpers.typeof(item)) === 'object') {
  							item.tree.dom.update(oldItem, item, treeLifecycle, context);
  						}
  					} else {
  						if (isStringOrNumber(item)) {
  							var childNode = document.createTextNode(item);

  							domNodeList[i] = childNode;
  							insertOrAppend(parentNode, childNode, parentNextNode);
  						} else if ((typeof item === 'undefined' ? 'undefined' : babelHelpers.typeof(item)) === 'object') {
  							var childNode = item.tree.dom.create(item, treeLifecycle, context);

  							domNodeList[i] = childNode;
  							insertOrAppend(parentNode, childNode, parentNextNode);
  						}
  					}
  				} else {

  					if (domNodeList[i]) {
  						parentNode.removeChild(domNodeList[i]);
  						domNodeList.splice(i, 1);
  					}
  				}
  			}
  		}
  	}
  }

  function insertOrAppend(parentNode, newNode, nextNode) {
  	if (nextNode) {
  		parentNode.insertBefore(newNode, nextNode);
  	} else {
  		parentNode.appendChild(newNode);
  	}
  }

  function remove(item, parentNode) {
  	var rootNode = item.rootNode;

  	if (isVoid(rootNode) || !rootNode.nodeType) {
  		return null;
  	}
  	if (rootNode === parentNode) {
  		parentNode.innerHTML = '';
  	} else {
  		parentNode.removeChild(item.rootNode);
  		if (recyclingEnabled$2) {
  			pool(item);
  		}
  	}
  }

  function createVirtualList(value, item, childNodeList, treeLifecycle, context) {

  	if (!isVoid(value)) {

  		var domNode = document.createDocumentFragment();
  		var keyedChildren = true;

  		for (var i = 0; i < value.length; i++) {
  			var childNode = value[i];
  			var childType = getTypeFromValue(childNode);
  			var childDomNode = undefined;

  			switch (childType) {
  				case ValueTypes.TEXT:
  					childDomNode = document.createTextNode(childNode);
  					childNodeList.push(childDomNode);
  					domNode.appendChild(childDomNode);
  					keyedChildren = false;
  					break;
  				case ValueTypes.TREE:
  					keyedChildren = false;
  					childDomNode = childNode.create(item, treeLifecycle, context);
  					childNodeList.push(childDomNode);

  					if ("development" !== 'production') {
  						if (childDomNode === undefined) {
  							throw Error('Inferno Error: Children must be provided as templates.');
  						}
  					}
  					domNode.appendChild(childDomNode);
  					break;
  				case ValueTypes.FRAGMENT:
  					if (childNode.key === undefined) {
  						keyedChildren = false;
  					}
  					childDomNode = childNode.tree.dom.create(childNode, treeLifecycle, context);
  					childNodeList.push(childDomNode);
  					domNode.appendChild(childDomNode);
  					break;
  				case ValueTypes.EMPTY_OBJECT:
  					if ("development" !== 'production') {
  						throw Error(infernoBadTemplate);
  					}
  					return;
  				case ValueTypes.FUNCTION:
  					if ("development" !== 'production') {
  						throw Error(infernoBadTemplate);
  					}
  					return;
  				case ValueTypes.ARRAY:
  					if ("development" !== 'production') {
  						throw Error('Inferno Error: Deep nested arrays are not supported as a valid template values - e.g. [[[1, 2, 3]]]. Only shallow nested arrays are supported - e.g. [[1, 2, 3]].');
  					}
  					return;
  			}
  		}
  		return { domNode: domNode, keyedChildren: keyedChildren };
  	}
  }

  function updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context) {
  	if (isVoid(lastValue)) {
  		return null;
  	}
  	// NOTE: if someone switches from keyed to non-keyed, the node order won't be right...
  	if (isArray(lastValue)) {
  		if (keyedChildren) {
  			updateKeyed(nextValue, lastValue, domNode, nextDomNode, treeLifecycle, context);
  		} else {
  			updateNonKeyed(nextValue, lastValue, childNodeList, domNode, nextDomNode, treeLifecycle, context);
  		}
  	} else {
  		// TODO
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

  function purgeCommentNodes(domNode, parentDom) {
  	var nextSibling = domNode.nextSibling;

  	if (nextSibling && nextSibling.nodeType === 8) {
  		nextSibling = purgeCommentNodes(nextSibling, parentDom);
  		parentDom.removeChild(nextSibling);
  	}

  	return nextSibling;
  }

  function validateHydrateNodeChildren(hydrateNode, templateNode) {
  	var templateNodeChild = templateNode.firstChild;
  	var hydrateNodeChild = hydrateNode.firstChild;

  	while (templateNodeChild) {
  		var result = validateHydrateNode(hydrateNodeChild, templateNodeChild);
  		if (!result) {
  			return false;
  		}
  		templateNodeChild = templateNodeChild.nextSibling;
  		// check when we reach a comment and remove it, as they are used to break up text nodes
  		hydrateNodeChild = purgeCommentNodes(hydrateNodeChild, hydrateNode);
  	}
  	return true;
  }

  function validateHydrateNode(hydrateNode, templateNode, item, dynamicAttrs) {
  	// check nodeNames, return false if not same
  	if (hydrateNode.nodeName !== templateNode.nodeName) {
  		return false;
  	}
  	if (hydrateNode.nodeType === 1) {
  		// check hydrateNode has all the same attrs as templateNode (as these will be static)
  		// return false if not same
  		// TODO

  		// check hydrateNode has all the same attrs as dynamicAttrs+item (as these will be dyanmic),
  		// passively update here and do not return false (as state could have changed) if not same
  		if (dynamicAttrs && item) {}
  		// TODO

  		// check through children
  		return validateHydrateNodeChildren(hydrateNode, templateNode);
  	} else if (hydrateNode.nodeType === 3) {
  		return hydrateNode.nodeValue === templateNode.nodeValue;
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

  function createRef() {
  	return {
  		element: null
  	};
  }

  // To be compat with React, we support at least the same SVG elements
  function isSVGElement(nodeName) {
  	return nodeName === 'svg' || nodeName === 'clipPath' || nodeName === 'circle' || nodeName === 'defs' || nodeName === 'desc' || nodeName === 'ellipse' || nodeName === 'filter' || nodeName === 'g' || nodeName === 'line' || nodeName === 'linearGradient' || nodeName === 'mask' || nodeName === 'marker' || nodeName === 'metadata' || nodeName === 'mpath' || nodeName === 'path' || nodeName === 'pattern' || nodeName === 'polygon' || nodeName === 'polyline' || nodeName === 'pattern' || nodeName === 'radialGradient' || nodeName === 'rect' || nodeName === 'set' || nodeName === 'stop' || nodeName === 'symbol' || nodeName === 'switch' || nodeName === 'text' || nodeName === 'tspan' || nodeName === 'use' || nodeName === 'view';
  }

  function isMathMLElement(nodeName) {
  	return nodeName === 'mo' || nodeName === 'mover' || nodeName === 'mn' || nodeName === 'maction' || nodeName === 'menclose' || nodeName === 'merror' || nodeName === 'mfrac' || nodeName === 'mi' || nodeName === 'mmultiscripts' || nodeName === 'mpadded' || nodeName === 'mphantom' || nodeName === 'mroot' || nodeName === 'mrow' || nodeName === 'ms' || nodeName === 'mtd' || nodeName === 'mtable' || nodeName === 'munder' || nodeName === 'msub' || nodeName === 'msup' || nodeName === 'msubsup' || nodeName === 'mtr' || nodeName === 'mtext';
  }

  var canUseDOM = !!(typeof window !== 'undefined' &&
  // Nwjs doesn't add document as a global in their node context, but does have it on window.document,
  // As a workaround, check if document is undefined
  typeof document !== 'undefined' && window.document.createElement);

  var ExecutionEnvironment = {
  	canUseDOM: canUseDOM,
  	canUseWorkers: typeof Worker !== 'undefined',
  	canUseEventListeners: canUseDOM && !!window.addEventListener,
  	canUseViewport: canUseDOM && !!window.screen,
  	canUseSymbol: typeof Symbol === 'function' && typeof Symbol['for'] === 'function'
  };

  var isSVG = undefined;

  if (ExecutionEnvironment.canUseDOM) {
  	var _document = document;
  	var implementation = _document.implementation;

  	isSVG = implementation && implementation.hasFeature && implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
  }

  var isSVG$1 = isSVG;

  function isHook(hook) {
  	// DOM nodes
  	return hook === 'onCreated' || hook === 'onAttached' || hook === 'onWillDetach' || hook === 'onWillUpdate' || hook === 'onDidUpdate'
  	// Stateless components
  	 || hook === 'onComponentWillMount' || hook === 'onComponentDidMount' || hook === 'onComponentWillUnmount' || hook === 'onComponentShouldUpdate' || hook === 'onComponentWillUpdate' || hook === 'onComponentDidUpdate';
  }

  function inArray(arr, item) {
  	var len = arr.length;
  	var i = 0;

  	while (i < len) {
  		if (arr[i++] === item) {
  			return true;
  		}
  	}

  	return false;
  }

  var noop = (function () {})

  var HOOK = {};
  var reDash = /\-./g;

  /* eslint-disable quote-props */
  var unitlessProperties = {
  	'animation-iteration-count': true,
  	'box-flex': true,
  	'box-flex-group': true,
  	'column-count': true,
  	'counter-increment': true,
  	'fill-opacity': true,
  	'flex': true,
  	'flex-grow': true,
  	'flex-order': true,
  	'flex-positive': true,
  	'flex-shrink': true,
  	'float': true,
  	'font-weight': true,
  	'grid-column': true,
  	'line-height': true,
  	'line-clamp': true,
  	'opacity': true,
  	'order': true,
  	'orphans': true,
  	'stop-opacity': true,
  	'stroke-dashoffset': true,
  	'stroke-opacity': true,
  	'stroke-width': true,
  	'tab-size': true,
  	'transform': true,
  	'transform-origin': true,
  	'widows': true,
  	'z-index': true,
  	'zoom': true
  };

  /* eslint-enable quote-props */

  var directions = ['Top', 'Right', 'Bottom', 'Left'];
  var dirMap = function dirMap(prefix, postfix) {
  	return directions.map(function (dir) {
  		return (prefix || '') + dir + (postfix || '');
  	});
  };
  var shortCuts = {
  	// rely on cssText
  	font: [/*
          font-style
          font-variant
          font-weight
          font-size/line-height
          font-family|caption|icon|menu|message-box|small-caption|status-bar|initial|inherit;
          */],
  	padding: dirMap('padding'),
  	margin: dirMap('margin'),
  	'border-width': dirMap('border', 'Width'),
  	'border-style': dirMap('border', 'Style')
  };
  var cssToJSName = function cssToJSName(cssName) {
  	return cssName.replace(reDash, function (str) {
  		return str[1].toUpperCase();
  	});
  };

  // Don't execute this in nodejS
  if (ExecutionEnvironment.canUseDOM) {
  	(function () {
  		// get browser supported CSS properties
  		var documentElement = document.documentElement;
  		var computed = window.getComputedStyle(documentElement);
  		var props = Array.prototype.slice.call(computed, 0);
  		for (var key in documentElement.style) {
  			if (!computed[key]) {
  				props.push(key);
  			}
  		}
  		props.forEach(function (propName) {
  			var prefix = propName[0] === '-' ? propName.substr(1, propName.indexOf('-', 1) - 1) : null;
  			var stylePropName = cssToJSName(propName);

  			HOOK[stylePropName] = {
  				unPrefixed: prefix ? propName.substr(prefix.length + 2) : propName,
  				unitless: unitlessProperties[propName] ? true : false,
  				shorthand: null
  			};
  		});

  		var lenMap = {
  			1: function _(values, props, style) {
  				return props.forEach(function (prop) {
  					return style[prop] = values[0];
  				});
  			},
  			2: function _(values, props, style) {
  				return values.forEach(function (value, index) {
  					style[props[index]] = style[props[index + 2]] = value;
  				});
  			},
  			4: function _(values, props, style) {
  				return props.forEach(function (prop, index) {
  					style[prop] = values[index];
  				});
  			}
  		};

  		// normalize property shortcuts
  		Object.keys(shortCuts).forEach(function (propName) {
  			var stylePropName = cssToJSName(propName);

  			HOOK[stylePropName] = {
  				unPrefixed: propName,
  				unitless: false,
  				shorthand: function shorthand(value, style) {
  					var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);

  					if (type === 'number') {
  						value += 'px';
  					}
  					if (!value) {
  						return;
  					}
  					if ('cssText' in style) {
  						// normalize setting complex property across browsers
  						style.cssText += ';' + propName + ':' + value;
  					} else {
  						var values = value.split(' ');

  						(lenMap[values.length] || noop)(values, shortCuts[propName], style);
  					}
  				}
  			};
  		});
  	})();
  }

  /* eslint eqeqeq:0 */
  function isValidAttribute(strings) {
  	var i = 0;
  	var character = undefined;

  	while (i <= strings.length) {
  		character = strings[i];
  		if (!isNaN(character * 1)) {
  			return false;
  		} else {
  			if (character == character.toUpperCase()) {
  				return false;
  			}
  			if (character === character.toLowerCase()) {
  				return true;
  			}
  		}
  		i++;
  	}

  	return false;
  }

  /**
   *  DOM registry
   * */

  var PROPERTY = 0x1;
  var BOOLEAN = 0x2;
  var NUMERIC_VALUE = 0x4;
  var POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;

  var xlink = 'http://www.w3.org/1999/xlink';
  var xml = 'http://www.w3.org/XML/1998/namespace';

  var DOMAttributeNamespaces = {
  	// None-JSX compat
  	'xlink:actuate': xlink,
  	'xlink:arcrole': xlink,
  	'xlink:href': xlink,
  	'xlink:role': xlink,
  	'xlink:show': xlink,
  	'xlink:title': xlink,
  	'xlink:type': xlink,
  	'xml:base': xml,
  	'xml:lang': xml,
  	'xml:space': xml,
  	// JSX compat
  	xlinkActuate: xlink,
  	xlinkArcrole: xlink,
  	xlinkHref: xlink,
  	xlinkRole: xlink,
  	xlinkShow: xlink,
  	xlinkTitle: xlink,
  	xlinkType: xlink
  };

  var DOMAttributeNames = {
  	acceptCharset: 'accept-charset',
  	className: 'class',
  	htmlFor: 'for',
  	httpEquiv: 'http-equiv',

  	// SVG
  	clipPath: 'clip-path',
  	fillOpacity: 'fill-opacity',
  	fontFamily: 'font-family',
  	fontSize: 'font-size',
  	markerEnd: 'marker-end',
  	markerMid: 'marker-mid',
  	markerStart: 'marker-start',
  	stopColor: 'stop-color',
  	stopOpacity: 'stop-opacity',
  	strokeDasharray: 'stroke-dasharray',
  	strokeLinecap: 'stroke-linecap',
  	strokeOpacity: 'stroke-opacity',
  	strokeWidth: 'stroke-width',
  	textAnchor: 'text-anchor',
  	viewBox: 'viewBox', // Edge case. The letter 'b' need to be uppercase

  	// JSX compat
  	xlinkActuate: 'xlink:actuate',
  	xlinkArcrole: 'xlink:arcrole',
  	xlinkHref: 'xlink:href',
  	xlinkRole: 'xlink:role',
  	xlinkShow: 'xlink:show',
  	xlinkTitle: 'xlink:title',
  	xlinkType: 'xlink:type',
  	xmlBase: 'xml:base',
  	xmlLang: 'xml:lang',
  	xmlSpace: 'xml:space'
  };

  var DOMPropertyNames = {
  	autoComplete: 'autocomplete',
  	autoFocus: 'autofocus',
  	autoSave: 'autosave'
  };

  // This 'whitelist' contains edge cases such as attributes
  // that should be seen as a property or boolean property.
  // ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
  var Whitelist = {
  	allowFullScreen: BOOLEAN,
  	async: BOOLEAN,
  	autoFocus: BOOLEAN,
  	autoPlay: BOOLEAN,
  	capture: BOOLEAN,
  	checked: PROPERTY | BOOLEAN,
  	controls: BOOLEAN,
  	currentTime: PROPERTY | POSITIVE_NUMERIC_VALUE,
  	default: BOOLEAN,
  	defaultChecked: BOOLEAN,
  	defaultMuted: BOOLEAN,
  	defaultSelected: BOOLEAN,
  	defer: BOOLEAN,
  	disabled: PROPERTY | BOOLEAN,
  	download: BOOLEAN,
  	enabled: BOOLEAN,
  	formNoValidate: BOOLEAN,
  	hidden: PROPERTY | BOOLEAN, // 3.2.5 - Global attributes
  	loop: BOOLEAN,
  	// Caution; `option.selected` is not updated if `select.multiple` is
  	// disabled with `removeAttribute`.
  	multiple: PROPERTY | BOOLEAN,
  	muted: PROPERTY | BOOLEAN,
  	mediaGroup: PROPERTY,
  	noValidate: BOOLEAN,
  	noShade: PROPERTY | BOOLEAN,
  	noResize: BOOLEAN,
  	noWrap: BOOLEAN,
  	typeMustMatch: BOOLEAN,
  	open: BOOLEAN,
  	paused: PROPERTY,
  	playbackRate: PROPERTY | NUMERIC_VALUE,
  	readOnly: BOOLEAN,
  	required: PROPERTY | BOOLEAN,
  	reversed: BOOLEAN,
  	radioGroup: PROPERTY,
  	icon: PROPERTY,
  	draggable: BOOLEAN, // 3.2.5 - Global attributes
  	dropzone: null, // 3.2.5 - Global attributes
  	scoped: PROPERTY | BOOLEAN,
  	visible: BOOLEAN,
  	trueSpeed: BOOLEAN,
  	sandbox: null,
  	sortable: BOOLEAN,
  	inert: BOOLEAN,
  	indeterminate: BOOLEAN,
  	nohref: BOOLEAN,
  	compact: BOOLEAN,
  	declare: BOOLEAN,
  	ismap: PROPERTY | BOOLEAN,
  	pauseOnExit: PROPERTY | BOOLEAN,
  	seamless: BOOLEAN,
  	translate: BOOLEAN, // 3.2.5 - Global attributes
  	selected: PROPERTY | BOOLEAN,
  	srcLang: PROPERTY,
  	srcObject: PROPERTY,
  	value: PROPERTY,
  	volume: PROPERTY | POSITIVE_NUMERIC_VALUE,
  	itemScope: BOOLEAN, // 3.2.5 - Global attributes
  	className: null,
  	tabindex: PROPERTY | NUMERIC_VALUE,

  	/**
    * React compat for non-working JSX namespace support
    */

  	xlinkActuate: null,
  	xlinkArcrole: null,
  	xlinkHref: null,
  	xlinkRole: null,
  	xlinkShow: null,
  	xlinkTitle: null,
  	xlinkType: null,
  	xmlBase: null,
  	xmlLang: null,
  	xmlSpace: null,

  	/**
    * SVG
    */

  	clipPath: null,
  	fillOpacity: null,
  	fontFamily: null,
  	fontSize: null,
  	markerEnd: null,
  	markerMid: null,
  	markerStart: null,
  	stopColor: null,
  	stopOpacity: null,
  	strokeDasharray: null,
  	strokeLinecap: null,
  	strokeOpacity: null,
  	strokeWidth: null,
  	textAnchor: null,

  	/**
    * Numeric attributes
    */
  	cols: POSITIVE_NUMERIC_VALUE,
  	rows: NUMERIC_VALUE,
  	rowspan: NUMERIC_VALUE,
  	size: POSITIVE_NUMERIC_VALUE,
  	sizes: NUMERIC_VALUE,
  	start: NUMERIC_VALUE,

  	/**
    * Namespace attributes
    */
  	'xlink:actuate': null,
  	'xlink:arcrole': null,
  	'xlink:href': null,
  	'xlink:role': null,
  	'xlink:show': null,
  	'xlink:title': null,
  	'xlink:type': null,
  	'xml:base': null,
  	'xml:lang': null,
  	'xml:space': null,

  	/**
    * 3.2.5 - Global attributes
    */
  	id: null,
  	dir: null,
  	title: null,

  	/**
    * Properties that MUST be set as attributes, due to:
    *
    * - browser bug
    * - strange spec outlier
    *
    * Nothing bad with this. This properties get a performance boost
    * compared to custom attributes because they are skipping the
    * validation check.
    */

  	// Force 'autocorrect' and 'autoCapitalize' to be set as an attribute
  	// to fix issues with Mobile Safari on iOS devices
  	autocorrect: null,
  	// autoCapitalize and autoCorrect are supported in Mobile Safari for
  	// keyboard hints.
  	autoCapitalize: null,

  	// Some version of IE (like IE9) actually throw an exception
  	// if you set input.type = 'something-unknown'
  	type: null,

  	/**
    * Form
    */
  	form: null,
  	formAction: null,
  	formEncType: null,
  	formMethod: null,
  	formTarget: null,
  	frameBorder: null,

  	/**
    * Internet Explorer / Edge
    */

  	// IE-only attribute that controls focus behavior
  	unselectable: null,

  	/**
    * Firefox
    */

  	continuous: BOOLEAN,

  	/**
    * Others
    */
  	srcSet: null,
  	inlist: null,
  	minLength: null,
  	marginWidth: null,
  	marginHeight: null,
  	list: null,
  	keyType: null,
  	is: null,
  	inputMode: null,
  	height: null,
  	width: null,
  	dateTime: null,
  	contenteditable: null, // 3.2.5 - Global attributes
  	contextMenu: null,
  	classID: null,
  	cellPadding: null,
  	cellSpacing: null,
  	charSet: null,
  	allowTransparency: null,
  	spellcheck: null, // 3.2.5 - Global attributes
  	srcDoc: PROPERTY
  };

  var HTMLPropsContainer = {};

  function checkBitmask(value, bitmask) {
  	return bitmask !== null && (value & bitmask) === bitmask;
  }

  for (var propName in Whitelist) {

  	var propConfig = Whitelist[propName];

  	HTMLPropsContainer[propName] = {
  		attributeName: DOMAttributeNames[propName] || propName.toLowerCase(),
  		attributeNamespace: DOMAttributeNamespaces[propName] ? DOMAttributeNamespaces[propName] : null,
  		propertyName: DOMPropertyNames[propName] || propName,

  		mustUseProperty: checkBitmask(propConfig, PROPERTY),
  		hasBooleanValue: checkBitmask(propConfig, BOOLEAN),
  		hasNumericValue: checkBitmask(propConfig, NUMERIC_VALUE),
  		hasPositiveNumericValue: checkBitmask(propConfig, POSITIVE_NUMERIC_VALUE)
  	};
  }

  var template = {
  	/**
    * Sets the value for a property on a node. If a value is specified as
    * '' (empty string), the corresponding style property will be unset.
    *
    * @param {DOMElement} node
    * @param {string} name
    * @param {*} value
    */

  	setProperty: function setProperty(vNode, domNode, name, value, useProperties) {
  		var propertyInfo = HTMLPropsContainer[name] || null;

  		if (propertyInfo) {
  			if (isVoid(value) || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && value !== value || propertyInfo.hasPositiveNumericValue && value < 1 || value.length === 0) {
  				template.removeProperty(vNode, domNode, name, useProperties);
  			} else if (propertyInfo.mustUseProperty) {

  				var propName = propertyInfo.propertyName;

  				if (propName === 'value' && (!isVoid(vNode) && vNode.tag === 'select' || domNode.tagName === 'SELECT')) {
  					template.setSelectValueForProperty(vNode, domNode, value, useProperties);
  				} else if (useProperties) {

  					if ('' + domNode[propName] !== '' + value) {
  						domNode[propName] = value;
  					}
  				} else {
  					if (propertyInfo.hasBooleanValue && (value === true || value === 'true')) {
  						value = propName;
  					}
  					domNode.setAttribute(propName, value);
  				}
  			} else {

  				var attributeName = propertyInfo.attributeName;
  				var namespace = propertyInfo.attributeNamespace;

  				if (namespace) {
  					domNode.setAttributeNS(namespace, attributeName, '' + value);
  				} else {

  					// if 'truthy' value, and boolean, it will be 'propName=propName'
  					if (propertyInfo.hasBooleanValue && value === true) {
  						value = attributeName;
  					}
  					domNode.setAttribute(attributeName, '' + value);
  				}
  			}
  		} else {
  			if (isValidAttribute(name)) {
  				if (isVoid(value)) {
  					domNode.removeAttribute(name);
  				} else if (name) {
  					domNode.setAttribute(name, value);
  				}
  			}
  		}
  	},

  	/**
    * Sets the value for multiple styles on a node.	If a value is specified as
    * '' (empty string), the corresponding style property will be unset.
    *
    * @param {vNode} virtual node
    * @param {DOMElement} node
    * @param {object} styles
    */
  	setCSS: function setCSS(vNode, domNode, styles, useProperties) {
  		for (var styleName in styles) {
  			var styleValue = styles[styleName];

  			var style = domNode.style;

  			if (isVoid(styleValue) || typeof styleValue === 'boolean') {
  				// Todo! Should we check for typeof boolean?
  				style[styleName] = '';
  			} else {

  				// The 'hook' contains all browser supported CSS properties.
  				// No 'custom-css' are allowed or will work.
  				var hook = HOOK[styleName];

  				if (hook) {
  					if (hook.shorthand) {

  						hook.shorthand(styleValue, style);
  					} else {
  						if (!hook.unitless) {
  							if (typeof styleValue !== 'string') {
  								styleValue = styleValue + 'px';
  							}
  						}
  						style[hook.unPrefixed] = styleValue;
  					}
  				}
  			}
  		}
  	},

  	/**
    * Removes the value for a property on a node.
    *
    * @param {DOMElement} node
    * @param {string} name
    */
  	removeProperty: function removeProperty(vNode, domNode, name, useProperties) {
  		var propertyInfo = HTMLPropsContainer[name];

  		if (propertyInfo) {
  			if (propertyInfo.mustUseProperty) {
  				var propName = propertyInfo.propertyName;
  				// Make sure we remove select / select multiiple properly
  				if (name === 'value' && (vNode !== null && vNode.tag === 'select' || domNode.tagName === 'SELECT')) {
  					template.removeSelectValueForProperty(vNode, domNode);
  				} else {
  					if (useProperties) {
  						if (propertyInfo.hasBooleanValue) {
  							domNode[propName] = false;
  						} else if ('' + domNode[propName] !== '') {
  							domNode[propName] = '';
  						}
  					} else {
  						domNode.removeAttribute(propName);
  					}
  				}
  			} else {
  				domNode.removeAttribute(propertyInfo.attributeName);
  			}
  		} else {
  			// HTML attributes and custom attributes
  			domNode.removeAttribute(name);
  		}
  	},

  	/**
    * Set the value for a select / select multiple on a node.
    *
    * @param {DOMElement} node
    * @param {string} name
    */
  	setSelectValueForProperty: function setSelectValueForProperty(vNode, domNode, value, useProperties) {
  		var isMultiple = isArray(value);
  		var options = domNode.options;
  		var len = options.length;

  		value = typeof value === 'number' ? '' + value : value;

  		var i = 0,
  		    optionNode = undefined;

  		while (i < len) {
  			optionNode = options[i++];
  			if (useProperties) {
  				optionNode.selected = !isVoid(value) && (isMultiple ? inArray(value, optionNode.value) : optionNode.value === value);
  			} else {
  				if (!isVoid(value) && (isMultiple ? inArray(value, optionNode.value) : optionNode.value === value)) {
  					optionNode.setAttribute('selected', 'selected');
  				} else {
  					optionNode.removeAttribute('selected');
  				}
  			}
  		}
  	},
  	removeSelectValueForProperty: function removeSelectValueForProperty(vNode, domNode /* , propName */) {
  		var options = domNode.options;
  		var len = options.length;

  		var i = 0;

  		while (i < len) {
  			options[i++].selected = false;
  		}
  	}
  };

  var standardNativeEventMapping = {
  	onBlur: 'blur',
  	onChange: 'change',
  	onClick: 'click',
  	onCompositionEnd: 'compositionend',
  	onCompositionStart: 'compositionstart',
  	onCompositionUpdate: 'compositionupdate',
  	onContextMenu: 'contextmenu',
  	onCopy: 'copy',
  	onCut: 'cut',
  	onDoubleClick: 'dblclick',
  	onDrag: 'drag',
  	onDragEnd: 'dragend',
  	onDragEnter: 'dragenter',
  	onDragExit: 'dragexit',
  	onDragLeave: 'dragleave',
  	onDragOver: 'dragover',
  	onDragStart: 'dragstart',
  	onDrop: 'drop',
  	onFocus: 'focus',
  	onFocusIn: 'focusin',
  	onFocusOut: 'focusout',
  	onInput: 'input',
  	onKeyDown: 'keydown',
  	onKeyPress: 'keypress',
  	onKeyUp: 'keyup',
  	onMouseDown: 'mousedown',
  	onMouseMove: 'mousemove',
  	onMouseOut: 'mouseout',
  	onMouseOver: 'mouseover',
  	onMouseUp: 'mouseup',
  	onMouseWheel: 'mousewheel',
  	onPaste: 'paste',
  	onReset: 'reset',
  	onSelect: 'select',
  	onSelectionChange: 'selectionchange',
  	onSelectStart: 'selectstart',
  	onShow: 'show',
  	onSubmit: 'submit',
  	onTextInput: 'textInput',
  	onTouchCancel: 'touchcancel',
  	onTouchEnd: 'touchend',
  	onTouchMove: 'touchmove',
  	onTouchStart: 'touchstart',
  	onWheel: 'wheel'
  };

  var nonBubbleableEventMapping = {
  	onAbort: 'abort',
  	onBeforeUnload: 'beforeunload',
  	onCanPlay: 'canplay',
  	onCanPlayThrough: 'canplaythrough',
  	onDurationChange: 'durationchange',
  	onEmptied: 'emptied',
  	onEnded: 'ended',
  	onError: 'error',
  	onInput: 'input',
  	onInvalid: 'invalid',
  	onLoad: 'load',
  	onLoadedData: 'loadeddata',
  	onLoadedMetadata: 'loadedmetadata',
  	onLoadStart: 'loadstart',
  	onMouseEnter: 'mouseenter',
  	onMouseLeave: 'mouseleave',
  	onOrientationChange: 'orientationchange',
  	onPause: 'pause',
  	onPlay: 'play',
  	onPlaying: 'playing',
  	onProgress: 'progress',
  	onRateChange: 'ratechange',
  	onResize: 'resize',
  	onScroll: 'scroll',
  	onSeeked: 'seeked',
  	onSeeking: 'seeking',
  	onSelect: 'select',
  	onStalled: 'stalled',
  	onSuspend: 'suspend',
  	onTimeUpdate: 'timeupdate',
  	onUnload: 'unload',
  	onVolumeChange: 'volumechange',
  	onWaiting: 'waiting'
  };

  var propertyToEventType = {};

  [standardNativeEventMapping, nonBubbleableEventMapping].forEach(function (mapping) {
  	Object.keys(mapping).reduce(function (state, property) {
  		state[property] = mapping[property];
  		return state;
  	}, propertyToEventType);
  });

  var INFERNO_PROP = '__Inferno__id__';
  var counter = 1;

  function infernoNodeID(node, get) {
  	return node[INFERNO_PROP] || (get ? 0 : node[INFERNO_PROP] = counter++);
  }

  /**
   * Internal store for event listeners
   * DOMNodeId -> type -> listener
   */
  var listenersStorage = {};

  var eventHooks = {};

  /**
   * Creates a wrapped handler that hooks into the Inferno
   * eventHooks system based on the type of event being
   * attached.
   *
   * @param {string} type
   * @param {Function} handler
   * @return {Function} wrapped handler
   */
  function setHandler(type, handler) {
    var hook = eventHooks[type];

    if (hook) {
      var hooked = hook(handler);

      hooked.originalHandler = handler;
      return hooked;
    }

    return { handler: handler, originalHandler: handler };
  }

  var focusEvents = {
  	focus: 'focusin', // DOM L3
  	blur: 'focusout' // DOM L3
  };

  var standardNativeEvents = Object.keys(standardNativeEventMapping).map(function (key) {
  	return standardNativeEventMapping[key];
  });

  var nonBubbleableEvents = Object.keys(nonBubbleableEventMapping).map(function (key) {
  	return nonBubbleableEventMapping[key];
  });

  var EventRegistry = {};

  function getFocusBlur(nativeFocus) {
  	if (typeof getFocusBlur.fn === 'undefined') {
  		getFocusBlur.fn = nativeFocus ? function () {
  			var _type = this._type;
  			var handler = setHandler(_type, function (e) {
  				addRootListener(e, _type);
  			}).handler;

  			document.addEventListener(focusEvents[_type], handler);
  		} : function () {
  			var _type = this._type;

  			document.addEventListener(_type, setHandler(_type, addRootListener).handler, true);
  		};
  	}
  	return getFocusBlur.fn;
  }

  if (ExecutionEnvironment.canUseDOM) {
  	var i = 0;
  	var type = undefined;
  	var nativeFocus = 'onfocusin' in document.documentElement;

  	for (; i < standardNativeEvents.length; i++) {
  		type = standardNativeEvents[i];
  		EventRegistry[type] = {
  			_type: type,
  			_bubbles: true,
  			_counter: 0,
  			_enabled: false
  		};
  		// 'focus' and 'blur'
  		if (focusEvents[type]) {
  			// IE has `focusin` and `focusout` events which bubble.
  			// @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
  			EventRegistry[type]._focusBlur = getFocusBlur(nativeFocus);
  		}
  	}
  	// For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
  	for (i = 0; i < nonBubbleableEvents.length; i++) {
  		type = nonBubbleableEvents[i];
  		EventRegistry[type] = {
  			_type: type,
  			_bubbles: false,
  			_enabled: false
  		};
  	}
  }

  /* eslint no-invalid-this:0 */

  function stopPropagation() {
  	this._isPropagationStopped = true;
  	if (this._stopPropagation) {
  		this._stopPropagation();
  	} else {
  		this.cancelBubble = true;
  	}
  }

  function isPropagationStopped() {
  	return this._isPropagationStopped;
  }

  function stopImmediatePropagation() {
  	this._isImmediatePropagationStopped = true;
  	this._isPropagationStopped = true;
  	if (this._stopImmediatePropagation) {
  		this._stopImmediatePropagation();
  	} else {
  		this.cancelBubble = true;
  	}
  }

  function isImmediatePropagationStopped() {
  	return this._isImmediatePropagationStopped;
  }

  function preventDefault() {
  	this._isDefaultPrevented = true;

  	if (this._preventDefault) {
  		this._preventDefault();
  	} else {
  		this.returnValue = false;
  	}
  }

  function isDefaultPrevented() {
  	return this._isDefaultPrevented;
  }

  function eventInterface(nativeEvent) {

  	// Extend nativeEvent
  	nativeEvent._stopPropagation = nativeEvent.stopPropagation;
  	nativeEvent.stopPropagation = stopPropagation;
  	nativeEvent.isPropagationStopped = isPropagationStopped;

  	nativeEvent._stopImmediatePropagation = nativeEvent.stopImmediatePropagation;
  	nativeEvent.stopImmediatePropagation = stopImmediatePropagation;
  	nativeEvent.isImmediatePropagationStopped = isImmediatePropagationStopped;

  	nativeEvent._preventDefault = nativeEvent.preventDefault;
  	nativeEvent.preventDefault = preventDefault;
  	nativeEvent.isDefaultPrevented = isDefaultPrevented;

  	return nativeEvent;
  }

  function isFormElement(nodeName) {
  	return nodeName === 'form' || nodeName === 'input' || nodeName === 'textarea' || nodeName === 'label' || nodeName === 'fieldset' || nodeName === 'legend' || nodeName === 'select' || nodeName === 'optgroup' || nodeName === 'option' || nodeName === 'button' || nodeName === 'datalist' || nodeName === 'keygen' || nodeName === 'output';
  }

  function getFormElementType(node) {
  	var name = node.nodeName.toLowerCase();

  	if (name !== 'input') {
  		if (name === 'select' && node.multiple) {
  			return 'select-multiple';
  		}
  		return name;
  	}

  	var type = node.getAttribute('type');

  	if (!type) {
  		return 'text';
  	}

  	return type.toLowerCase();
  }

  function selectValues(node) {

  	var result = [];
  	var index = node.selectedIndex;
  	var options = node.options;
  	var length = options.length;
  	var option = undefined;
  	var i = index < 0 ? length : 0;

  	for (; i < length; i++) {

  		option = options[i];

  		var selected = option.selected || option.getAttribute('selected');

  		// IMPORTANT! IE9 doesn't update selected after form reset
  		if ((option.selected || i === index) &&
  		// Don't return options that are disabled or in a disabled optgroup
  		!option.disabled && (!option.parentNode.disabled || option.parentNode.nodeName !== 'OPTGROUP')) {
  			result.push(option.value);
  		}
  	}
  	if (result.length < 2) {
  		return result[0];
  	}
  	return result;
  }

  function getFormElementValues(node) {

  	if (isVoid(node)) {
  		return null;
  	}

  	var name = getFormElementType(node);

  	switch (name) {
  		case 'checkbox':
  		case 'radio':
  			var checked = node.getAttribute('checked') || node.checked;

  			if (!isVoid(checked)) {
  				return checked !== false && checked !== 'false';
  			}
  			return false;
  		case 'select-multiple':
  			return selectValues(node);
  		default:
  			return node.value;
  	}
  }

  // type -> node -> function(target, event)
  var setupHooks = {};

  function createListenerArguments(target, event) {
  	var type = event.type;
  	var nodeName = target.nodeName.toLowerCase();

  	var tagHooks = undefined;

  	if (tagHooks = setupHooks[type]) {
  		var hook = tagHooks[nodeName];

  		if (hook) {
  			return hook(target, event);
  		}
  	}
  	// Default behavior:
  	// Form elements with a value attribute will have the arguments:
  	// [event, value]
  	if (isFormElement(nodeName)) {
  		return [event, getFormElementValues(target)];
  	}
  	// Fallback to just event
  	return [event];
  }

  function addRootListener(e, type) {

  	if (!type) {
  		type = e.type;
  	}

  	var registry = EventRegistry[type];

  	// Support: Safari 6-8+
  	// Target should not be a text node
  	if (e.target.nodeType === 3) {
  		e.target = e.target.parentNode;
  	}

  	var target = e.target,
  	    listenersCount = registry._counter,
  	    listeners = undefined,
  	    listener = undefined,
  	    nodeID = undefined,
  	    event = undefined,
  	    args = undefined,
  	    defaultArgs = undefined;

  	if (listenersCount > 0) {
  		event = eventInterface(e, type);
  		defaultArgs = args = [event];
  	}
  	// NOTE: Only the event blubbling phase is modeled. This is done because
  	// handlers specified on props can not specify they are handled on the
  	// capture phase.
  	while (target !== null && listenersCount > 0 && target !== document.parentNode) {
  		if (nodeID = infernoNodeID(target, true)) {
  			listeners = listenersStorage[nodeID];
  			if (listeners && listeners[type]) {

  				listener = listeners[type];

  				// lazily instantiate additional arguments in the case
  				// where an event handler takes more than one argument
  				// listener is a function, and length is the number of
  				// arguments that function takes
  				var numArgs = listener.originalHandler.length;

  				args = defaultArgs;
  				if (numArgs > 1) {
  					args = createListenerArguments(target, event);
  				}

  				// 'this' on an eventListener is the element handling the event
  				// event.currentTarget is unwriteable, and since these are
  				// native events, will always refer to the document. Therefore
  				// 'this' is the only supported way of referring to the element
  				// whose listener is handling the current event
  				listener.handler.apply(target, args);

  				// Check if progagation stopped. There is only one listener per
  				// type, so we do not need to check immediate propagation.
  				if (event.isPropagationStopped()) {
  					break;
  				}

  				--listenersCount;
  			}
  		}
  		target = target.parentNode;
  	}
  }

  function createEventListener(type) {
  	return function (e) {
  		var target = e.target;
  		var listener = listenersStorage[infernoNodeID(target)][type];
  		var args = listener.originalHandler.length > 1 ? createListenerArguments(target, e) : [e];

  		listener.originalHandler.apply(target, args);
  	};
  }

  function addListener(vNode, domNode, type, listener) {
  	if (!domNode) {
  		return null; // TODO! Should we throw?
  	}
  	var registry = EventRegistry[type];

  	// only add listeners for registered events
  	if (registry) {
  		if (!registry._enabled) {
  			// handle focus / blur events
  			if (registry._focusBlur) {
  				registry._focusBlur();
  			} else if (registry._bubbles) {
  				var handler = setHandler(type, addRootListener).handler;

  				document.addEventListener(type, handler, false);
  			}
  			registry._enabled = true;
  		}
  		var nodeID = infernoNodeID(domNode);
  		var listeners = undefined;

  		if (listenersStorage[nodeID]) {
  			listeners = listenersStorage[nodeID];
  		} else {
  			listenersStorage[nodeID] = {};
  			listeners = listenersStorage[nodeID];
  		}

  		if (listeners[type]) {
  			if (listeners[type].destroy) {
  				listeners[type].destroy();
  			}
  		}
  		if (registry._bubbles) {
  			if (!listeners[type]) {
  				++registry._counter;
  			}
  			listeners[type] = {
  				handler: listener,
  				originalHandler: listener
  			};
  		} else {
  			listeners[type] = setHandler(type, createEventListener(type));
  			listeners[type].originalHandler = listener;
  			domNode.addEventListener(type, listeners[type].handler, false);
  		}
  	} else {
  		throw Error('Inferno Error: ' + type + ' has not been registered, and therefor not supported.');
  	}
  }

  var eventListener = {};

  // import focusEvents from '../../shared/focusEvents';

  /**
   * Remove event listeners from a node
   */
  function removeListener(node, type) {

  	if (!node) {
  		return null; // TODO! Should we throw?
  	}

  	var nodeID = infernoNodeID(node, true);

  	if (nodeID) {
  		var listeners = listenersStorage[nodeID];

  		if (listeners && listeners[type]) {
  			if (listeners[type] && listeners[type].destroy) {
  				listeners[type].destroy();
  			}
  			listeners[type] = null;

  			var registry = EventRegistry[type];

  			if (registry) {
  				if (registry._bubbles) {
  					--registry._counter;
  					// TODO Run tests and check if this works, or code should be removed
  					//				} else if (registry._focusBlur) {
  					//					node.removeEventListener(type, eventListener[focusEvents[type]]);
  				} else {
  						node.removeEventListener(type, eventListener[type]);
  					}
  			}
  		}
  	}
  }

  /**
   * Set HTML attributes on the template
   * @param{ HTMLElement } node
   * @param{ Object } attrs
   */
  function addDOMStaticAttributes(vNode, domNode, attrs) {
  	var styleUpdates = undefined;

  	for (var attrName in attrs) {
  		var attrVal = attrs[attrName];

  		if (attrVal) {
  			if (!isHook(attrName)) {
  				if (attrName === 'style') {
  					styleUpdates = attrVal;
  				} else {
  					template.setProperty(vNode, domNode, attrName, attrVal, false);
  				}
  			}
  		}
  	}
  	if (styleUpdates) {
  		template.setCSS(vNode, domNode, styleUpdates, false);
  	}
  }

  // A fast className setter as its the most common property to regularly change
  function fastPropSet(attrName, attrVal, domNode) {
  	if (attrName === 'class' || attrName === 'className') {
  		if (!isVoid(attrVal)) {
  			if (isSVG$1) {
  				domNode.setAttribute('class', attrVal);
  			} else {
  				domNode.className = attrVal;
  			}
  		}
  		return true;
  	} else if (attrName === 'ref') {

  		if ("development" === 'development') {
  			if (isVoid(attrVal)) {
  				throw 'Inferno Error: Inferno.createRef() can not be null or undefined';
  			}
  		}

  		if (typeof attrVal.element === 'undefined') {
  			throw Error('Inferno Error: Invalid ref object passed, expected InfernoDOM.createRef() object.');
  		}
  		attrVal.element = domNode;
  		return true;
  	}
  	return false;
  }

  function handleHooks(item, props, domNode, hookEvent, isComponent, nextProps) {

  	var eventOrIndex = props[hookEvent];

  	if (eventOrIndex !== undefined) {
  		var hookCallback = typeof eventOrIndex === 'number' ? getValueWithIndex(item, eventOrIndex) : eventOrIndex;
  		if (hookCallback && typeof hookCallback === 'function') {
  			if (isComponent) {
  				return hookCallback(domNode, props, nextProps);
  			} else {
  				hookCallback(domNode);
  			}
  		}
  	}
  }

  function addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, hookEvent) {
  	var styleUpdates = undefined;

  	if (dynamicAttrs.index !== undefined) {
  		dynamicAttrs = getValueWithIndex(item, dynamicAttrs.index);
  		addDOMStaticAttributes(item, domNode, dynamicAttrs);
  		return;
  	}
  	for (var attrName in dynamicAttrs) {
  		if (!isVoid(attrName)) {
  			if (hookEvent && isHook(attrName)) {
  				handleHooks(item, dynamicAttrs, domNode, hookEvent);
  			} else {
  				var attrVal = getValueWithIndex(item, dynamicAttrs[attrName]);

  				if (attrVal !== undefined) {
  					if (attrName === 'style') {
  						styleUpdates = attrVal;
  					} else {
  						if (fastPropSet(attrName, attrVal, domNode) === false) {
  							if (propertyToEventType[attrName]) {
  								addListener(item, domNode, propertyToEventType[attrName], attrVal);
  							} else {
  								template.setProperty(null, domNode, attrName, attrVal, true);
  							}
  						}
  					}
  				}
  			}
  		}
  	}
  	if (styleUpdates) {
  		template.setCSS(item, domNode, styleUpdates, true);
  	}
  }

  function clearListeners(item, domNode, dynamicAttrs) {
  	for (var attrName in dynamicAttrs) {
  		if (!isHook(attrName)) {
  			var attrVal = getValueWithIndex(item, dynamicAttrs[attrName]);

  			if (attrVal !== undefined && propertyToEventType[attrName]) {
  				removeListener(item, domNode, propertyToEventType[attrName], attrVal);
  			}
  		}
  	}
  }

  /**
   * NOTE!! This function is probably the single most
   * critical path for performance optimization.
   */
  function updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs) {

  	if (dynamicAttrs.index !== undefined) {
  		var nextDynamicAttrs = getValueWithIndex(nextItem, dynamicAttrs.index);

  		if (isVoid(nextDynamicAttrs)) {
  			var lastDynamicAttrs = getValueWithIndex(lastItem, dynamicAttrs.index);

  			if (lastDynamicAttrs) {
  				for (var attrName in lastDynamicAttrs) {
  					if (!isHook(attrName)) {
  						template.removeProperty(null, domNode, attrName, true);
  					}
  				}
  			}
  		} else {
  			addDOMStaticAttributes(nextItem, domNode, nextDynamicAttrs);
  		}
  		return;
  	}

  	/**
    * TODO: Benchmark areas that can be improved with caching.
    */
  	var styleUpdates = {};
  	var styleName = undefined;

  	for (var attrName in dynamicAttrs) {

  		if (!isHook(attrName)) {

  			var lastAttrVal = getValueWithIndex(lastItem, dynamicAttrs[attrName]);
  			var nextAttrVal = getValueWithIndex(nextItem, dynamicAttrs[attrName]);

  			if (!isVoid(lastAttrVal)) {
  				if (isVoid(nextAttrVal)) {
  					if (attrName === 'style') {
  						for (styleName in lastAttrVal) {
  							if (!nextAttrVal || !nextAttrVal[styleName]) {
  								styleUpdates[styleName] = '';
  							}
  						}
  					} else if (propertyToEventType[attrName]) {
  						removeListener(nextItem, domNode, propertyToEventType[attrName], nextAttrVal);
  					} else {
  						template.removeProperty(null, domNode, attrName, true);
  					}
  				} else if (attrName === 'style') {

  					// Unset styles on `lastAttrVal` but not on `nextAttrVal`.
  					for (styleName in lastAttrVal) {
  						if (lastAttrVal[styleName] && (!nextAttrVal || !nextAttrVal[styleName])) {
  							styleUpdates[styleName] = '';
  						}
  					}
  					// Update styles that changed since `lastAttrVal`.
  					for (styleName in nextAttrVal) {
  						if (!nextAttrVal[styleName] || lastAttrVal[styleName] !== nextAttrVal[styleName]) {
  							styleUpdates[styleName] = nextAttrVal[styleName];
  						}
  					}
  				} else if (lastAttrVal !== nextAttrVal) {

  					if (fastPropSet(attrName, nextAttrVal, domNode) === false) {
  						if (propertyToEventType[attrName]) {
  							addListener(nextItem, domNode, propertyToEventType[attrName], nextAttrVal);
  						} else {
  							template.setProperty(null, domNode, attrName, nextAttrVal, true);
  						}
  					}
  				}
  			} else if (!isVoid(nextAttrVal)) {
  				if (attrName === 'style') {
  					styleUpdates = nextAttrVal;
  				} else if (fastPropSet(attrName, nextAttrVal, domNode) === false) {
  					if (propertyToEventType[attrName]) {
  						addListener(nextItem, domNode, propertyToEventType[attrName], nextAttrVal);
  					} else {
  						template.setProperty(null, domNode, attrName, nextAttrVal, true);
  					}
  				}
  			}
  		}
  	}

  	if (styleUpdates) {
  		template.setCSS(domNode, domNode, styleUpdates, true);
  	}
  }

  function recreateRootNode(lastItem, nextItem, node, treeLifecycle, context) {
  	var lastDomNode = lastItem.rootNode;
  	var lastTree = lastItem.tree.dom;

  	lastTree.remove(lastItem, treeLifecycle);

  	var domNode = node.create(nextItem, treeLifecycle, context);
  	var parentNode = lastDomNode.parentNode;

  	if (parentNode) {
  		parentNode.replaceChild(domNode, lastDomNode);
  	}
  	nextItem.rootNode = domNode;
  	return domNode;
  }

  function recreateRootNodeFromHydration(hydrateNode, nextItem, node, treeLifecycle, context) {
  	var lastDomNode = hydrateNode;

  	var domNode = node.create(nextItem, treeLifecycle, context);
  	var parentNode = lastDomNode.parentNode;

  	if (parentNode) {
  		parentNode.replaceChild(domNode, lastDomNode);
  	}
  	nextItem.rootNode = domNode;
  	return domNode;
  }

  function addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle) {
  	addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
  	if (dynamicAttrs.onAttached) {
  		treeLifecycle.addTreeSuccessListener(function () {
  			handleHooks(item, dynamicAttrs, domNode, 'onAttached');
  		});
  	}
  }

  function createRootNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs, recyclingEnabled) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item, treeLifecycle) {
  			var domNode = undefined;

  			if (recyclingEnabled) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if ("development" !== 'production') {
  					if (!isStringOrNumber(value)) {
  						throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  					}
  				}
  				if (value === '') {
  					domNode.appendChild(document.createTextNode(''));
  				} else {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.tree.dom) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  			} else {
  				var domNode = lastItem.rootNode;

  				nextItem.id = lastItem.id;
  				nextItem.rootNode = domNode;
  				var nextValue = getValueWithIndex(nextItem, valueIndex);
  				var lastValue = getValueWithIndex(lastItem, valueIndex);

  				if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  				}
  				if (nextValue !== lastValue) {
  					if (isVoid(nextValue)) {
  						if (isVoid(lastValue)) {
  							domNode.firstChild.nodeValue = '';
  						} else {
  							domNode.textContent = '';
  						}
  					} else {
  						if ("development" !== 'production') {
  							if (!isStringOrNumber(nextValue)) {
  								throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  							}
  						}

  						if (isVoid(lastValue)) {
  							domNode.textContent = nextValue;
  						} else {
  							domNode.firstChild.nodeValue = nextValue;
  						}
  					}
  				}
  				if (dynamicAttrs) {
  					updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  					if (dynamicAttrs.onDidUpdate) {
  						handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  					}
  				}
  			}
  		},
  		remove: function remove(item) {
  			if (dynamicAttrs) {
  				var domNode = item.rootNode;

  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  				clearListeners(item, domNode, dynamicAttrs);
  			}
  		}
  	};

  	return node;
  }

  var errorMsg$1 = 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.';

  function createNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
  	var domNodeMap = {};
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle) {
  			var domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if ("development" !== 'production') {
  					if (!isStringOrNumber(value)) {
  						throw Error(errorMsg$1);
  					}
  				}
  				if (value === '') {
  					domNode.appendChild(document.createTextNode(''));
  				} else {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			domNodeMap[item.id] = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			var domNode = domNodeMap[lastItem.id];
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
  				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  			}
  			if (nextValue !== lastValue) {
  				if (isVoid(nextValue)) {
  					if (isVoid(lastValue)) {
  						domNode.firstChild.nodeValue = '';
  					} else {
  						domNode.textContent = '';
  					}
  				} else {
  					if ("development" !== 'production') {
  						if (!isStringOrNumber(nextValue)) {
  							throw Error(errorMsg$1);
  						}
  					}
  					if (isVoid(lastValue)) {
  						domNode.textContent = nextValue;
  					} else {
  						domNode.firstChild.nodeValue = nextValue;
  					}
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item) {
  			if (dynamicAttrs) {
  				var domNode = domNodeMap[item.id];

  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  				clearListeners(item, domNode, dynamicAttrs);
  			}
  		}
  	};

  	return node;
  }

  function createRootNodeWithStaticChild(templateNode, dynamicAttrs, recyclingEnabled) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item, treeLifecycle) {
  			var domNode = undefined;

  			if (recyclingEnabled) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(true);
  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.tree.dom) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			nextItem.id = lastItem.id;
  			if (dynamicAttrs) {
  				if (dynamicAttrs.onWillUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  				}
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item) {
  			if (dynamicAttrs) {
  				var domNode = item.rootNode;

  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  				clearListeners(item, domNode, dynamicAttrs);
  			}
  		}
  	};

  	return node;
  }

  function createNodeWithStaticChild(templateNode, dynamicAttrs) {
  	var domNodeMap = {};
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle) {
  			var domNode = templateNode.cloneNode(true);

  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			domNodeMap[item.id] = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			var domNode = domNodeMap[lastItem.id];

  			if (dynamicAttrs) {
  				if (dynamicAttrs.onWillUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  				}
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item) {
  			if (dynamicAttrs) {
  				var domNode = domNodeMap[item.id];

  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  				clearListeners(item, domNode, dynamicAttrs);
  			}
  		}
  	};

  	return node;
  }

  function updateAndAppendDynamicChildren(domNode, nextValue) {

  	for (var i = 0; i < nextValue.length; i++) {
  		if (isStringOrNumber(nextValue[i])) {
  			domNode.appendChild(document.createTextNode(nextValue[i]));
  		} else {
  			// Do nothing for now
  		}
  	}
  }

  function appendText(domNode, value) {
  	var firstChild = domNode.firstChild;
  	if (firstChild) {
  		firstChild.nodeValue = value;
  	} else {
  		domNode.textContent = value;
  	}
  }

  function removeChild(domNode) {
  	var firstChild = domNode.firstChild;
  	if (firstChild) {
  		domNode.removeChild(firstChild);
  	}
  }

  function replaceChild(domNode, childNode) {
  	var replaceNode = domNode.firstChild;

  	if (replaceNode) {
  		domNode.replaceChild(childNode, domNode.firstChild);
  	} else {
  		domNode.appendChild(childNode);
  	}
  }

  function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, recyclingEnabled) {
  	var keyedChildren = true;
  	var childNodeList = [];
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var domNode = undefined;

  			if (recyclingEnabled) {
  				domNode = recycle(node, item, treeLifecycle, context);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);

  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (isArray(value)) {
  					for (var i = 0; i < value.length; i++) {
  						var childItem = value[i];
  						// catches edge case where we e.g. have [null, null, null] as a starting point
  						if (!isVoid(childItem) && (typeof childItem === 'undefined' ? 'undefined' : babelHelpers.typeof(childItem)) === 'object') {
  							var tree = childItem && childItem.tree;

  							if (tree) {
  								var childNode = childItem.tree.dom.create(childItem, treeLifecycle, context);

  								if (childItem.key === undefined) {
  									keyedChildren = false;
  								}
  								childNodeList.push(childNode);
  								domNode.appendChild(childNode);
  							}
  						} else if (isStringOrNumber(childItem)) {
  							var textNode = document.createTextNode(childItem);

  							domNode.appendChild(textNode);
  							childNodeList.push(textNode);
  							keyedChildren = false;
  						}
  					}
  				} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
  					var tree = value && value.tree;

  					if (tree) {
  						domNode.appendChild(value.tree.dom.create(value, treeLifecycle, context));
  					} else if (value.create) {
  						domNode.appendChild(value.create(value, treeLifecycle, context));
  					}
  				} else if (isStringOrNumber(value)) {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			if (node !== lastItem.tree.dom) {
  				childNodeList = [];
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			nextItem.id = lastItem.id;
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
  				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  			}
  			if (nextValue && isVoid(lastValue)) {
  				if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
  					if (isArray(nextValue)) {
  						updateAndAppendDynamicChildren(domNode, nextValue);
  					} else {
  						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  					}
  				} else {
  					domNode.appendChild(document.createTextNode(nextValue));
  				}
  			} else if (lastValue && isVoid(nextValue)) {
  				if (isArray(lastValue)) {
  					for (var i = 0; i < lastValue.length; i++) {
  						if (!isVoid(domNode.childNodes[i])) {
  							domNode.removeChild(domNode.childNodes[i]);
  						} else {
  							removeChild(domNode);
  						}
  					}
  				} else {
  					removeChild(domNode);
  				}
  			} else if (nextValue !== lastValue) {
  				if (isStringOrNumber(nextValue)) {
  					appendText(domNode, nextValue);
  				} else if (isVoid(nextValue)) {
  					if (domNode !== null) {
  						replaceChild(domNode, document.createTextNode(''));
  					}
  					// if we update from undefined, we will have an array with zero length.
  					// If we check if it's an array, it will throw 'x' is undefined.
  				} else if (isArray(nextValue)) {
  						if (isArray(lastValue)) {
  							if (keyedChildren) {
  								updateKeyed(nextValue, lastValue, domNode, null, treeLifecycle, context);
  							} else {
  								updateNonKeyed(nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context);
  							}
  						} else {
  							updateNonKeyed(nextValue, [], childNodeList, domNode, null, treeLifecycle, context);
  						}
  					} else if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
  						var tree = nextValue && nextValue.tree;
  						if (!isVoid(tree)) {
  							if (!isVoid(lastValue)) {
  								var oldTree = lastValue && lastValue.tree;

  								if (!isVoid(oldTree)) {
  									tree.dom.update(lastValue, nextValue, treeLifecycle, context);
  								} else {
  									recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  								}
  							} else {
  								replaceChild(domNode, tree.dom.create(nextValue, treeLifecycle, context));
  							}
  						} else if (nextValue.create) {
  							// TODO
  						} else {
  								removeChild(domNode);
  							}
  					}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			removeValueTree(getValueWithIndex(item, valueIndex), treeLifecycle);
  			if (dynamicAttrs) {
  				var domNode = item.rootNode;

  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  				clearListeners(item, domNode, dynamicAttrs);
  			}
  		}
  	};

  	return node;
  }

  function recreateNode(lastDomNode, nextItem, node, treeLifecycle, context) {
  	var domNode = node.create(nextItem, treeLifecycle, context);

  	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
  	// TODO recycle old node
  }

  function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs) {
  	var keyedChildren = true;
  	var domNodeMap = {};
  	var childNodeList = [];
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (isArray(value)) {
  					for (var i = 0; i < value.length; i++) {
  						var childItem = value[i];
  						// catches edge case where we e.g. have [null, null, null] as a starting point
  						if (!isVoid(childItem) && (typeof childItem === 'undefined' ? 'undefined' : babelHelpers.typeof(childItem)) === 'object') {

  							var tree = childItem && childItem.tree;

  							if (tree) {
  								var childNode = childItem.tree.dom.create(childItem, treeLifecycle, context);

  								if (childItem.key === undefined) {
  									keyedChildren = false;
  								}
  								childNodeList.push(childNode);
  								domNode.appendChild(childNode);
  							}
  						} else if (isStringOrNumber(childItem)) {
  							var textNode = document.createTextNode(childItem);

  							domNode.appendChild(textNode);
  							childNodeList.push(textNode);
  							keyedChildren = false;
  						}
  					}
  				} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
  					var tree = value && value.tree;

  					if (tree) {
  						domNode.appendChild(value.tree.dom.create(value, treeLifecycle, context));
  					} else if (value.create) {
  						domNode.appendChild(value.create(value, treeLifecycle, context));
  					}
  				} else if (isStringOrNumber(value)) {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			domNodeMap[item.id] = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var domNode = domNodeMap[lastItem.id];
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
  				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  			}
  			if (nextValue && isVoid(lastValue)) {
  				if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
  					if (isArray(nextValue)) {
  						updateAndAppendDynamicChildren(domNode, nextValue);
  					} else {
  						recreateNode(lastItem, nextItem, node, treeLifecycle, context);
  					}
  				} else {
  					domNode.appendChild(document.createTextNode(nextValue));
  				}
  			} else if (lastValue && isVoid(nextValue)) {
  				if (isArray(lastValue)) {
  					for (var i = 0; i < lastValue.length; i++) {
  						if (!isVoid(domNode.childNodes[i])) {
  							domNode.removeChild(domNode.childNodes[i]);
  						} else {
  							removeChild(domNode);
  						}
  					}
  				} else {
  					removeChild(domNode);
  				}
  			} else if (nextValue !== lastValue) {
  				if (isStringOrNumber(nextValue)) {
  					appendText(domNode, nextValue);
  				} else if (isVoid(nextValue)) {
  					removeChild(domNode);
  					// if we update from undefined, we will have an array with zero length.
  					// If we check if it's an array, it will throw 'x' is undefined.
  				} else if (nextValue.length !== 0 && isArray(nextValue)) {
  						if (lastValue && isArray(lastValue)) {
  							if (keyedChildren) {
  								updateKeyed(nextValue, lastValue, domNode, null, treeLifecycle, context);
  							} else {
  								updateNonKeyed(nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context);
  							}
  						} else {
  							// lastValue is undefined, so set it to an empty array and update
  							updateNonKeyed(nextValue, [], childNodeList, domNode, null, treeLifecycle, context);
  						}
  					} else if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
  						var tree = nextValue && nextValue.tree;

  						if (!isVoid(tree)) {
  							var lastTree = lastValue && lastValue.tree;

  							if (!isVoid(lastTree)) {
  								tree.dom.update(lastValue, nextValue, treeLifecycle, context);
  							} else {
  								recreateNode(lastItem, nextItem, node, treeLifecycle, context);
  							}
  						} else {
  							removeChild(domNode);
  						}
  					}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			removeValueTree(getValueWithIndex(item, valueIndex), treeLifecycle);
  			if (dynamicAttrs) {
  				var domNode = domNodeMap[item.id];

  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  				clearListeners(item, domNode, dynamicAttrs);
  			}
  		}
  	};

  	return node;
  }

  function addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context) {

  	if (!isVoid(subTreeForChildren)) {
  		if (isArray(subTreeForChildren)) {
  			for (var i = 0; i < subTreeForChildren.length; i++) {
  				var subTree = subTreeForChildren[i];
  				var childNode = subTree.create(item, treeLifecycle, context);
  				if (!isVoid(childNode)) {
  					domNode.appendChild(childNode);
  				}
  			}
  		} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {

  			var replaceNode = domNode.firstChild;
  			var childNode = subTreeForChildren.create(item, treeLifecycle, context);

  			if (replaceNode) {
  				domNode.replaceChild(childNode, domNode.firstChild);
  			} else {
  				domNode.appendChild(childNode);
  			}
  		}
  	}
  }

  function createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, recyclingEnabled) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var domNode = undefined;

  			if (recyclingEnabled) {
  				domNode = recycle(node, item, treeLifecycle, context);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context);
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
  				if (dynamicAttrs.onAttached) {
  					treeLifecycle.addTreeSuccessListener(function () {
  						handleHooks(item, dynamicAttrs, domNode, 'onAttached');
  					});
  				}
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			nextItem.id = lastItem.id;
  			if (node !== lastItem.tree.dom) {
  				var newDomNode = recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);

  				nextItem.rootNode = newDomNode;
  				return newDomNode;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
  				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  			}
  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						subTree.update(lastItem, nextItem, treeLifecycle, context);
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					subTreeForChildren.update(lastItem, nextItem, treeLifecycle, context);
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						subTree.remove(item, treeLifecycle);
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					subTreeForChildren.remove(item, treeLifecycle);
  				}
  			}
  			if (dynamicAttrs) {
  				var domNode = item.rootNode;

  				clearListeners(item, domNode, dynamicAttrs);
  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  			}
  		}
  	};

  	return node;
  }

  function createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs) {
  	var domNodeMap = {};
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var domNode = templateNode.cloneNode(false);

  			addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context);

  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
  				if (dynamicAttrs.onAttached) {
  					treeLifecycle.addTreeSuccessListener(function () {
  						handleHooks(item, dynamicAttrs, domNode, 'onAttached');
  					});
  				}
  			}
  			domNodeMap[item.id] = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var domNode = domNodeMap[lastItem.id];

  			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
  				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  			}
  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						subTree.update(lastItem, nextItem, treeLifecycle, context);
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					var newDomNode = subTreeForChildren.update(lastItem, nextItem, treeLifecycle, context);

  					if (newDomNode) {
  						replaceChild(domNode, newDomNode);
  					}
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  				if (dynamicAttrs.onDidUpdate) {
  					handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var domNode = domNodeMap[item.id];

  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						subTree.remove(item, treeLifecycle);
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					subTreeForChildren.remove(item, treeLifecycle);
  				}
  			}
  			if (dynamicAttrs) {
  				clearListeners(item, domNode, dynamicAttrs);
  				if (dynamicAttrs.onWillDetach) {
  					handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  				}
  			}
  		}
  	};
  	return node;
  }

  // Testing the length property are actually faster than testing the
  // string against '', because the interpreter won't have to create a String
  // object from the string literal.
  var isVoidValue = (function (x) {
    return x === null || x === undefined || x.length === 0;
  })

  function createDynamicNode(valueIndex) {
  	var domNodeMap = {};
  	var childNodeList = [];
  	var keyedChildren = true;
  	var nextDomNode = undefined;
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var value = getValueWithIndex(item, valueIndex);
  			var domNode = undefined;
  			var type = getTypeFromValue(value);

  			switch (type) {
  				case ValueTypes.TEXT:
  					if (isVoidValue(value)) {
  						value = '';
  					}
  					domNode = document.createTextNode(value);
  					break;
  				case ValueTypes.ARRAY:
  					var virtualList = createVirtualList(value, item, childNodeList, treeLifecycle, context);
  					domNode = virtualList.domNode;
  					keyedChildren = virtualList.keyedChildren;
  					treeLifecycle.addTreeSuccessListener(function () {
  						if (childNodeList.length > 0) {
  							nextDomNode = childNodeList[childNodeList.length - 1].nextSibling || null;
  							domNode = childNodeList[0].parentNode;
  						}
  					});
  					break;
  				case ValueTypes.TREE:
  					domNode = value.create(item, treeLifecycle, context);
  					break;
  				case ValueTypes.EMPTY_OBJECT:
  					if ("development" !== 'production') {
  						throw Error(errorMsg);
  					}
  					break;
  				case ValueTypes.FUNCTION:
  					if ("development" !== 'production') {
  						throw Error(errorMsg);
  					}
  					break;
  				case ValueTypes.FRAGMENT:
  					domNode = value.tree.dom.create(value, treeLifecycle, context);
  					break;
  			}
  			domNodeMap[item.id] = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {

  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {

  				var domNode = domNodeMap[lastItem.id];
  				var nextType = getTypeFromValue(nextValue);
  				var lastType = getTypeFromValue(lastValue);

  				if (lastType !== nextType) {
  					recreateNode(domNode, nextItem, node, treeLifecycle, context);
  					return;
  				}
  				switch (nextType) {
  					case ValueTypes.TEXT:
  						if (isVoidValue(nextValue)) {
  							nextValue = '';
  						}
  						domNode.nodeValue = nextValue;
  						return;
  					case ValueTypes.ARRAY:
  						updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context);
  						return;
  					case ValueTypes.TREE:
  						// TODO
  						break;
  					case ValueTypes.FRAGMENT:
  						nextValue.tree.dom.update(lastValue, nextValue, treeLifecycle, context);
  						return;
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var value = getValueWithIndex(item, valueIndex);
  			var type = getTypeFromValue(value);

  			if (type === ValueTypes.TREE) {
  				value.remove(item, treeLifecycle);
  			} else if (type === ValueTypes.FRAGMENT) {
  				value.tree.dom.remove(value, treeLifecycle);
  			}
  		}
  	};

  	return node;
  }

  var statefulError = 'Inferno Error: Stateful ES2015 components from `inferno-component` cannot use inline lifecycle hooks, apply the lifecycle methods to the class itself.';

  function createRootNodeWithComponent(componentIndex, props, recyclingEnabled) {
  	var currentItem = undefined;
  	var statelessRender = undefined;
  	var instanceMap = {};
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var instance = undefined;
  			var domNode = undefined;
  			var toUseItem = item;

  			if (node.overrideItem !== null) {
  				toUseItem = node.overrideItem;
  			}
  			if (recyclingEnabled) {
  				domNode = recycle(node, item, treeLifecycle, context);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			var Component = getValueWithIndex(toUseItem, componentIndex);

  			currentItem = item;
  			if (isVoid(Component)) {
  				// bad component, make a text node
  				domNode = document.createTextNode('');
  				item.rootNode = domNode;
  				instance = null;
  				return domNode;
  			} else if (typeof Component === 'function') {
  				// stateless component
  				if (!Component.prototype.render) {
  					(function () {
  						var nextProps = getValueForProps(props, toUseItem);
  						if (props) {
  							if (props.onComponentWillMount) {
  								handleHooks(item, nextProps, null, 'onComponentWillMount', true);
  							}
  							if (props.onComponentDidMount) {
  								treeLifecycle.addTreeSuccessListener(function () {
  									item.rootNode = domNode;
  									handleHooks(item, nextProps, domNode, 'onComponentDidMount', true);
  								});
  							}
  						}
  						var nextRender = Component(nextProps, context);

  						nextRender.parent = item;
  						domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
  						statelessRender = nextRender;
  						item.rootNode = domNode;
  					})();
  				} else {
  					(function () {
  						if (props.onComponentWillMount || props.onComponentDidMount || props.onComponentWillUnmount || props.onComponentShouldUpdate || props.onComponentWillUpdate || props.onComponentDidUpdate) {
  							throw Error(statefulError);
  						}
  						instance = new Component(getValueForProps(props, toUseItem));
  						instance.context = context;
  						instance.componentWillMount();
  						var nextRender = instance.render();
  						var childContext = instance.getChildContext();
  						var fragmentFirstChild = undefined;

  						if (childContext) {
  							context = babelHelpers.extends({}, context, childContext);
  						}
  						nextRender.parent = item;
  						domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
  						item.rootNode = domNode;
  						instance._lastRender = nextRender;

  						if (domNode instanceof DocumentFragment) {
  							fragmentFirstChild = domNode.childNodes[0];
  						}
  						treeLifecycle.addTreeSuccessListener(function () {
  							if (fragmentFirstChild) {
  								domNode = fragmentFirstChild.parentNode;
  								item.rootNode = domNode;
  							}
  							instance.componentDidMount();
  						});
  						instance.forceUpdate = function () {
  							instance.context = context;
  							var nextRender = instance.render.call(instance);
  							var childContext = instance.getChildContext();

  							if (childContext) {
  								context = babelHelpers.extends({}, context, childContext);
  							}
  							nextRender.parent = currentItem;
  							nextRender.tree.dom.update(instance._lastRender, nextRender, treeLifecycle, context);
  							currentItem.rootNode = nextRender.rootNode;
  							instance._lastRender = nextRender;
  						};
  					})();
  				}
  			}
  			instanceMap[item.id] = instance;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var Component = getValueWithIndex(nextItem, componentIndex);
  			var instance = instanceMap[lastItem.id];

  			nextItem.id = lastItem.id;
  			nextItem.rootNode = lastItem.rootNode;
  			currentItem = nextItem;
  			if (!Component) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  				return;
  			}
  			if (typeof Component === 'function') {
  				if (!Component.prototype.render) {
  					var lastProps = getValueForProps(props, lastItem);
  					var nextProps = getValueForProps(props, nextItem);
  					var shouldUpdate = true;

  					if (nextProps && nextProps.onComponentShouldUpdate) {
  						shouldUpdate = handleHooks(nextItem, lastProps, lastItem.rootNode, 'onComponentShouldUpdate', true, nextProps);
  					}
  					if (!shouldUpdate) {
  						return;
  					}
  					if (nextProps && nextProps.onComponentWillUpdate) {
  						handleHooks(nextItem, lastProps, lastItem.rootNode, 'onComponentWillUpdate', true, nextProps);
  					}
  					var nextRender = Component(nextProps, context);

  					nextRender.parent = currentItem;
  					if (!isVoid(statelessRender)) {
  						var newDomNode = nextRender.tree.dom.update(statelessRender || instance._lastRender, nextRender, treeLifecycle, context);

  						if (newDomNode) {
  							if (nextRender.rootNode.parentNode) {
  								nextRender.rootNode.parentNode.replaceChild(newDomNode, nextRender.rootNode);
  							} else {
  								lastItem.rootNode.parentNode.replaceChild(newDomNode, lastItem.rootNode);
  							}
  							currentItem.rootNode = newDomNode;
  						} else {
  							var _newDomNode = nextRender.tree.dom.create(statelessRender, treeLifecycle, context);

  							if (_newDomNode) {
  								if (nextRender.rootNode.parentNode) {
  									nextRender.rootNode.parentNode.replaceChild(_newDomNode, nextRender.rootNode);
  								} else {
  									lastItem.rootNode.parentNode.replaceChild(_newDomNode, lastItem.rootNode);
  								}
  								currentItem.rootNode = _newDomNode;
  							} else {
  								currentItem.rootNode = nextRender.rootNode;
  							}
  						}
  					} else {
  						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  						return;
  					}
  					if (props && props.onComponentDidUpdate) {
  						handleHooks(nextItem, nextProps, lastItem.rootNode, 'onComponentDidUpdate', true);
  					}

  					statelessRender = nextRender;
  				} else {

  					if (!instance || node !== lastItem.tree.dom || Component !== instance.constructor) {
  						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  						return;
  					}
  					var domNode = lastItem.rootNode;
  					var prevProps = instance.props;
  					var prevState = instance.state;
  					var nextState = instance.state;
  					var nextProps = getValueForProps(props, nextItem);

  					nextItem.rootNode = domNode;
  					instance._updateComponent(prevState, nextState, prevProps, nextProps);
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var instance = instanceMap[item.id];

  			if (instance) {
  				instance._lastRender.tree.dom.remove(instance._lastRender, treeLifecycle);
  				instance.componentWillUnmount();
  				instanceMap[item.id] = null;
  			} else {
  				if (props && props.onComponentWillUnmount) {
  					var lastProps = getValueForProps(props, item);
  					handleHooks(item, lastProps, item.rootNode, 'onComponentWillUnmount', true);
  				}
  			}
  		}
  	};

  	return node;
  }

  function createNodeWithComponent(componentIndex, props) {
  	var domNode = undefined;
  	var currentItem = undefined;
  	var statelessRender = undefined;
  	var instanceMap = {};
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle, context) {
  			var toUseItem = item;
  			var nextRender = undefined;
  			var instance = node.instance;

  			if (node.overrideItem !== null) {
  				toUseItem = node.overrideItem;
  			}
  			var Component = getValueWithIndex(toUseItem, componentIndex);

  			currentItem = item;
  			if (isVoid(Component)) {
  				domNode = document.createTextNode('');
  				instance = null;
  				return domNode;
  			} else if (typeof Component === 'function') {
  				// stateless component
  				if (!Component.prototype.render) {
  					(function () {
  						var nextProps = getValueForProps(props, toUseItem);
  						if (props) {
  							if (props.onComponentWillMount) {
  								handleHooks(item, nextProps, null, 'onComponentWillMount', true);
  							}
  							if (props.onComponentDidMount) {
  								treeLifecycle.addTreeSuccessListener(function () {
  									handleHooks(item, nextProps, domNode, 'onComponentDidMount', true);
  								});
  							}
  						}
  						var nextRender = Component(nextProps, context);

  						nextRender.parent = item;
  						domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
  						statelessRender = nextRender;
  					})();
  				} else {
  					(function () {
  						instance = new Component(getValueForProps(props, toUseItem));
  						instance.context = context;
  						instance.componentWillMount();
  						nextRender = instance.render();
  						var childContext = instance.getChildContext();
  						var fragmentFirstChild = undefined;

  						if (childContext) {
  							context = babelHelpers.extends({}, context, childContext);
  						}
  						nextRender.parent = item;
  						domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
  						instance._lastRender = nextRender;

  						if (domNode instanceof DocumentFragment) {
  							fragmentFirstChild = domNode.childNodes[0];
  						}
  						treeLifecycle.addTreeSuccessListener(function () {
  							if (fragmentFirstChild) {
  								domNode = fragmentFirstChild.parentNode;
  							}
  							instance.componentDidMount();
  						});
  						instance.forceUpdate = function () {
  							instance.context = context;
  							var nextRender = instance.render.call(instance);
  							var childContext = instance.getChildContext();

  							if (childContext) {
  								context = babelHelpers.extends({}, context, childContext);
  							}
  							nextRender.parent = currentItem;
  							var newDomNode = nextRender.tree.dom.update(instance._lastRender, nextRender, treeLifecycle, context);

  							if (newDomNode) {
  								domNode = newDomNode;
  								instance._lastRender.rootNode = domNode;
  								instance._lastRender = nextRender;
  								return domNode;
  							} else {
  								instance._lastRender = nextRender;
  							}
  						};
  					})();
  				}
  			}
  			instanceMap[item.id] = instance;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var Component = getValueWithIndex(nextItem, componentIndex);
  			var instance = instanceMap[lastItem.id];

  			currentItem = nextItem;
  			if (!Component) {
  				recreateNode(domNode, nextItem, node, treeLifecycle, context);
  				if (instance) {
  					instance._lastRender.rootNode = domNode;
  				}
  				return domNode;
  			}
  			if (typeof Component === 'function') {
  				// stateless component
  				if (!Component.prototype.render) {
  					var lastProps = getValueForProps(props, lastItem);
  					var nextProps = getValueForProps(props, nextItem);
  					var shouldUpdate = true;

  					if (nextProps && nextProps.onComponentShouldUpdate) {
  						shouldUpdate = handleHooks(nextItem, lastProps, domNode, 'onComponentShouldUpdate', true, nextProps);
  					}
  					if (!shouldUpdate) {
  						return;
  					}
  					if (nextProps && nextProps.onComponentWillUpdate) {
  						handleHooks(nextItem, lastProps, domNode, 'onComponentWillUpdate', true, nextProps);
  					}
  					var nextRender = Component(nextProps, context);
  					var newDomNode = undefined;

  					nextRender.parent = currentItem;
  					// Edge case. If we update from a stateless component with a null value, we need to re-create it, not update it
  					// E.g. start with 'render(template(null), container); ' will cause this.
  					if (!isVoid(statelessRender)) {
  						newDomNode = nextRender.tree.dom.update(statelessRender || instance._lastRender, nextRender, treeLifecycle, context);
  					} else {
  						recreateNode(domNode, nextItem, node, treeLifecycle, context);
  						return;
  					}
  					statelessRender = nextRender;

  					var returnDomNode = false;

  					if (!isVoid(newDomNode)) {
  						if (domNode.parentNode) {
  							domNode.parentNode.replaceChild(newDomNode, domNode);
  						}
  						domNode = newDomNode;
  						returnDomNode = true;
  					}
  					if (props && props.onComponentDidUpdate) {
  						handleHooks(nextItem, nextProps, domNode, 'onComponentDidUpdate', true);
  					}
  					if (returnDomNode) {
  						return domNode;
  					}
  				} else {
  					if (!instance || Component !== instance.constructor) {
  						recreateNode(domNode, nextItem, node, treeLifecycle, context);
  						return domNode;
  					}
  					var prevProps = instance.props;
  					var prevState = instance.state;
  					var nextState = instance.state;
  					var nextProps = getValueForProps(props, nextItem);

  					return instance._updateComponent(prevState, nextState, prevProps, nextProps);
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var instance = instanceMap[item.id];

  			if (instance) {
  				instance._lastRender.tree.dom.remove(instance._lastRender, treeLifecycle);
  				instance.componentWillUnmount();
  				instanceMap[item.id] = null;
  			} else {
  				if (props && props.onComponentWillUnmount) {
  					var lastProps = getValueForProps(props, item);
  					handleHooks(item, lastProps, domNode, 'onComponentWillUnmount', true);
  				}
  			}
  		}
  	};

  	return node;
  }

  function createRootDynamicTextNode(templateNode, valueIndex, recyclingEnabled) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item) {
  			var domNode = undefined;

  			if (recyclingEnabled) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (isStringOrNumber(value)) {
  					domNode.nodeValue = value;
  				}
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.tree.dom) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			nextItem.id = lastItem.id;
  			var nextValue = getValueWithIndex(nextItem, valueIndex);

  			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
  				if (isStringOrNumber(nextValue)) {
  					domNode.nodeValue = nextValue;
  				}
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function createRootVoidNode(templateNode, dynamicAttrs, recyclingEnabled, staticNode) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		overrideItem: null,
  		create: function create(item, treeLifecycle) {
  			var domNode = undefined;

  			if (recyclingEnabled) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(true);
  			item.rootNode = domNode;

  			if (staticNode) {
  				return domNode;
  			}

  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.tree.dom) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  				return;
  			}

  			if (staticNode) {
  				nextItem.rootNode = lastItem.rootNode;
  			} else {
  				var domNode = lastItem.rootNode;

  				nextItem.rootNode = domNode;
  				nextItem.rootNode = lastItem.rootNode;

  				if (dynamicAttrs) {
  					if (dynamicAttrs.onWillUpdate) {
  						handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  					}
  					updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  					if (dynamicAttrs.onDidUpdate) {
  						handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  					}
  				}
  			}
  		},
  		remove: function remove(item) {
  			if (!staticNode) {
  				if (dynamicAttrs) {
  					var domNode = item.rootNode;

  					if (dynamicAttrs.onWillDetach) {
  						handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  					}
  					clearListeners(item, domNode, dynamicAttrs);
  				}
  			}
  		},
  		hydrate: function hydrate(hydrateNode, item) {
  			if (!validateHydrateNode(hydrateNode, templateNode, item)) {
  				recreateRootNodeFromHydration(hydrateNode, item, node);
  				return;
  			}
  			item.rootNode = hydrateNode;
  		}
  	};

  	return node;
  }

  function createVoidNode(templateNode, dynamicAttrs, staticNode) {
  	var domNodeMap = {};
  	var node = {
  		overrideItem: null,
  		create: function create(item, treeLifecycle) {
  			var domNode = templateNode.cloneNode(true);

  			if (staticNode) {
  				return domNode;
  			}

  			if (dynamicAttrs) {
  				addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle);
  			}
  			domNodeMap[item.id] = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			if (!staticNode) {
  				var domNode = domNodeMap[lastItem.id];
  				if (dynamicAttrs) {
  					if (dynamicAttrs.onWillUpdate) {
  						handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
  					}
  					updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  					if (dynamicAttrs.onDidUpdate) {
  						handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
  					}
  				}
  			}
  		},
  		remove: function remove(item) {
  			if (!staticNode) {
  				var domNode = domNodeMap[item.id];

  				if (dynamicAttrs) {
  					if (dynamicAttrs.onWillDetach) {
  						handleHooks(item, dynamicAttrs, domNode, 'onWillDetach');
  					}
  					clearListeners(item, domNode, dynamicAttrs);
  				}
  			}
  		},
  		hydrate: function hydrate() {}
  	};

  	return node;
  }

  function createElement(schema, domNamespace, parentNode) {
  	var MathNamespace = 'http://www.w3.org/1998/Math/MathML';
  	var SVGNamespace = 'http://www.w3.org/2000/svg';
  	var nodeName = schema && typeof schema.tag === 'string' && schema.tag.toLowerCase();
  	var is = schema.attrs && schema.attrs.is;

  	var templateNode = undefined;

  	if (domNamespace === undefined) {
  		if (schema.attrs && schema.attrs.xmlns) {
  			domNamespace = schema.attrs.xmlns;
  		} else {
  			switch (nodeName) {
  				case 'svg':
  					domNamespace = SVGNamespace;
  					break;
  				case 'math':
  					domNamespace = MathNamespace;
  					break;
  				default:
  					// Edge case. In case a namespace element are wrapped inside a non-namespace element, it will inherit wrong namespace.
  					// E.g. <div><svg><svg></div> - will not work
  					if (parentNode) {
  						// only used by static children
  						// check only for top-level element for both mathML and SVG
  						if (nodeName === 'svg' && parentNode.namespaceURI !== SVGNamespace) {
  							domNamespace = SVGNamespace;
  						} else if (nodeName === 'math' && parentNode.namespaceURI !== MathNamespace) {
  							domNamespace = MathNamespace;
  						}
  					} else if (isSVGElement(nodeName)) {
  						domNamespace = SVGNamespace;
  					} else if (isMathMLElement(nodeName)) {
  						domNamespace = MathNamespace;
  					}
  			}
  		}
  	}
  	templateNode = domNamespace ? is ? document.createElementNS(domNamespace, nodeName, is) : document.createElementNS(domNamespace, nodeName) : is ? document.createElement(nodeName, is) : document.createElement(nodeName);

  	return {
  		namespace: domNamespace,
  		node: templateNode
  	};
  }

  var recyclingEnabled = isRecyclingEnabled();
  function createStaticAttributes(node, domNode, excludeAttrs) {
  	var attrs = node.attrs;

  	if (!isVoid(attrs)) {
  		if (excludeAttrs) {
  			var newAttrs = babelHelpers.extends({}, attrs);

  			for (var attr in excludeAttrs) {
  				if (newAttrs[attr]) {
  					delete newAttrs[attr];
  				}
  			}
  			addDOMStaticAttributes(node, domNode, newAttrs);
  		} else {
  			addDOMStaticAttributes(node, domNode, attrs);
  		}
  	}
  }

  function createStaticTreeChildren(children, parentNode, domNamespace) {
  	if (isArray(children)) {
  		for (var i = 0; i < children.length; i++) {
  			var childItem = children[i];

  			if (isStringOrNumber(childItem)) {
  				var textNode = document.createTextNode(childItem);

  				parentNode.appendChild(textNode);
  			} else {
  				createStaticTreeNode(childItem, parentNode, domNamespace);
  			}
  		}
  	} else {
  		if (isStringOrNumber(children)) {
  			parentNode.textContent = children;
  		} else {
  			createStaticTreeNode(children, parentNode, domNamespace);
  		}
  	}
  }

  function createStaticTreeNode(node, parentNode, domNamespace) {
  	var staticNode = undefined;

  	if (!isVoid(node)) {
  		if (isStringOrNumber(node)) {
  			staticNode = document.createTextNode(node);
  		} else {
  			var tag = node.tag;

  			if (tag) {
  				var Element = createElement(node, domNamespace, parentNode);

  				staticNode = Element.node;
  				domNamespace = Element.namespace;
  				var text = node.text;
  				var children = node.children;

  				if (!isVoid(text)) {
  					if ("development" !== 'production') {
  						if (!isVoid(children)) {
  							throw Error(invalidTemplateError);
  						}
  						if (!isStringOrNumber(text)) {
  							throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  						}
  					}
  					staticNode.textContent = text;
  				} else {
  					if (!isVoid(children)) {
  						createStaticTreeChildren(children, staticNode, domNamespace);
  					}
  				}
  				createStaticAttributes(node, staticNode);
  			} else if (node.text) {
  				staticNode = document.createTextNode(node.text);
  			}
  		}
  		if ("development" !== 'production') {
  			if (staticNode === undefined) {
  				throw Error(invalidTemplateError);
  			}
  		}
  		if (parentNode === null) {
  			return staticNode;
  		} else {
  			parentNode.appendChild(staticNode);
  		}
  	}
  }

  function createDOMTree(schema, isRoot, dynamicNodeMap, domNamespace) {
  	if ("development" !== 'production') {
  		if (isVoid(schema)) {
  			throw Error(invalidTemplateError);
  		}
  		if (isArray(schema)) {
  			throw Error(invalidTemplateError);
  		}
  	}

  	var dynamicFlags = dynamicNodeMap.get(schema);
  	var node = undefined;
  	var templateNode = undefined;

  	if (!dynamicFlags) {
  		templateNode = createStaticTreeNode(schema, null, domNamespace, schema);
  		if ("development" !== 'production') {
  			if (!templateNode) {
  				throw Error(invalidTemplateError);
  			}
  		}
  		if (isRoot) {
  			node = createRootVoidNode(templateNode, null, recyclingEnabled, true);
  		} else {
  			node = createVoidNode(templateNode, true);
  		}
  	} else {
  		if (dynamicFlags.NODE === true) {
  			if (isRoot) {
  				//		node = createRootDynamicNode( schema.index, domNamespace, recyclingEnabled );
  			} else {
  					node = createDynamicNode(schema.index, domNamespace);
  				}
  		} else {
  			var tag = schema.tag;
  			var text = schema.text;

  			if (tag) {
  				if (tag.type === ObjectTypes.VARIABLE) {
  					var lastAttrs = schema.attrs;
  					var _attrs = babelHelpers.extends({}, lastAttrs);
  					var _children = schema.children;

  					if (_children) {
  						if (isArray(_children)) {
  							if (_children.length > 1) {
  								_attrs.children = [];
  								for (var i = 0; i < _children.length; i++) {
  									var childNode = _children[i];

  									_attrs.children.push(createDOMTree(childNode, false, dynamicNodeMap, domNamespace));
  								}
  							} else if (_children.length === 1) {
  								_attrs.children = createDOMTree(_children[0], false, dynamicNodeMap, domNamespace);
  							}
  						} else {
  							_attrs.children = createDOMTree(_children, false, dynamicNodeMap, domNamespace);
  						}
  					}
  					if (isRoot) {
  						return createRootNodeWithComponent(tag.index, _attrs, _children, domNamespace, recyclingEnabled);
  					} else {
  						return createNodeWithComponent(tag.index, _attrs, _children, domNamespace);
  					}
  				}
  				templateNode = createElement(schema, domNamespace, null).node;

  				var attrs = schema.attrs;
  				var dynamicAttrs = null;

  				if (!isVoid(attrs)) {
  					if (dynamicFlags.ATTRS === true) {
  						dynamicAttrs = attrs;
  					} else if (dynamicFlags.ATTRS !== false) {
  						dynamicAttrs = dynamicFlags.ATTRS;
  						createStaticAttributes(schema, templateNode, dynamicAttrs);
  					} else {
  						createStaticAttributes(schema, templateNode);
  					}
  				}
  				var children = schema.children;

  				if (!isVoid(text)) {
  					if ("development" !== 'production') {
  						if (!isVoid(children)) {
  							throw Error('Inferno Error: Template nodes cannot contain both TEXT and a CHILDREN properties, they must only use one or the other.');
  						}
  					}
  					if (dynamicFlags.TEXT === true) {
  						if (isRoot) {
  							node = createRootNodeWithDynamicText(templateNode, text.index, dynamicAttrs, recyclingEnabled);
  						} else {
  							node = createNodeWithDynamicText(templateNode, text.index, dynamicAttrs);
  						}
  					} else {
  						if (isStringOrNumber(text)) {
  							templateNode.textContent = text;
  						} else {
  							if ("development" !== 'production') {
  								throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  							}
  						}
  						if (isRoot) {
  							node = createRootNodeWithStaticChild(templateNode, dynamicAttrs, recyclingEnabled);
  						} else {
  							node = createNodeWithStaticChild(templateNode, dynamicAttrs);
  						}
  					}
  				} else {
  					if (!isVoid(children)) {
  						if (children.type === ObjectTypes.VARIABLE) {
  							if (isRoot) {
  								node = createRootNodeWithDynamicChild(templateNode, children.index, dynamicAttrs, recyclingEnabled);
  							} else {
  								node = createNodeWithDynamicChild(templateNode, children.index, dynamicAttrs);
  							}
  						} else if (dynamicFlags.CHILDREN === true) {
  							var subTreeForChildren = [];

  							if ((typeof children === 'undefined' ? 'undefined' : babelHelpers.typeof(children)) === 'object') {
  								if (isArray(children)) {
  									for (var i = 0; i < children.length; i++) {
  										var childItem = children[i];

  										subTreeForChildren.push(createDOMTree(childItem, false, dynamicNodeMap));
  									}
  								} else {
  									subTreeForChildren = createDOMTree(children, false, dynamicNodeMap);
  								}
  							}
  							if (isRoot) {
  								node = createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, recyclingEnabled);
  							} else {
  								node = createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs);
  							}
  						} else if (isStringOrNumber(children)) {
  							templateNode.textContent = children;
  							if (isRoot) {
  								node = createRootNodeWithStaticChild(templateNode, dynamicAttrs, recyclingEnabled);
  							} else {
  								node = createNodeWithStaticChild(templateNode, dynamicAttrs);
  							}
  						} else {
  							var childNodeDynamicFlags = dynamicNodeMap.get(children);

  							if (childNodeDynamicFlags === undefined) {
  								createStaticTreeChildren(children, templateNode);

  								if (isRoot) {
  									node = createRootNodeWithStaticChild(templateNode, dynamicAttrs, recyclingEnabled);
  								} else {
  									node = createNodeWithStaticChild(templateNode, dynamicAttrs);
  								}
  							}
  						}
  					} else {
  						if (isRoot) {
  							node = createRootVoidNode(templateNode, dynamicAttrs, recyclingEnabled, false);
  						} else {
  							node = createVoidNode(templateNode, dynamicAttrs, false);
  						}
  					}
  				}
  			} else if (text) {
  				node = createRootDynamicTextNode(document.createTextNode(''), text.index);
  			}
  		}
  	}
  	return node;
  }

  var GLOBAL = global || (typeof window !== 'undefined' ? window : null);

  // browser
  if (GLOBAL && GLOBAL.Inferno) {
  	GLOBAL.Inferno.addTreeConstructor('dom', createDOMTree);
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
  				throw 'Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.';
  			} else {
  				Inferno.addTreeConstructor('dom', createDOMTree);
  			}
  		}
  	}

  var index = {
  	render: render,
  	createRef: createRef
  };

  return index;

}));