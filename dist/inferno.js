/*!
 * inferno v0.4.2
 * (c) 2015 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.Inferno = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.typeof = function (obj) {
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = (function () {
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
  })();

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
  function createRef() {
  	return {
  		element: null
  	};
  }

  var recyclingEnabled$10 = true;

  function pool(item) {
  	var key = item.key;
  	var tree = item.domTree;

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
  	return recyclingEnabled$10;
  }

  var isVoid = (function (x) {
    return x === null || typeof x === 'undefined';
  })

  var isArray = (function (x) {
    return x.constructor === Array;
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

  function createVariable(index) {
  	return {
  		index: index,
  		type: ObjectTypes.VARIABLE
  	};
  }

  function getValueWithIndex(item, index) {
  	return index < 2 ? index === 0 ? item.v0 : item.v1 : item.values[index - 2];
  }

  function getCorrectItemForValues(node, item) {
  	if (node && node !== item.domTree && item.parent) {
  		return getCorrectItemForValues(node, item.parent);
  	}
  	return item;
  }

  function getTypeFromValue(value) {
  	if (typeof value === 'string' || typeof value === 'number' || isVoid(value)) {
  		return ValueTypes.TEXT;
  	} else if (isArray(value)) {
  		return ValueTypes.ARRAY;
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.create) {
  		return ValueTypes.TREE;
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.domTree) {
  		return ValueTypes.FRAGMENT;
  	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && Object.keys(value).length === 0) {
  		return ValueTypes.EMPTY_OBJECT;
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

  		if (val && val.index) {
  			newProps[name] = getValueWithIndex(item, val.index);
  		} else {
  			newProps[name] = val;
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
  		var tree = value.domTree;

  		tree.remove(value, treeLifecycle);
  	}
  }

  var recyclingEnabled = isRecyclingEnabled();
  var infernoBadTemplate = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';

  function updateKeyed(items, oldItems, parentNode, parentNextNode, treeLifecycle, context) {
  	var stop = false;
  	var startIndex = 0;
  	var oldStartIndex = 0;
  	var itemsLength = items.length;
  	var oldItemsLength = oldItems.length;

  	// TODO only if there are no other children
  	if (itemsLength === 0 && oldItemsLength >= 5) {
  		if (recyclingEnabled) {
  			for (var i = 0; i < oldItemsLength; i++) {
  				pool(oldItems[i]);
  			}
  		}
  		parentNode.textContent = '';
  		return;
  	}

  	var endIndex = itemsLength - 1;
  	var oldEndIndex = oldItemsLength - 1;
  	var startItem = itemsLength > 0 && items[startIndex];
  	var oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
  	var endItem = undefined;
  	var oldEndItem = undefined;
  	var nextNode = undefined;
  	var oldItem = undefined;
  	var item = undefined;

  	// TODO don't read key too often
  	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
  		stop = true;
  		while (startItem.key === oldStartItem.key) {
  			startItem.domTree.update(oldStartItem, startItem, treeLifecycle, context);
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
  		while (endItem.key === oldEndItem.key) {
  			endItem.domTree.update(oldEndItem, endItem, treeLifecycle, context);
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
  		while (endItem.key === oldStartItem.key) {
  			nextNode = endIndex + 1 < itemsLength ? items[endIndex + 1].rootNode : parentNextNode;
  			endItem.domTree.update(oldStartItem, endItem, treeLifecycle, context);
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
  		while (startItem.key === oldEndItem.key) {
  			nextNode = oldItems[oldStartIndex].rootNode;
  			startItem.domTree.update(oldEndItem, startItem, treeLifecycle, context);
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
  				insertOrAppend(parentNode, item.domTree.create(item, treeLifecycle, context), nextNode);
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
  				item.domTree.update(oldItem, item, treeLifecycle, context);

  				/* eslint eqeqeq:0 */
  				// TODO optimise
  				if (item.rootNode.nextSibling != (nextItem && nextItem.rootNode)) {
  					nextNode = nextItem && nextItem.rootNode || parentNextNode;
  					insertOrAppend(parentNode, item.rootNode, nextNode);
  				}
  			} else {
  				nextNode = nextItem && nextItem.rootNode || parentNextNode;
  				insertOrAppend(parentNode, item.domTree.create(item, treeLifecycle, context), nextNode);
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

  // TODO can we improve performance here?
  function updateNonKeyed(items, oldItems, domNodeList, parentNode, parentNextNode, treeLifecycle, context) {
  	var itemsLength = Math.max(items.length, oldItems.length);

  	for (var i = 0; i < itemsLength; i++) {
  		var item = items[i];
  		var oldItem = oldItems[i];

  		if (item !== oldItem) {
  			if (!isVoid(item)) {
  				if (!isVoid(oldItem)) {
  					if (typeof item === 'string' || typeof item === 'number') {
  						domNodeList[i].nodeValue = item;
  					} else if ((typeof item === 'undefined' ? 'undefined' : babelHelpers.typeof(item)) === 'object') {
  						item.domTree.update(oldItem, item, treeLifecycle, context);
  					}
  				} else {
  					if (typeof item === 'string' || typeof item === 'number') {
  						var childNode = document.createTextNode(item);

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

  function insertOrAppend(parentNode, newNode, nextNode) {
  	if (nextNode) {
  		parentNode.insertBefore(newNode, nextNode);
  	} else {
  		parentNode.appendChild(newNode);
  	}
  }

  function remove(item, parentNode) {
  	parentNode.removeChild(item.rootNode);
  	if (recyclingEnabled) {
  		pool(item);
  	}
  }

  function createVirtualList(value, childNodeList, treeLifecycle, context) {
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
  			case ValueTypes.FRAGMENT:
  				if (childNode.key === undefined) {
  					keyedChildren = false;
  				}
  				childDomNode = childNode.domTree.create(childNode, treeLifecycle, context);
  				childNodeList.push(childDomNode);
  				domNode.appendChild(childDomNode);
  				break;
  			case ValueTypes.EMPTY_OBJECT:
  				throw Error(infernoBadTemplate);
  			case ValueTypes.FUNCTION:
  				throw Error(infernoBadTemplate);
  			case ValueTypes.ARRAY:
  				throw Error('Inferno Error: Deep nested arrays are not supported as a valid template values - e.g. [[[1, 2, 3]]]. Only shallow nested arrays are supported - e.g. [[1, 2, 3]].');
  			default:
  				break;
  		}
  	}
  	return { domNode: domNode, keyedChildren: keyedChildren };
  }

  function updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context) {
  	// NOTE: if someone switches from keyed to non-keyed, the node order won't be right...
  	if (isArray(lastValue)) {
  		// need to do this otherwise domNode will be an empty document fragment
  		domNode = childNodeList[0].parentNode;
  		if (keyedChildren) {
  			updateKeyed(nextValue, lastValue, domNode, nextDomNode, treeLifecycle, context);
  		} else {
  			updateNonKeyed(nextValue, lastValue, childNodeList, domNode, nextDomNode, treeLifecycle, context);
  		}
  	} else {
  		// TODO
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
  	var fragment = {
  		parentNode: parentNode,
  		render: function render(nextItem) {
  			if (!nextItem) {
  				return;
  			}
  			var tree = nextItem.domTree;

  			if (!tree) {
  				throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
  			}

  			if (lastItem) {
  				tree.update(lastItem, nextItem, treeLifecycle, context);
  			} else {
  				var dom = tree.create(nextItem, treeLifecycle, context);

  				if (nextNode) {
  					parentNode.insertBefore(dom, nextNode);
  				} else if (parentNode) {
  					parentNode.appendChild(dom);
  				}
  			}
  			if (treeSuccessListeners.length > 0) {
  				for (var i = 0; i < treeSuccessListeners.length; i++) {
  					treeSuccessListeners[i]();
  				}
  			}
  			lastItem = nextItem;
  			return fragment;
  		},
  		remove: function remove$$() {
  			if (lastItem) {
  				var tree = lastItem.domTree;

  				if (lastItem) {
  					tree.remove(lastItem, treeLifecycle);
  				}
  				remove(lastItem, parentNode);
  			}
  			treeSuccessListeners = [];
  			return fragment;
  		}
  	};

  	return fragment;
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

  	if (rootFragment === null) {
  		var fragment = createDOMFragment(parentNode);

  		fragment.render(nextItem);
  		rootFragments.push(fragment);
  	} else {
  		if (nextItem === null) {
  			rootFragment.remove();
  			removeRootFragment(rootFragment);
  		} else {
  			rootFragment.render(nextItem);
  		}
  	}
  }

  function renderToString() /* nextItem */{
  	// TODO
  }

  function createChildren(children) {
  	var childrenArray = [];

  	if (isArray(children)) {
  		for (var i = 0; i < children.length; i++) {
  			var childItem = children[i];

  			childrenArray.push(childItem);
  		}
  	}
  	return childrenArray;
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

  		if (children) {
  			if (children.length) {
  				vNode.children = createChildren(children);
  			} else {
  				vNode.children = children[0];
  			}
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

  var canUseDOM = !!(typeof window !== 'undefined' &&
  // Nwjs doesn't add document as a global in their node context, but does have it on window.document,
  // As a workaround, check if document is undefined
  typeof document !== 'undefined' && window.document.createElement);

  var ExecutionEnvironment = {
    canUseDOM: canUseDOM,
    canUseWorkers: typeof Worker !== 'undefined',
    canUseEventListeners: canUseDOM && !!window.addEventListener,
    canUseViewport: canUseDOM && !!window.screen
  };

  var isSVG = undefined;

  if (ExecutionEnvironment.canUseDOM) {
  	var _document = document;
  	var implementation = _document.implementation;

  	isSVG = implementation && implementation.hasFeature && implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
  }

  var isSVG$1 = isSVG;

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
  	autoPlay: 'autoplay',
  	autoSave: 'autosave',
  	hrefLang: 'hreflang',
  	radioGroup: 'radiogroup',
  	srcDoc: 'srcdoc',
  	srcSet: 'srcset'
  };

  // This 'whitelist' contains edge cases such as attributes
  // that should be seen as a property or boolean property.
  // ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
  var Whitelist = {
  	allowFullScreen: BOOLEAN,
  	async: BOOLEAN,
  	autoFocus: BOOLEAN,
  	autoPlay: null,
  	capture: BOOLEAN,
  	checked: PROPERTY | BOOLEAN,
  	controls: PROPERTY | BOOLEAN,
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
  	sandbox: PROPERTY,
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
  	itemprop: true,
  	itemref: true,
  	itemscope: true,
  	itemtype: true,
  	id: null,
  	class: null,
  	dir: null,
  	lang: null,
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
  	autocorrect: BOOLEAN,

  	autoCapitalize: null,

  	// Some version of IE ( like IE9 ) actually throw an exception
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
    * Safari
    */

  	// color is for Safari mask-icon link
  	color: null,

  	/**
    * RDFa Properties
    */
  	datatype: null,
  	// property is also supported for OpenGraph in meta tags.
  	property: null,

  	/**
    * Others
    */

  	srcSet: null,
  	scrolling: null,
  	nonce: null,
  	method: null,
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

  /**
   * CSS properties which accept numbers but are not in units of "px".
   */
  var unitlessProperties = {
    animationIterationCount: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridRow: true,
    gridColumn: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG-related properties
    fillOpacity: true,
    stopOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
  };

  function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
  }

  var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

  Object.keys(unitlessProperties).forEach(function (prop) {
    prefixes.forEach(function (prefix) {
      unitlessProperties[prefixKey(prefix, prop)] = unitlessProperties[prop];
    });
  });

  /**
   * Normalize CSS properties for SSR
   *
   * @param {String} name The boolean attribute name to set.
   * @param {String} value The boolean attribute value to set.
   */
  function addPixelSuffixToValueIfNeeded (name, value) {

    if (value == null || typeof value === 'boolean' || value === '') {
      return '';
    }

    var isNonNumeric = isNaN(value);

    if (value === 0 || isNonNumeric || unitlessProperties[name]) {
      return '' + value; // cast to string
    }

    if (typeof value === 'string') {
      value = value.trim();
    }
    return value + 'px';
  };

  var template = {
    /**
     * Sets the value for a property on a node. If a value is specified as
     * '' ( empty string ), the corresponding style property will be unset.
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
        } else {
          var propName = propertyInfo.propertyName;

          if (propertyInfo.mustUseProperty) {

            if (propName === 'value' && (vNode !== null && vNode.tag === 'select' || domNode.tagName === 'SELECT')) {
              template.setSelectValueForProperty(vNode, domNode, value, useProperties);
            } else {
              if (useProperties) {
                if ('' + domNode[propName] !== '' + value) {
                  domNode[propName] = value;
                }
              } else {
                if (propertyInfo.hasBooleanValue && (value === true || value === 'true')) {
                  value = propName;
                }
                domNode.setAttribute(propName, value);
              }
            }
          } else {

            var attributeName = propertyInfo.attributeName;
            var namespace = propertyInfo.attributeNamespace;

            // if 'truthy' value, and boolean, it will be 'propName=propName'
            if (propertyInfo.hasBooleanValue && value === true) {
              value = attributeName;
            }

            if (namespace) {
              domNode.setAttributeNS(namespace, attributeName, value);
            } else {
              domNode.setAttribute(attributeName, value);
            }
          }
        }
        // HTML attributes and custom attributes
      } else if (isVoid(value)) {
          domNode.removeAttribute(name);
        } else if (name) {
          domNode.setAttribute(name, value);
        }
    },

    /**
     * Sets the value for multiple styles on a node.	If a value is specified as
     * '' ( empty string ), the corresponding style property will be unset.
     *
     * @param {DOMElement} node
     * @param {object} styles
     */
    setCSS: function setCSS(vNode, domNode, styles) {

      var style = domNode.style;

      for (var styleName in styles) {

        var styleValue = styles[styleName];

        if (!isVoid(styleValue)) {
          style[styleName] = addPixelSuffixToValueIfNeeded(styleName, styleValue);
        } else {
          style[styleName] = '';
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

          if (name === 'value' && (vNode !== null && vNode.tag === 'select' || domNode.tagName === 'SELECT')) {
            template.removeSelectValueForProperty(vNode, domNode);
          } else if (propertyInfo.hasBooleanValue) {
            if (useProperties) {
              domNode[propName] = false;
            } else {
              domNode.removeAttribute(propName);
            }
          } else {
            if (useProperties) {
              if ('' + domNode[propName] !== '') {
                domNode[propName] = '';
              }
            } else {
              domNode.removeAttribute(propName);
            }
          }
        } else {
          domNode.removeAttribute(propertyInfo.attributeName);
        }
        // HTML attributes and custom attributes
      } else {
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

  var focusEvents = {
  	focus: 'focusin', // DOM L3
  	blur: 'focusout' // DOM L3
  };

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
  		// IMPORTANT! IE9 doesn't update selected after form reset
  		if ((option.selected || i === index) &&
  		// Don't return options that are disabled or in a disabled optgroup
  		!option.disabled && (!option.parentNode.disabled || option.parentNode.nodeName !== 'OPTGROUP')) {
  			result.push(option.value);
  		}
  	}
  	return result;
  }

  function getFormElementValues(node) {
  	var name = getFormElementType(node);

  	switch (name) {
  		case 'checkbox':
  		case 'radio':
  			if (node.checked) {
  				return true;
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
  	type || (type = e.type);
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
  			if (listeners && listeners[type] && (listener = listeners[type])) {
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
  		var nodeID = infernoNodeID(domNode),
  		    listeners = listenersStorage[nodeID] || (listenersStorage[nodeID] = {});

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
  					//				} else if ( registry._focusBlur ) {
  					//					node.removeEventListener( type, eventListener[focusEvents[type]] );
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
  			if (attrName === 'style') {
  				styleUpdates = attrVal;
  			} else {
  				template.setProperty(vNode, domNode, attrName, attrVal, false);
  			}
  		}
  	}

  	if (styleUpdates) {
  		template.setCSS(vNode, domNode, styleUpdates);
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
  		attrVal.element = domNode;
  		return true;
  	}
  	return false;
  }

  function addDOMDynamicAttributes(item, domNode, dynamicAttrs, node) {
  	var valueItem = getCorrectItemForValues(node, item);
  	var styleUpdates = undefined;

  	if (dynamicAttrs.index !== undefined) {
  		dynamicAttrs = getValueWithIndex(valueItem, dynamicAttrs.index);
  		addDOMStaticAttributes(item, domNode, dynamicAttrs);
  		return;
  	}
  	for (var attrName in dynamicAttrs) {
  		if (!isVoid(attrName)) {
  			var attrVal = getValueWithIndex(valueItem, dynamicAttrs[attrName]);

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
  	if (styleUpdates) {
  		template.setCSS(item, domNode, styleUpdates);
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

  			for (var attrName in lastDynamicAttrs) {
  				template.removeProperty(null, domNode, attrName, true);
  			}
  			return;
  		}
  		addDOMStaticAttributes(nextItem, domNode, nextDynamicAttrs);
  		return;
  	}

  	/**
     * TODO: Benchmark areas that can be improved with caching.
     */
  	var styleUpdates = {};
  	var styleName = undefined;

  	for (var attrName in dynamicAttrs) {

  		var lastAttrVal = getValueWithIndex(lastItem, dynamicAttrs[attrName]);
  		var nextAttrVal = getValueWithIndex(nextItem, dynamicAttrs[attrName]);

  		if (!isVoid(lastAttrVal)) {

  			if (isVoid(nextAttrVal)) {
  				if (attrName === 'style') {
  					for (styleName in lastAttrVal) {
  						if (lastAttrVal[styleName] && (!nextAttrVal || !nextAttrVal[styleName])) {
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
  					if (nextAttrVal[styleName] && lastAttrVal[styleName] !== nextAttrVal[styleName]) {
  						styleUpdates[styleName] = nextAttrVal[styleName];
  					}
  				}
  			} else if (lastAttrVal !== nextAttrVal) {

  				if (fastPropSet(domNode, attrName, nextAttrVal) === false) {
  					if (propertyToEventType[attrName]) {
  						addListener(nextItem, domNode, propertyToEventType[attrName], nextAttrVal); // TODO! Write tests for this!
  					} else {
  							template.setProperty(null, domNode, attrName, nextAttrVal, true);
  						}
  				}
  			}
  		} else if (!isVoid(nextAttrVal)) {
  			if (attrName === 'style') {
  				styleUpdates = nextAttrVal;
  			} else {

  				if (fastPropSet(domNode, attrName, nextAttrVal) === false) {
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
  		template.setCSS(domNode, domNode, styleUpdates);
  	}
  }

  function recreateRootNode(lastItem, nextItem, node, treeLifecycle, context) {
  	var lastDomNode = lastItem.rootNode;
  	var lastTree = lastItem.domTree;

  	lastTree.remove(lastItem);
  	var domNode = node.create(nextItem, treeLifecycle, context);
  	var parentNode = lastDomNode.parentNode;

  	if (parentNode) {
  		parentNode.replaceChild(domNode, lastDomNode);
  	}
  	nextItem.rootNode = domNode;
  	return domNode;
  }

  var recyclingEnabled$1 = isRecyclingEnabled();

  function createRootNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item) {
  			var domNode = undefined;

  			if (recyclingEnabled$1) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (typeof value !== 'string' && typeof value !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  				}
  				domNode.textContent = value;
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				if (isVoid(nextValue)) {
  					if (isVoid(lastValue)) {
  						domNode.textContent = ' ';
  						domNode.firstChild.nodeValue = '';
  					} else {
  						domNode.textContent = '';
  					}
  				} else {
  					if (typeof nextValue !== 'string' && typeof nextValue !== 'number') {
  						throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
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
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function createNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
  	var domNode = undefined;

  	var node = {
  		create: function create(item) {
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (typeof value !== 'string' && typeof value !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  				}
  				domNode.textContent = value;
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, null);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				if (isVoid(nextValue)) {
  					if (isVoid(lastValue)) {
  						domNode.textContent = ' ';
  						domNode.firstChild.nodeValue = '';
  					} else {
  						domNode.textContent = '';
  					}
  				} else {
  					if (typeof nextValue !== 'string' && typeof nextValue !== 'number') {
  						throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
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
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  var recyclingEnabled$2 = isRecyclingEnabled();

  function createRootNodeWithStaticChild(templateNode, dynamicAttrs) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item) {
  			var domNode = undefined;

  			if (recyclingEnabled$2) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(true);
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function createNodeWithStaticChild(templateNode, dynamicAttrs) {
  	var domNode = undefined;
  	var node = {
  		create: function create(item) {
  			domNode = templateNode.cloneNode(true);
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, null);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  var recyclingEnabled$3 = isRecyclingEnabled();

  function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs) {
  	var keyedChildren = true;
  	var childNodeList = [];
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item, treeLifecycle, context) {
  			var domNode = undefined;

  			if (recyclingEnabled$3) {
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

  						if ((typeof childItem === 'undefined' ? 'undefined' : babelHelpers.typeof(childItem)) === 'object') {
  							var childNode = childItem.domTree.create(childItem, treeLifecycle, context);

  							if (childItem.key === undefined) {
  								keyedChildren = false;
  							}
  							childNodeList.push(childNode);
  							domNode.appendChild(childNode);
  						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
  							var textNode = document.createTextNode(childItem);

  							domNode.appendChild(textNode);
  							childNodeList.push(textNode);
  							keyedChildren = false;
  						}
  					}
  				} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
  					domNode.appendChild(value.domTree.create(value, treeLifecycle, context));
  				} else if (typeof value === 'string' || typeof value === 'number') {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			if (node !== lastItem.domTree) {
  				childNodeList = [];
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				if (typeof nextValue === 'string') {
  					domNode.firstChild.nodeValue = nextValue;
  				} else if (isVoid(nextValue)) {
  					if (domNode !== null) {
  						var childNode = document.createTextNode('');
  						var replaceNode = domNode.firstChild;

  						if (replaceNode) {
  							domNode.replaceChild(childNode, domNode.firstChild);
  						} else {
  							domNode.appendChild(childNode);
  						}
  					}
  				} else if (isArray(nextValue)) {
  					if (isArray(lastValue)) {
  						if (keyedChildren) {
  							updateKeyed(nextValue, lastValue, domNode, null, context);
  						} else {
  							updateNonKeyed(nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context);
  						}
  					} else {
  						// do nothing for now!
  					}
  				} else if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
  						var tree = nextValue.domTree;

  						if (!isVoid(tree)) {
  							if (!isVoid(lastValue)) {
  								if (!isVoid(lastValue.domTree)) {
  									tree.update(lastValue, nextValue, treeLifecycle, context);
  								} else {
  									recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  									return;
  								}
  							} else {
  								var childNode = tree.create(nextValue, treeLifecycle, context);

  								domNode.replaceChild(childNode, domNode.firstChild);
  							}
  						}
  					} else if (typeof nextValue === 'string' || typeof nextValue === 'number') {
  						domNode.firstChild.nodeValue = nextValue;
  					}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var value = getValueWithIndex(item, valueIndex);

  			removeValueTree(value, treeLifecycle);
  		}
  	};

  	return node;
  }

  function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs) {
  	var domNode = undefined;
  	var keyedChildren = true;
  	var childNodeList = [];
  	var node = {
  		create: function create(item, treeLifecycle, context) {
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (isArray(value)) {
  					for (var i = 0; i < value.length; i++) {
  						var childItem = value[i];

  						if ((typeof childItem === 'undefined' ? 'undefined' : babelHelpers.typeof(childItem)) === 'object') {
  							var childNode = childItem.domTree.create(childItem, treeLifecycle, context);

  							if (childItem.key === undefined) {
  								keyedChildren = false;
  							}
  							childNodeList.push(childNode);
  							domNode.appendChild(childNode);
  						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
  							var textNode = document.createTextNode(childItem);

  							domNode.appendChild(textNode);
  							childNodeList.push(textNode);
  							keyedChildren = false;
  						}
  					}
  				} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
  					domNode.appendChild(value.domTree.create(value, treeLifecycle, context));
  				} else if (typeof value === 'string' || typeof value === 'number') {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, null);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				if (typeof nextValue === 'string') {
  					domNode.firstChild.nodeValue = nextValue;
  				} else if (isVoid(nextValue)) {
  					var firstChild = domNode.firstChild;

  					if (firstChild) {
  						domNode.removeChild(domNode.firstChild);
  					}
  				} else if (isArray(nextValue)) {
  					if (isArray(lastValue)) {
  						if (keyedChildren) {
  							updateKeyed(nextValue, lastValue, domNode, null, treeLifecycle, context);
  						} else {
  							updateNonKeyed(nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context);
  						}
  					} else {
  						// debugger;
  					}
  				} else if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
  						var tree = nextValue.domTree;

  						if (!isVoid(tree)) {
  							if (lastValue.domTree !== null) {
  								tree.update(lastValue, nextValue, treeLifecycle, context);
  							} else {
  								// TODO implement
  							}
  						}
  					} else if (typeof nextValue === 'string' || typeof nextValue === 'number') {
  							domNode.firstChild.nodeValue = nextValue;
  						}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var value = getValueWithIndex(item, valueIndex);

  			removeValueTree(value, treeLifecycle);
  		}
  	};

  	return node;
  }

  var recyclingEnabled$4 = isRecyclingEnabled();

  function createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item, treeLifecycle, context) {
  			var domNode = undefined;

  			if (recyclingEnabled$4) {
  				domNode = recycle(node, item, treeLifecycle, context);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						domNode.appendChild(subTree.create(item, treeLifecycle, context));
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					domNode.appendChild(subTreeForChildren.create(item, treeLifecycle, context));
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			if (node !== lastItem.domTree) {
  				var newDomNode = recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);

  				nextItem.rootNode = newDomNode;
  				return newDomNode;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						subTree.update(lastItem, nextItem, treeLifecycle, context);
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					var newDomNode = subTreeForChildren.update(lastItem, nextItem, treeLifecycle, context);

  					if (newDomNode) {
  						var replaceNode = domNode.firstChild;

  						if (replaceNode) {
  							domNode.replaceChild(newDomNode, replaceNode);
  						} else {
  							domNode.appendChild(newDomNode);
  						}
  					}
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
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
  		}
  	};

  	return node;
  }

  function recreateRootNode$1(lastDomNode, nextItem, node, treeLifecycle, context) {
  	var domNode = node.create(nextItem, treeLifecycle, context);

  	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
  	// TODO recycle old node
  }

  function createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs) {
  	var domNode = undefined;
  	var node = {
  		create: function create(item, treeLifecycle, context) {
  			domNode = templateNode.cloneNode(false);
  			if (!isVoid(subTreeForChildren)) {
  				if (isArray(subTreeForChildren)) {
  					for (var i = 0; i < subTreeForChildren.length; i++) {
  						var subTree = subTreeForChildren[i];

  						domNode.appendChild(subTree.create(item, treeLifecycle, context));
  					}
  				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
  					domNode.appendChild(subTreeForChildren.create(item, treeLifecycle, context));
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, null);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode$1(domNode, nextItem, node, treeLifecycle, context);
  				return domNode;
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
  						var replaceNode = domNode.firstChild;

  						if (replaceNode) {
  							domNode.replaceChild(newDomNode, replaceNode);
  						} else {
  							domNode.appendChild(newDomNode);
  						}
  					}
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
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
  		}
  	};

  	return node;
  }

  var recyclingEnabled$5 = isRecyclingEnabled();

  function createRootStaticNode(templateNode) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item) {
  			var domNode = undefined;

  			if (recyclingEnabled$5) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(true);
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			nextItem.rootNode = lastItem.rootNode;
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function createStaticNode(templateNode) {
  	var domNode = undefined;
  	var node = {
  		create: function create() {
  			domNode = templateNode.cloneNode(true);
  			return domNode;
  		},
  		update: function update() {},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  var recyclingEnabled$6 = isRecyclingEnabled();

  function createRootDynamicNode(valueIndex) {
  	// let nextDomNode;
  	var childNodeList = [];
  	// let keyedChildren = true;
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item, treeLifecycle, context) {
  			var domNode = undefined;

  			if (recyclingEnabled$6) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			var value = getValueWithIndex(item, valueIndex);
  			var type = getTypeFromValue(value);

  			switch (type) {
  				case ValueTypes.TEXT:
  					// TODO check if string is empty?
  					if (isVoid(value)) {
  						value = '';
  					}
  					domNode = document.createTextNode(value);
  					break;
  				case ValueTypes.ARRAY:
  					var virtualList = createVirtualList(value, childNodeList, treeLifecycle, context);

  					domNode = virtualList.domNode;
  					// keyedChildren = virtualList.keyedChildren;
  					treeLifecycle.addTreeSuccessListener(function () {
  						// nextDomNode = childNodeList[ childNodeList.length - 1 ].nextSibling || null;
  					});
  					break;
  				case ValueTypes.TREE:
  					domNode = value.create(item, treeLifecycle, context);
  					break;
  				case ValueTypes.EMPTY_OBJECT:
  					throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
  				case ValueTypes.FUNCTION:
  					throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
  				case ValueTypes.FRAGMENT:
  					domNode = value.domTree.create(value, treeLifecycle, context);
  					break;
  				default:
  					break;
  			}

  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;

  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				var nextType = getTypeFromValue(nextValue);
  				var lastType = getTypeFromValue(lastValue);

  				if (lastType !== nextType) {
  					recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  					return;
  				}

  				switch (nextType) {
  					case ValueTypes.TEXT:
  						// TODO check if string is empty?
  						domNode.nodeValue = nextValue;
  						break;
  					case ValueTypes.ARRAY:
  						// TODO
  						break;
  					default:
  						break;
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var value = getValueWithIndex(item, valueIndex);

  			if (getTypeFromValue(value) === ValueTypes.TREE) {
  				value.remove(item, treeLifecycle);
  			}
  		}
  	};

  	return node;
  }

  var infernoBadTemplate$1 = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';

  function createDynamicNode(valueIndex) {
  	var domNode = undefined;
  	var childNodeList = [];
  	var keyedChildren = true;
  	var nextDomNode = undefined;

  	var node = {
  		create: function create(item, treeLifecycle, context) {
  			var value = getValueWithIndex(item, valueIndex);
  			var type = getTypeFromValue(value);

  			switch (type) {
  				case ValueTypes.TEXT:
  					// TODO check if string is empty?
  					if (isVoid(value)) {
  						value = '';
  					}
  					domNode = document.createTextNode(value);
  					break;
  				case ValueTypes.ARRAY:
  					var virtualList = createVirtualList(value, childNodeList, treeLifecycle, context);

  					domNode = virtualList.domNode;
  					keyedChildren = virtualList.keyedChildren;
  					treeLifecycle.addTreeSuccessListener(function () {
  						nextDomNode = childNodeList[childNodeList.length - 1].nextSibling || null;
  					});
  					break;
  				case ValueTypes.TREE:
  					domNode = value.create(item, treeLifecycle, context);
  					break;
  				case ValueTypes.EMPTY_OBJECT:
  					throw Error(infernoBadTemplate$1);
  				case ValueTypes.FUNCTION:
  					throw Error(infernoBadTemplate$1);
  				case ValueTypes.FRAGMENT:
  					domNode = value.domTree.create(value, treeLifecycle, context);
  					break;
  				default:
  					break;
  			}

  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var nextValue = getValueWithIndex(nextItem, valueIndex);
  			var lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				var nextType = getTypeFromValue(nextValue);
  				var lastType = getTypeFromValue(lastValue);

  				if (lastType !== nextType) {
  					recreateRootNode$1(domNode, nextItem, node, treeLifecycle, context);
  					return;
  				}

  				switch (nextType) {
  					case ValueTypes.TEXT:
  						// TODO check if string is empty?
  						if (isVoid(nextValue)) {
  							nextValue = '';
  						}
  						domNode.nodeValue = nextValue;
  						break;
  					case ValueTypes.ARRAY:
  						updateVirtualList(lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context);
  						break;
  					case ValueTypes.TREE:
  						// debugger;
  						break;
  					default:
  						break;
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			var value = getValueWithIndex(item, valueIndex);

  			if (getTypeFromValue(value) === ValueTypes.TREE) {
  				value.remove(item, treeLifecycle);
  			}
  		}
  	};

  	return node;
  }

  var recyclingEnabled$7 = isRecyclingEnabled();

  function createRootVoidNode(templateNode, dynamicAttrs) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item) {
  			var domNode = undefined;

  			if (recyclingEnabled$7) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(true);
  			item.rootNode = domNode;
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			nextItem.rootNode = lastItem.rootNode;
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function createVoidNode(templateNode, dynamicAttrs) {
  	var domNode = undefined;
  	var node = {
  		create: function create(item) {
  			domNode = templateNode.cloneNode(true);
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs, null);
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function updateComponent(component, prevState, nextState, prevProps, nextProps, renderCallback) {
  	if (!nextProps.children) {
  		nextProps.children = prevProps.children;
  	}

  	if (prevProps !== nextProps || prevState !== nextState) {
  		if (prevProps !== nextProps) {
  			component._blockRender = true;
  			component.componentWillReceiveProps(nextProps);
  			component._blockRender = false;
  		}
  		var shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);

  		if (shouldUpdate) {
  			component._blockSetState = true;
  			component.componentWillUpdate(nextProps, nextState);
  			component._blockSetState = false;
  			component.props = nextProps;
  			component.state = nextState;
  			var newDomNode = renderCallback();

  			component.componentDidUpdate(prevProps, prevState);
  			return newDomNode;
  		}
  	}
  }

  var recyclingEnabled$8 = isRecyclingEnabled();

  function createRootNodeWithComponent(componentIndex, props) {
  	var instance = undefined;
  	var lastRender = undefined;
  	var currentItem = undefined;
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item, treeLifecycle, context) {
  			var domNode = undefined;

  			if (recyclingEnabled$8) {
  				domNode = recycle(node, item, treeLifecycle, context);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			var Component = getValueWithIndex(item, componentIndex);

  			currentItem = item;
  			if (isVoid(Component)) {
  				// bad component, make a text node
  				domNode = document.createTextNode('');
  				item.rootNode = domNode;
  				return domNode;
  			} else if (typeof Component === 'function') {
  				// stateless component
  				if (!Component.prototype.render) {
  					var nextRender = Component(getValueForProps(props, item), context);

  					nextRender.parent = item;
  					domNode = nextRender.domTree.create(nextRender, treeLifecycle, context);
  					lastRender = nextRender;
  					item.rootNode = domNode;
  				} else {
  					instance = new Component(getValueForProps(props, item));
  					instance.context = context;
  					instance.componentWillMount();
  					var nextRender = instance.render();
  					var childContext = instance.getChildContext();

  					if (childContext) {
  						context = babelHelpers.extends({}, context, childContext);
  					}
  					nextRender.parent = item;
  					domNode = nextRender.domTree.create(nextRender, treeLifecycle, context);
  					item.rootNode = domNode;
  					lastRender = nextRender;
  					treeLifecycle.addTreeSuccessListener(instance.componentDidMount);
  					instance.forceUpdate = function () {
  						instance.context = context;
  						var nextRender = instance.render();
  						var childContext = instance.getChildContext();

  						if (childContext) {
  							context = babelHelpers.extends({}, context, childContext);
  						}
  						nextRender.parent = currentItem;
  						nextRender.domTree.update(lastRender, nextRender, treeLifecycle, context);
  						currentItem.rootNode = nextRender.rootNode;
  						lastRender = nextRender;
  					};
  				}
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var Component = getValueWithIndex(nextItem, componentIndex);

  			currentItem = nextItem;
  			if (!Component) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  				return;
  			}
  			if (typeof Component === 'function') {
  				if (!Component.prototype.render) {
  					var nextRender = Component(getValueForProps(props, nextItem), context);

  					nextRender.parent = currentItem;
  					var newDomNode = nextRender.domTree.update(lastRender, nextRender, treeLifecycle, context);

  					if (newDomNode) {
  						if (nextRender.rootNode.parentNode) {
  							nextRender.rootNode.parentNode.replaceChild(newDomNode, nextRender.rootNode);
  						} else {
  							lastItem.rootNode.parentNode.replaceChild(newDomNode, lastItem.rootNode);
  						}
  						currentItem.rootNode = newDomNode;
  					} else {
  						currentItem.rootNode = nextRender.rootNode;
  					}

  					lastRender = nextRender;
  				} else {
  					if (!instance || node !== lastItem.domTree || Component !== instance.constructor) {
  						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
  						return;
  					}
  					var domNode = lastItem.rootNode;
  					var prevProps = instance.props;
  					var prevState = instance.state;
  					var nextState = instance.state;
  					var nextProps = getValueForProps(props, nextItem);

  					nextItem.rootNode = domNode;
  					updateComponent(instance, prevState, nextState, prevProps, nextProps, instance.forceUpdate);
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			if (instance) {
  				lastRender.domTree.remove(lastRender, treeLifecycle);
  				instance.componentWillUnmount();
  			}
  		}
  	};

  	return node;
  }

  function createNodeWithComponent(componentIndex, props) {
  	var instance = undefined;
  	var lastRender = undefined;
  	var domNode = undefined;
  	var currentItem = undefined;
  	var node = {
  		create: function create(item, treeLifecycle, context) {
  			var valueItem = getCorrectItemForValues(node, item);
  			var Component = getValueWithIndex(valueItem, componentIndex);

  			currentItem = item;
  			if (isVoid(Component)) {
  				domNode = document.createTextNode('');
  				return domNode;
  			} else if (typeof Component === 'function') {
  				// stateless component
  				if (!Component.prototype.render) {
  					var nextRender = Component(getValueForProps(props, valueItem), context);

  					nextRender.parent = item;
  					domNode = nextRender.domTree.create(nextRender, treeLifecycle, context);
  					lastRender = nextRender;
  				} else {
  					instance = new Component(getValueForProps(props, valueItem));
  					instance.context = context;
  					instance.componentWillMount();
  					var nextRender = instance.render();
  					var childContext = instance.getChildContext();

  					if (childContext) {
  						context = babelHelpers.extends({}, context, childContext);
  					}
  					nextRender.parent = item;
  					domNode = nextRender.domTree.create(nextRender, treeLifecycle, context);
  					lastRender = nextRender;
  					treeLifecycle.addTreeSuccessListener(instance.componentDidMount);
  					instance.forceUpdate = function () {
  						instance.context = context;
  						var nextRender = instance.render();
  						var childContext = instance.getChildContext();

  						if (childContext) {
  							context = babelHelpers.extends({}, context, childContext);
  						}
  						nextRender.parent = currentItem;
  						var newDomNode = nextRender.domTree.update(lastRender, nextRender, treeLifecycle, context);

  						if (newDomNode) {
  							domNode = newDomNode;
  							lastRender.rootNode = domNode;
  							lastRender = nextRender;
  							return domNode;
  						} else {
  							lastRender = nextRender;
  						}
  					};
  				}
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle, context) {
  			var Component = getValueWithIndex(nextItem, componentIndex);

  			currentItem = nextItem;
  			if (!Component) {
  				recreateRootNode$1(domNode, nextItem, node, treeLifecycle, context);
  				lastRender.rootNode = domNode;
  				return domNode;
  			}
  			if (typeof Component === 'function') {
  				// stateless component
  				if (!Component.prototype.render) {
  					var nextRender = Component(getValueForProps(props, nextItem), context);

  					nextRender.parent = currentItem;
  					var newDomNode = nextRender.domTree.update(lastRender, nextRender, treeLifecycle, context);

  					if (newDomNode) {
  						domNode = newDomNode;
  						lastRender.rootNode = domNode;
  						lastRender = nextRender;
  						return domNode;
  					} else {
  						lastRender = nextRender;
  					}
  				} else {
  					if (!instance || Component !== instance.constructor) {
  						recreateRootNode$1(domNode, nextItem, node, treeLifecycle, context);
  						return domNode;
  					}
  					var prevProps = instance.props;
  					var prevState = instance.state;
  					var nextState = instance.state;
  					var nextProps = getValueForProps(props, nextItem);

  					return updateComponent(instance, prevState, nextState, prevProps, nextProps, instance.forceUpdate);
  				}
  			}
  		},
  		remove: function remove(item, treeLifecycle) {
  			if (instance) {
  				lastRender.domTree.remove(lastRender, treeLifecycle);
  				instance.componentWillUnmount();
  			}
  		}
  	};

  	return node;
  }

  var recyclingEnabled$9 = isRecyclingEnabled();

  function createRootDynamicTextNode(templateNode, valueIndex) {
  	var node = {
  		pool: [],
  		keyedPool: [],
  		create: function create(item) {
  			var domNode = undefined;

  			if (recyclingEnabled$9) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (typeof value !== 'string' && typeof value !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  				}
  				domNode.nodeValue = value;
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update: function update(lastItem, nextItem, treeLifecycle) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
  				return;
  			}
  			var domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			var nextValue = getValueWithIndex(nextItem, valueIndex);

  			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
  				if (typeof nextValue !== 'string' && typeof nextValue !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  				}
  				domNode.nodeValue = nextValue;
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  function createDynamicTextNode(templateNode, valueIndex) {
  	var domNode = undefined;

  	var node = {
  		create: function create(item) {
  			domNode = templateNode.cloneNode(false);
  			var value = getValueWithIndex(item, valueIndex);

  			if (!isVoid(value)) {
  				if (typeof value !== 'string' && typeof value !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  				}
  				domNode.nodeValue = value;
  			}
  			return domNode;
  		},
  		update: function update(lastItem, nextItem) {
  			var nextValue = getValueWithIndex(nextItem, valueIndex);

  			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
  				if (typeof nextValue !== 'string' && typeof nextValue !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  				}
  				domNode.nodeValue = nextValue;
  			}
  		},
  		remove: function remove() /* lastItem */{}
  	};

  	return node;
  }

  var invalidTemplateError = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';

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

  			if (typeof childItem === 'string' || typeof childItem === 'number') {
  				var textNode = document.createTextNode(childItem);

  				parentNode.appendChild(textNode);
  			} else {
  				createStaticTreeNode(childItem, parentNode, domNamespace);
  			}
  		}
  	} else {
  		if (typeof children === 'string' || typeof children === 'number') {
  			parentNode.textContent = children;
  		} else {
  			createStaticTreeNode(children, parentNode, domNamespace);
  		}
  	}
  }

  function createStaticTreeNode(node, parentNode, domNamespace) {
  	var staticNode = undefined;

  	if (isVoid(node)) {
  		return null;
  	}
  	if (typeof node === 'string' || typeof node === 'number') {
  		staticNode = document.createTextNode(node);
  	} else {
  		var tag = node.tag;

  		if (tag) {
  			var namespace = node.attrs && node.attrs.xmlns || null;
  			var is = node.attrs && node.attrs.is || null;

  			if (!namespace) {
  				switch (tag) {
  					case 'svg':
  						domNamespace = 'http://www.w3.org/2000/svg';
  						break;
  					case 'math':
  						domNamespace = 'http://www.w3.org/1998/Math/MathML';
  						break;
  					default:
  						break;
  				}
  			} else {
  				domNamespace = namespace;
  			}
  			if (domNamespace) {
  				if (is) {
  					staticNode = document.createElementNS(domNamespace, tag, is);
  				} else {
  					staticNode = document.createElementNS(domNamespace, tag);
  				}
  			} else {
  				if (is) {
  					staticNode = document.createElement(tag, is);
  				} else {
  					staticNode = document.createElement(tag);
  				}
  			}
  			var text = node.text;
  			var children = node.children;

  			if (!isVoid(text)) {
  				if (!isVoid(children)) {
  					throw Error(invalidTemplateError);
  				}
  				if (typeof text !== 'string' && typeof text !== 'number') {
  					throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
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
  	if (staticNode === undefined) {
  		throw Error(invalidTemplateError);
  	}
  	if (parentNode === null) {
  		return staticNode;
  	} else {
  		parentNode.appendChild(staticNode);
  	}
  }

  function createDOMTree(schema, isRoot, dynamicNodeMap, domNamespace) {
  	var dynamicFlags = dynamicNodeMap.get(schema);
  	var node = undefined;
  	var templateNode = undefined;

  	if (isVoid(schema)) {
  		throw Error(invalidTemplateError);
  	}
  	if (isArray(schema)) {
  		throw Error(invalidTemplateError);
  	}
  	if (!dynamicFlags) {
  		templateNode = createStaticTreeNode(schema, null, domNamespace, schema);

  		if (!templateNode) {
  			throw Error(invalidTemplateError);
  		}

  		if (isRoot) {
  			node = createRootStaticNode(templateNode);
  		} else {
  			node = createStaticNode(templateNode);
  		}
  	} else {
  		if (dynamicFlags.NODE === true) {
  			if (isRoot) {
  				node = createRootDynamicNode(schema.index, domNamespace);
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
  					var _children = null;

  					if (schema.children) {
  						if (isArray(schema.children) && schema.children.length > 1) {
  							_attrs.children = [];
  							for (var i = 0; i < schema.children.length; i++) {
  								var childNode = schema.children[i];

  								_attrs.children.push(createDOMTree(childNode, false, dynamicNodeMap, domNamespace));
  							}
  						} else {
  							if (isArray(schema.children) && schema.children.length === 1) {
  								_attrs.children = createDOMTree(schema.children[0], false, dynamicNodeMap, domNamespace);
  							} else {
  								_attrs.children = createDOMTree(schema.children, false, dynamicNodeMap, domNamespace);
  							}
  						}
  					}
  					if (isRoot) {
  						return createRootNodeWithComponent(tag.index, _attrs, _children, domNamespace);
  					} else {
  						return createNodeWithComponent(tag.index, _attrs, _children, domNamespace);
  					}
  				}
  				var namespace = schema.attrs && schema.attrs.xmlns || null;
  				var is = schema.attrs && schema.attrs.is || null;

  				if (!namespace) {
  					switch (tag) {
  						case 'svg':
  							domNamespace = 'http://www.w3.org/2000/svg';
  							break;
  						case 'math':
  							domNamespace = 'http://www.w3.org/1998/Math/MathML';
  							break;
  						default:
  							break;
  					}
  				} else {
  					domNamespace = namespace;
  				}
  				if (domNamespace) {
  					if (is) {
  						templateNode = document.createElementNS(domNamespace, tag, is);
  					} else {
  						templateNode = document.createElementNS(domNamespace, tag);
  					}
  				} else {
  					if (is) {
  						templateNode = document.createElement(tag, is);
  					} else {
  						templateNode = document.createElement(tag);
  					}
  				}
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
  					if (!isVoid(children)) {
  						throw Error('Inferno Error: Template nodes cannot contain both TEXT and a CHILDREN properties, they must only use one or the other.');
  					}
  					if (dynamicFlags.TEXT === true) {
  						if (isRoot) {
  							node = createRootNodeWithDynamicText(templateNode, text.index, dynamicAttrs);
  						} else {
  							node = createNodeWithDynamicText(templateNode, text.index, dynamicAttrs);
  						}
  					} else {
  						if (typeof text === 'string' || typeof text === 'number') {
  							templateNode.textContent = text;
  						} else {
  							throw Error('Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.');
  						}
  						if (isRoot) {
  							node = createRootNodeWithStaticChild(templateNode, dynamicAttrs);
  						} else {
  							node = createNodeWithStaticChild(templateNode, dynamicAttrs);
  						}
  					}
  				} else {
  					if (!isVoid(children)) {
  						if (children.type === ObjectTypes.VARIABLE) {
  							if (isRoot) {
  								node = createRootNodeWithDynamicChild(templateNode, children.index, dynamicAttrs, domNamespace);
  							} else {
  								node = createNodeWithDynamicChild(templateNode, children.index, dynamicAttrs, domNamespace);
  							}
  						} else if (dynamicFlags.CHILDREN === true) {
  							var subTreeForChildren = [];

  							if (isArray(children)) {
  								for (var i = 0; i < children.length; i++) {
  									var childItem = children[i];

  									subTreeForChildren.push(createDOMTree(childItem, false, dynamicNodeMap, domNamespace));
  								}
  							} else if ((typeof children === 'undefined' ? 'undefined' : babelHelpers.typeof(children)) === 'object') {
  								subTreeForChildren = createDOMTree(children, false, dynamicNodeMap, domNamespace);
  							}
  							if (isRoot) {
  								node = createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace);
  							} else {
  								node = createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace);
  							}
  						} else if (typeof children === 'string' || typeof children === 'number') {
  							templateNode.textContent = children;
  							if (isRoot) {
  								node = createRootNodeWithStaticChild(templateNode, dynamicAttrs);
  							} else {
  								node = createNodeWithStaticChild(templateNode, dynamicAttrs);
  							}
  						} else {
  							var childNodeDynamicFlags = dynamicNodeMap.get(children);

  							if (!childNodeDynamicFlags) {
  								createStaticTreeChildren(children, templateNode, domNamespace);

  								if (isRoot) {
  									node = createRootNodeWithStaticChild(templateNode, dynamicAttrs);
  								} else {
  									node = createNodeWithStaticChild(templateNode, dynamicAttrs);
  								}
  							}
  						}
  					} else {
  						if (isRoot) {
  							node = createRootVoidNode(templateNode, dynamicAttrs);
  						} else {
  							node = createVoidNode(templateNode, dynamicAttrs);
  						}
  					}
  				}
  			} else if (text) {
  				templateNode = document.createTextNode('');
  				if (isRoot) {
  					node = createRootDynamicTextNode(templateNode, text.index);
  				} else {
  					node = createDynamicTextNode(templateNode, text.index);
  				}
  			}
  		}
  	}
  	return node;
  }

  function createHTMLStringTree() {}

  function scanTreeForDynamicNodes(node, nodeMap) {
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

  	if (node.type === ObjectTypes.VARIABLE) {
  		nodeIsDynamic = true;
  		dynamicFlags.NODE = true;
  	} else {
  		if (!isVoid(node)) {
  			if (!isVoid(node.tag)) {
  				if (node.tag.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.COMPONENTS = true;
  				}
  			}
  			if (!isVoid(node.text)) {
  				if (node.text.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.TEXT = true;
  				}
  			}
  			if (!isVoid(node.attrs)) {
  				if (node.attrs.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.ATTRS = true;
  				} else {
  					for (var attr in node.attrs) {

  						var attrVal = node.attrs[attr];

  						if (!isVoid(attrVal) && attrVal.type === ObjectTypes.VARIABLE) {
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
  				if (node.children.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  				} else {
  					if (isArray(node.children)) {
  						for (var i = 0; i < node.children.length; i++) {
  							var childItem = node.children[i];
  							var result = scanTreeForDynamicNodes(childItem, nodeMap);

  							if (result === true) {
  								nodeIsDynamic = true;
  								dynamicFlags.CHILDREN = true;
  							}
  						}
  					} else if ((typeof node === 'undefined' ? 'undefined' : babelHelpers.typeof(node)) === 'object') {
  						var result = scanTreeForDynamicNodes(node.children, nodeMap);

  						if (result === true) {
  							nodeIsDynamic = true;
  							dynamicFlags.CHILDREN = true;
  						}
  					}
  				}
  			}
  			if (!isVoid(node.key)) {
  				if (node.key.type === ObjectTypes.VARIABLE) {
  					nodeIsDynamic = true;
  					dynamicFlags.KEY = true;
  				}
  			}
  		}
  	}
  	if (nodeIsDynamic === true) {
  		nodeMap.set(node, dynamicFlags);
  	}
  	return nodeIsDynamic;
  }

  function createTemplate(callback) {
  	var construct = callback.construct;

  	if (!construct) {
  		(function () {
  			var callbackLength = callback.length;
  			var callbackArguments = new Array(callbackLength);

  			for (var i = 0; i < callbackLength; i++) {
  				callbackArguments[i] = createVariable(i);
  			}
  			var schema = callback.apply(undefined, callbackArguments);
  			var dynamicNodeMap = new Map();

  			scanTreeForDynamicNodes(schema, dynamicNodeMap);
  			var domTree = createDOMTree(schema, true, dynamicNodeMap);
  			var htmlStringTree = createHTMLStringTree(schema, true, dynamicNodeMap);
  			var key = schema.key;
  			var keyIndex = key ? key.index : -1;

  			switch (callbackLength) {
  				case 0:
  					construct = function () {
  						return {
  							parent: null,
  							domTree: domTree,
  							htmlStringTree: htmlStringTree,
  							key: null,
  							nextItem: null,
  							rootNode: null
  						};
  					};
  					break;
  				case 1:
  					construct = function (v0) {
  						var key = undefined;

  						if (keyIndex === 0) {
  							key = v0;
  						}
  						return {
  							parent: null,
  							domTree: domTree,
  							htmlStringTree: htmlStringTree,
  							key: key,
  							nextItem: null,
  							rootNode: null,
  							v0: v0
  						};
  					};
  					break;
  				case 2:
  					construct = function (v0, v1) {
  						var key = undefined;

  						if (keyIndex === 0) {
  							key = v0;
  						} else if (keyIndex === 1) {
  							key = v1;
  						}
  						return {
  							parent: null,
  							domTree: domTree,
  							htmlStringTree: htmlStringTree,
  							key: key,
  							nextItem: null,
  							rootNode: null,
  							v0: v0,
  							v1: v1
  						};
  					};
  					break;
  				default:
  					construct = function (v0, v1) {
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
  							parent: null,
  							domTree: domTree,
  							htmlStringTree: htmlStringTree,
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
  			callback.construct = construct;
  		})();
  	}
  	return construct;
  }

  function applyState(component) {
  	var blockRender = component._blockRender;

  	requestAnimationFrame(function () {
  		if (component._deferSetState === false) {
  			component._pendingSetState = false;
  			var pendingState = component._pendingState;
  			var oldState = component.state;
  			var nextState = babelHelpers.extends({}, oldState, pendingState);

  			component._pendingState = {};
  			component._pendingSetState = false;
  			updateComponent(component, oldState, nextState, component.props, component.props, component.forceUpdate, blockRender);
  		} else {
  			applyState(component);
  		}
  	});
  }

  function queueStateChanges(component, newState) {
  	for (var stateKey in newState) {
  		component._pendingState[stateKey] = newState[stateKey];
  	}
  	if (component._pendingSetState === false) {
  		component._pendingSetState = true;
  		applyState(component);
  	}
  }

  var Component = (function () {
  	function Component(props /* , context */) {
  		babelHelpers.classCallCheck(this, Component);

  		this.props = props || {};
  		this._blockRender = false;
  		this._blockSetState = false;
  		this._deferSetState = false;
  		this._pendingSetState = false;
  		this._pendingState = {};
  		this._componentTree = [];
  		this.state = {};
  		this.context = {};
  	}

  	babelHelpers.createClass(Component, [{
  		key: 'render',
  		value: function render() {}
  	}, {
  		key: 'forceUpdate',
  		value: function forceUpdate() {}
  	}, {
  		key: 'setState',
  		value: function setState(newState /* , callback */) {
  			// TODO the callback
  			if (this._blockSetState === false) {
  				queueStateChanges(this, newState);
  			} else {
  				throw Error('Inferno Error: Cannot update state via setState() in componentWillUpdate()');
  			}
  		}
  	}, {
  		key: 'componentDidMount',
  		value: function componentDidMount() {}
  	}, {
  		key: 'componentWillMount',
  		value: function componentWillMount() {}
  	}, {
  		key: 'componentWillUnmount',
  		value: function componentWillUnmount() {}
  	}, {
  		key: 'componentDidUpdate',
  		value: function componentDidUpdate() {}
  	}, {
  		key: 'shouldComponentUpdate',
  		value: function shouldComponentUpdate() {
  			return true;
  		}
  	}, {
  		key: 'componentWillReceiveProps',
  		value: function componentWillReceiveProps() {}
  	}, {
  		key: 'componentWillUpdate',
  		value: function componentWillUpdate() {}
  	}, {
  		key: 'getChildContext',
  		value: function getChildContext() {}
  	}]);
  	return Component;
  })();

  var index = {
  	Component: Component,
  	createTemplate: createTemplate,
  	TemplateFactory: TemplateFactory,
  	render: render,
  	renderToString: renderToString,
  	createRef: createRef
  };

  return index;

}));
//# sourceMappingURL=inferno.js.map