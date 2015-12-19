/*!
 * Inferno v0.4.0
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

    function recycle(tree, item) {
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
    		tree.update(recyclableItem, item);
    		return item.rootNode;
    	}
    }

    function isRecyclingEnabled() {
    	return recyclingEnabled$10;
    }

    var recyclingEnabled = isRecyclingEnabled();

    function updateKeyed(items, oldItems, parentNode, parentNextNode, treeLifecycle) {
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
    			startItem.domTree.update(oldStartItem, startItem, treeLifecycle);
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
    			endItem.domTree.update(oldEndItem, endItem, treeLifecycle);
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
    			endItem.domTree.update(oldStartItem, endItem, treeLifecycle);
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
    			startItem.domTree.update(oldEndItem, startItem, treeLifecycle);
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
    				insertOrAppend(parentNode, item.domTree.create(item, treeLifecycle), nextNode);
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
    				item.domTree.update(oldItem, item, treeLifecycle);
    				// TODO optimise
    				if (item.rootNode.nextSibling != (nextItem && nextItem.rootNode)) {
    					nextNode = nextItem && nextItem.rootNode || parentNextNode;
    					insertOrAppend(parentNode, item.rootNode, nextNode);
    				}
    			} else {
    				nextNode = nextItem && nextItem.rootNode || parentNextNode;
    				insertOrAppend(parentNode, item.domTree.create(item, treeLifecycle), nextNode);
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

    function createDOMFragment(parentNode, nextNode) {
    	var lastItem = undefined;
    	var treeSuccessListeners = [];
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

    			if (lastItem) {
    				tree.update(lastItem, nextItem, treeLifecycle);
    			} else {
    				var dom = tree.create(nextItem, treeLifecycle);

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
    			var tree = lastItem.domTree;
    			if (lastItem) {
    				tree.remove(lastItem, treeLifecycle);
    			}
    			remove(lastItem, parentNode);
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

    function renderToString(nextItem) {
    	// TODO
    }

    var isArray = (function (x) {
      return x.constructor === Array;
    })

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

    var ObjectTypes = {
    	VARIABLE: 1
    };

    var ValueTypes = {
    	TEXT: 0,
    	ARRAY: 1,
    	TREE: 21
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

    function getTypeFromValue(value) {
    	if (typeof value === 'string' || typeof value === 'number' || value === undefined) {
    		return ValueTypes.TEXT;
    	} else if (isArray(value)) {
    		return ValueTypes.ARRAY;
    	} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.create) {
    		return ValueTypes.TREE;
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

    var PROPERTY = 0x1;
    var BOOLEAN = 0x2;
    var NUMERIC_VALUE = 0x4;
    var POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;

    var xlink = 'http://www.w3.org/1999/xlink';
    var xml = 'http://www.w3.org/XML/1998/namespace';

    var DOMAttributeNamespaces = {
      'xlink:actuate': xlink,
      'xlink:arcrole': xlink,
      'xlink:href': xlink,
      'xlink:role': xlink,
      'xlink:show': xlink,
      'xlink:title': xlink,
      'xlink:type': xlink,
      'xml:base': xml,
      'xml:lang': xml,
      'xml:space': xml
    };

    var DOMAttributeNames = {
      acceptCharset: 'accept-charset',
      className: 'class',
      htmlFor: 'for',
      httpEquiv: 'http-equiv',
      xlinkActuate: 'xlink:actuate',
      xlinkArcrole: 'xlink:arcrole',
      xlinkHref: 'xlink:href',
      xlinkRole: 'xlink:role',
      xlinkShow: 'xlink:show',
      xlinkTitle: 'xlink:title',
      xlinkType: 'xlink:type',
      xmlBase: 'xml:base',
      xmlLang: 'xml:lang',
      xmlSpace: 'xml:space',
      viewBox: 'viewBox' // SVG - Edge case. The letter 'b' need to be uppercase
    };

    var DOMPropertyNames = {
      autoComplete: 'autocomplete',
      autoFocus: 'autofocus',
      autoPlay: 'autoplay',
      autoSave: 'autosave',
      hrefLang: 'hreflang',
      radioGroup: 'radiogroup',
      spellCheck: 'spellcheck',
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
      draggable: BOOLEAN, // 3.2.5 - Global attributes
      dropzone: null, // 3.2.5 - Global attributes
      scoped: BOOLEAN,
      visible: BOOLEAN,
      trueSpeed: BOOLEAN,
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
      spellcheck: null // 3.2.5 - Global attributes
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

    function inArray(arr, item) {
        var len = arr.length;
        var i = 0;

        while (i < len) {
            if (arr[i++] == item) {
                return true;
            }
        }

        return false;
    }

    // TODO!! Optimize!!
    function setSelectValueForProperty(vNode, domNode, value, useProperties) {
    	var isMultiple = isArray(value);
    	var options = domNode.options;
    	var len = options.length;

    	var i = 0,
    	    optionNode = undefined;
    	while (i < len) {
    		optionNode = options[i++];
    		if (useProperties) {
    			optionNode.selected = value != null && (isMultiple ? inArray(value, optionNode.value) : optionNode.value === value);
    		} else {
    			if (value != null && (isMultiple ? inArray(value, optionNode.value) : optionNode.value === value)) {
    				optionNode.setAttribute('selected', 'selected');
    			} else {
    				optionNode.removeAttribute('selected');
    			}
    		}
    	}
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
                if (value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && value !== value || propertyInfo.hasPositiveNumericValue && value < 1 || value.length === 0) {
                    template.removeProperty(vNode, domNode, name, useProperties);
                } else {
                    var propName = propertyInfo.propertyName;

                    if (propertyInfo.mustUseProperty) {
                        if (propName === 'value' && vNode.tag === 'select') {
                            setSelectValueForProperty(vNode, domNode, value, useProperties);
                        } else if ('' + domNode[propName] !== '' + value) {
                            if (useProperties) {
                                domNode[propName] = value;
                            } else {
                                if (propertyInfo.hasBooleanValue && value === true) {
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
            } else if (value == null) {
                domNode.removeAttribute(name);
            } else if (name) {
                domNode.setAttribute(name, value);
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
                    if (propertyInfo.hasBooleanValue) {
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

    function InfernoNodeID(node, get) {
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

    var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

    /**
     * Simple, lightweight module assisting with the detection and context of
     * Worker. Helps avoid circular dependencies and allows code to reason about
     * whether or not they are in a Worker, even if they never include the main
     * `ReactWorker` dependency.
     */
    var ExecutionEnvironment = {

      canUseDOM: canUseDOM,

      canUseWorkers: typeof Worker !== 'undefined',

      canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

      canUseViewport: canUseDOM && !!window.screen,

      isInWorker: !canUseDOM // For now, this is true - might change in the future.

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
    			EventRegistry[type]._focusBlur = nativeFocus ? function () {
    				var _type = this._type;
    				var handler = setHandler(_type, function (e) {
    					addRootListener(e, _type);
    				}).handler;
    				document.addEventListener(focusEvents[_type], handler);
    			}
    			// firefox doesn't support focusin/focusout events
    			: function () {
    				var _type = this._type;
    				document.addEventListener(_type, setHandler(_type, addRootListener).handler, true);
    			};
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
    	var option = undefined;
    	var options = node.options;
    	var length = options.length;
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
    		if (nodeID = InfernoNodeID(target, true)) {
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
    		var listener = listenersStorage[InfernoNodeID(target)][type];
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
    		var nodeID = InfernoNodeID(domNode),
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

    var unitlessProps = {
    	flex: true,
    	base: true,
    	zoom: true,
    	order: true,
    	marker: true,
    	stress: true,
    	volume: true,
    	widows: true,
    	zIndex: true,
    	boxFlex: true,
    	gridRow: true,
    	opacity: true,
    	orphans: true,
    	tabSize: true,
    	flexGrow: true,
    	richness: true,
    	flexOrder: true,
    	lineClamp: true,
    	msBoxFlex: true,
    	flexShrink: true,
    	fontWeight: true,
    	gridColumn: true,
    	lineHeight: true,
    	pitchRange: true,
    	MozBoxFlex: true,
    	columnCount: true,
    	stopOpacity: true,
    	fillOpacity: true,
    	strokeWidth: true,
    	boxFlexGroup: true,
    	counterReset: true,
    	flexPositive: true,
    	flexNegative: true,
    	strokeOpacity: true,
    	WebkitBoxFlex: true,
    	WebkitGridRow: true,
    	WebkitFlexGrow: true,
    	boxOrdinalGroup: true,
    	WebkitFlexShrink: true,
    	counterIncrement: true,
    	strokeDashoffset: true,
    	WebkitStrokeWidth: true,
    	MozBoxOrdinalGroup: true,
    	WebkitBoxOrdinalGroup: true,
    	animationIterationCount: true,
    	WebkitAnimationIterationCount: true
    };

    var unitlessProperties = (function (str) {
    	return str in unitlessProps;
    })

    /**
     * Normalize CSS properties for SSR
     *
     * @param {String} name The boolean attribute name to set.
     * @param {String} value The boolean attribute value to set.
     */
    var addPixelSuffixToValueIfNeeded = (function (name, value) {
    	if (value === null || value === '') {
    		return '';
    	}

    	if (value === 0 || unitlessProperties(name)) {
    		return '' + value; // cast to string
    	}

    	if (isNaN(value)) {
    		return '' + value; // cast to string
    	}

    	if (typeof value === 'string') {
    		value = value.trim();
    	}
    	return value + 'px';
    })

    /**
     * Sets the value for multiple styles on a node. If a value is specified as
     * '' (empty string), the corresponding style property will be unset.
     *
     * @param {DOMElement} node
     * @param {object} styles
     */
    var setValueForStyles = (function (vNode, domNode, styles) {
      for (var styleName in styles) {
        var styleValue = styles[styleName];

        domNode.style[styleName] = styleValue == null ? '' : addPixelSuffixToValueIfNeeded(styleName, styleValue);
      }
    })

    /**
     * Set HTML attributes on the template
     * @param{ HTMLElement } node
     * @param{ Object } attrs
     */
    function addDOMStaticAttributes(vNode, domNode, attrs) {

    	var styleUpdates = undefined;

    	for (var attrName in attrs) {
    		var _attrVal = attrs[attrName];

    		if (_attrVal) {
    			if (attrName === 'style') {

    				styleUpdates = _attrVal;
    			} else {
    				template.setProperty(vNode, domNode, attrName, _attrVal, false);
    			}
    		}
    	}

    	if (styleUpdates) {
    		setValueForStyles(vNode, domNode, styleUpdates);
    	}
    }

    // A fast className setter as its the most common property to regularly change
    function fastPropSet(attrName, attrVal, domNode) {
    	if (attrName === 'class' || attrName === 'className') {
    		if (attrVal != null) {
    			domNode.className = attrVal;
    		}
    		return true;
    	}
    	return false;
    }

    function addDOMDynamicAttributes(item, domNode, dynamicAttrs) {
    	if (dynamicAttrs.index !== undefined) {
    		dynamicAttrs = getValueWithIndex(item, dynamicAttrs.index);
    		addDOMStaticAttributes(item, domNode, dynamicAttrs);
    		return;
    	}

    	var styleUpdates = undefined;

    	for (var attrName in dynamicAttrs) {
    		var _attrVal2 = getValueWithIndex(item, dynamicAttrs[attrName]);

    		if (_attrVal2 !== undefined) {

    			if (attrName === 'style') {

    				styleUpdates = _attrVal2;
    			} else {

    				if (fastPropSet(attrName, _attrVal2, domNode) === false) {
    					if (propertyToEventType[attrName]) {
    						addListener(item, domNode, propertyToEventType[attrName], _attrVal2);
    					} else {
    						template.setProperty(item, domNode, attrName, _attrVal2, true);
    					}
    				}
    			}
    		}
    	}

    	if (styleUpdates) {
    		setValueForStyles(item, domNode, styleUpdates);
    	}
    }

    function updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs) {
    	if (dynamicAttrs.index !== undefined) {
    		var nextDynamicAttrs = getValueWithIndex(nextItem, dynamicAttrs.index);
    		addDOMStaticAttributes(nextItem, domNode, nextDynamicAttrs);
    		return;
    	}

    	var styleUpdates = undefined;

    	for (var attrName in dynamicAttrs) {
    		var lastAttrVal = getValueWithIndex(lastItem, dynamicAttrs[attrName]);
    		var nextAttrVal = getValueWithIndex(nextItem, dynamicAttrs[attrName]);

    		if (lastAttrVal !== nextAttrVal) {
    			if (nextAttrVal !== undefined) {

    				if (attrName === 'style') {

    					styleUpdates = attrVal;
    				} else {

    					if (fastPropSet(attrName, nextAttrVal, domNode) === false) {
    						if (propertyToEventType[attrName]) {
    							addListener(nextItem, domNode, propertyToEventType[attrName], nextAttrVal);
    						} else {
    							template.setProperty(nextItem, domNode, attrName, nextAttrVal, true);
    						}
    					}
    				}
    			}
    		}
    	}

    	if (styleUpdates) {
    		setValueForStyles(vNode, domNode, styleUpdates);
    	}
    }

    function recreateRootNode(lastItem, nextItem, node, treeLifecycle) {
    	var lastDomNode = lastItem.rootNode;
    	var lastTree = lastItem.domTree;
    	lastTree.remove(lastItem);
    	var domNode = node.create(nextItem, treeLifecycle);
    	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
    	// TODO recycle old node
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

    			if (value != null) {
    				domNode.textContent = value;
    			}
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
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
    				domNode.firstChild.nodeValue = nextValue;
    			}
    			if (dynamicAttrs) {
    				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
    			}
    		},
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function createNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
    	var domNode;

    	var node = {
    		create: function create(item) {
    			domNode = templateNode.cloneNode(false);
    			var value = getValueWithIndex(item, valueIndex);

    			if (value != null) {
    				domNode.textContent = value;
    			}
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem) {
    			var nextValue = getValueWithIndex(nextItem, valueIndex);

    			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
    				domNode.firstChild.nodeValue = nextValue;
    			}
    			if (dynamicAttrs) {
    				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
    			}
    		},
    		remove: function remove(lastItem) {}
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
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
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
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function createNodeWithStaticChild(templateNode, dynamicAttrs) {
    	var domNode = undefined;
    	var node = {
    		create: function create(item) {
    			domNode = templateNode.cloneNode(true);
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem) {
    			if (dynamicAttrs) {
    				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
    			}
    		},
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    var recyclingEnabled$3 = isRecyclingEnabled();

    function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
    	var node = {
    		pool: [],
    		keyedPool: [],
    		create: function create(item, treeLifecycle) {
    			var domNode = undefined;

    			if (recyclingEnabled$3) {
    				domNode = recycle(node, item);
    				if (domNode) {
    					return domNode;
    				}
    			}
    			domNode = templateNode.cloneNode(false);
    			var value = getValueWithIndex(item, valueIndex);

    			if (value != null) {
    				if (isArray(value)) {
    					for (var i = 0; i < value.length; i++) {
    						var childItem = value[i];

    						if ((typeof childItem === 'undefined' ? 'undefined' : babelHelpers.typeof(childItem)) === 'object') {
    							domNode.appendChild(childItem.domTree.create(childItem, treeLifecycle));
    						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
    							var textNode = document.createTextNode(childItem);
    							domNode.appendChild(textNode);
    						}
    					}
    				} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
    					domNode.appendChild(value.domTree.create(value, treeLifecycle));
    				} else if (typeof value === 'string' || typeof value === 'number') {
    					domNode.textContent = value;
    				}
    			}
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
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
    				if (typeof nextValue === 'string') {
    					domNode.firstChild.nodeValue = nextValue;
    				} else if (nextValue === null) {
    					// TODO
    				} else if (isArray(nextValue)) {
    						if (isArray(lastValue)) {
    							updateKeyed(nextValue, lastValue, domNode, null);
    						} else {
    							// TODO
    						}
    					} else if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
    							var tree = nextValue.domTree;

    							if (tree !== null) {
    								if (lastValue.domTree !== null) {
    									tree.update(lastValue, nextValue, treeLifecycle);
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

    function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
    	var domNode = undefined;
    	var node = {
    		create: function create(item, treeLifecycle) {
    			domNode = templateNode.cloneNode(false);
    			var value = getValueWithIndex(item, valueIndex);

    			if (value != null) {
    				if (isArray(value)) {
    					for (var i = 0; i < value.length; i++) {
    						var childItem = value[i];

    						if ((typeof childItem === 'undefined' ? 'undefined' : babelHelpers.typeof(childItem)) === 'object') {
    							domNode.appendChild(childItem.domTree.create(childItem, treeLifecycle));
    						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
    							var textNode = document.createTextNode(childItem);
    							domNode.appendChild(textNode);
    						}
    					}
    				} else if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
    					domNode.appendChild(value.domTree.create(value, treeLifecycle));
    				} else if (typeof value === 'string' || typeof value === 'number') {
    					domNode.textContent = value;
    				}
    			}
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem, treeLifecycle) {
    			var nextValue = getValueWithIndex(nextItem, valueIndex);
    			var lastValue = getValueWithIndex(lastItem, valueIndex);

    			if (nextValue !== lastValue) {
    				if (typeof nextValue === 'string') {
    					domNode.firstChild.nodeValue = nextValue;
    				} else if (nextValue === null) {
    					// TODO
    				} else if (isArray(nextValue)) {
    						if (isArray(lastValue)) {
    							updateKeyed(nextValue, lastValue, domNode, null, treeLifecycle);
    						} else {
    							//debugger;
    						}
    					} else if ((typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object') {
    							var tree = nextValue.domTree;

    							if (tree !== null) {
    								if (lastValue.domTree !== null) {
    									tree.update(lastValue, nextValue, treeLifecycle);
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

    function createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
    	var node = {
    		pool: [],
    		keyedPool: [],
    		create: function create(item, treeLifecycle) {
    			var domNode = undefined;
    			if (recyclingEnabled$4) {
    				domNode = recycle(node, item);
    				if (domNode) {
    					return domNode;
    				}
    			}
    			domNode = templateNode.cloneNode(false);
    			if (subTreeForChildren != null) {
    				if (isArray(subTreeForChildren)) {
    					for (var i = 0; i < subTreeForChildren.length; i++) {
    						var subTree = subTreeForChildren[i];
    						domNode.appendChild(subTree.create(item, treeLifecycle));
    					}
    				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
    					domNode.appendChild(subTreeForChildren.create(item, treeLifecycle));
    				}
    			}
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
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
    			if (subTreeForChildren != null) {
    				if (isArray(subTreeForChildren)) {
    					for (var i = 0; i < subTreeForChildren.length; i++) {
    						var subTree = subTreeForChildren[i];
    						subTree.update(lastItem, nextItem, treeLifecycle);
    					}
    				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
    					subTreeForChildren.update(lastItem, nextItem, treeLifecycle);
    				}
    			}
    			if (dynamicAttrs) {
    				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
    			}
    		},
    		remove: function remove(item, treeLifecycle) {
    			if (subTreeForChildren != null) {
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

    function createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
    	var domNode = undefined;
    	var node = {
    		create: function create(item, treeLifecycle) {
    			domNode = templateNode.cloneNode(false);
    			if (subTreeForChildren != null) {
    				if (isArray(subTreeForChildren)) {
    					for (var i = 0; i < subTreeForChildren.length; i++) {
    						var subTree = subTreeForChildren[i];
    						domNode.appendChild(subTree.create(item, treeLifecycle));
    					}
    				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
    					domNode.appendChild(subTreeForChildren.create(item, treeLifecycle));
    				}
    			}
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem, treeLifecycle) {
    			if (subTreeForChildren != null) {
    				if (isArray(subTreeForChildren)) {
    					for (var i = 0; i < subTreeForChildren.length; i++) {
    						var subTree = subTreeForChildren[i];
    						subTree.update(lastItem, nextItem, treeLifecycle);
    					}
    				} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(subTreeForChildren)) === 'object') {
    					subTreeForChildren.update(lastItem, nextItem, treeLifecycle);
    				}
    			}
    			if (dynamicAttrs) {
    				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
    			}
    		},
    		remove: function remove(item, treeLifecycle) {
    			if (subTreeForChildren != null) {
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
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function createStaticNode(templateNode) {
    	var domNode;

    	var node = {
    		create: function create() {
    			domNode = templateNode.cloneNode(true);
    			return domNode;
    		},
    		update: function update() {},
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    var recyclingEnabled$6 = isRecyclingEnabled();

    function createRootDynamicNode(valueIndex, domNamespace) {
    	var node = {
    		pool: [],
    		keyedPool: [],
    		create: function create(item, treeLifecycle) {
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
    					if (value == null) {
    						value = '';
    					}
    					domNode = document.createTextNode(value);
    					break;
    				case ValueTypes.ARRAY:
    					throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
    					break;
    				case ValueTypes.TREE:
    					domNode = value.create(item);
    					break;
    				default:
    					break;
    			}

    			item.rootNode = domNode;
    			return domNode;
    		},
    		update: function update(lastItem, nextItem, treeLifecycle) {
    			if (node !== lastItem.domTree) {
    				recreateRootNode(lastItem, nextItem, nod, treeLifecyclee);
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
    					// TODO replace node and rebuild
    					return;
    				}

    				switch (nextType) {
    					case ValueTypes.TEXT:
    						// TODO check if string is empty?
    						domNode.nodeValue = nextValue;
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

    function createDynamicNode(valueIndex, domNamespace) {
    	var domNode = undefined;

    	var node = {
    		create: function create(item, treeLifecycle) {
    			var value = getValueWithIndex(item, valueIndex);
    			var type = getTypeFromValue(value);

    			switch (type) {
    				case ValueTypes.TEXT:
    					// TODO check if string is empty?
    					if (value == null) {
    						value = '';
    					}
    					domNode = document.createTextNode(value);
    					break;
    				case ValueTypes.ARRAY:
    					throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
    					break;
    				case ValueTypes.TREE:
    					domNode = value.create(item, treeLifecycle);
    					break;
    				default:
    					break;
    			}

    			return domNode;
    		},
    		update: function update(lastItem, nextItem, treeLifecycle) {
    			var nextValue = getValueWithIndex(nextItem, valueIndex);
    			var lastValue = getValueWithIndex(lastItem, valueIndex);

    			if (nextValue !== lastValue) {
    				var nextType = getTypeFromValue(nextValue);
    				var lastType = getTypeFromValue(lastValue);

    				if (lastType !== nextType) {
    					// TODO replace node and rebuild
    					return;
    				}

    				switch (nextType) {
    					case ValueTypes.TEXT:
    						// TODO check if string is empty?
    						if (nextValue == null) {
    							nextValue = '';
    						}
    						domNode.nodeValue = nextValue;
    						break;
    					case ValueTypes.ARRAY:
    						throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
    						break;
    					case ValueTypes.TREE:
    						//debugger;
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
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
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
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function createVoidNode(templateNode, dynamicAttrs) {
    	var domNode = undefined;
    	var node = {
    		create: function create(item) {
    			domNode = templateNode.cloneNode(true);
    			if (dynamicAttrs) {
    				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem) {
    			if (dynamicAttrs) {
    				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
    			}
    		},
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function updateComponent(component, prevState, nextState, prevProps, nextProps, renderCallback, blockRender) {
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
    			renderCallback();
    			component.componentDidUpdate(prevProps, prevState);
    		}
    	}
    }

    var recyclingEnabled$8 = isRecyclingEnabled();

    function createRootNodeWithComponent(componentIndex, props, domNamespace) {
    	var instance = undefined;
    	var lastRender = undefined;
    	var currentItem = undefined;
    	var node = {
    		pool: [],
    		keyedPool: [],
    		create: function create(item, treeLifecycle) {
    			var domNode = undefined;

    			if (recyclingEnabled$8) {
    				domNode = recycle(node, item);
    				if (domNode) {
    					return domNode;
    				}
    			}
    			var Component = getValueWithIndex(item, componentIndex);

    			currentItem = item;
    			if (Component == null) {
    				//bad component, make a text node
    				domNode = document.createTextNode('');
    				item.rootNode = domNode;
    				return domNode;
    			} else if (typeof Component === 'function') {
    				//stateless component
    				if (!Component.prototype.render) {
    					var nextRender = Component(getValueForProps(props, item));

    					nextRender.parent = item;
    					domNode = nextRender.domTree.create(nextRender, treeLifecycle);
    					lastRender = nextRender;
    					item.rootNode = domNode;
    				} else {
    					instance = new Component(getValueForProps(props, item));
    					instance.componentWillMount();
    					var nextRender = instance.render();

    					nextRender.parent = item;
    					domNode = nextRender.domTree.create(nextRender, treeLifecycle);
    					item.rootNode = domNode;
    					lastRender = nextRender;
    					treeLifecycle.addTreeSuccessListener(instance.componentDidMount);
    					instance.forceUpdate = function () {
    						var nextRender = instance.render();

    						nextRender.parent = currentItem;
    						nextRender.domTree.update(lastRender, nextRender, treeLifecycle);
    						currentItem.rootNode = nextRender.rootNode;
    						lastRender = nextRender;
    					};
    				}
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem, treeLifecycle) {
    			var Component = getValueWithIndex(nextItem, componentIndex);

    			currentItem = nextItem;
    			if (!Component) {
    				recreateRootNode(lastItem, nextItem, node, treeLifecycle);
    				return;
    			}
    			if (typeof Component === 'function') {
    				if (!Component.prototype.render) {
    					var nextRender = Component(getValueForProps(props, nextItem));

    					nextRender.parent = currentItem;
    					nextRender.domTree.update(lastRender, nextRender, treeLifecycle);
    					currentItem.rootNode = nextRender.rootNode;
    					lastRender = nextRender;
    				} else {
    					if (!instance || node !== lastItem.domTree || Component !== instance.constructor) {
    						recreateRootNode(lastItem, nextItem, node, treeLifecycle);
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

    function recreateRootNode$1(lastDomNode, nextItem, node, treeLifecycle) {
    	var domNode = node.create(nextItem, treeLifecycle);
    	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
    	// TODO recycle old node
    }

    function getCorrectItemForValues(node, item) {
    	if (node !== item.domTree && item.parent) {
    		return getCorrectItemForValues(node, item.parent);
    	} else {
    		return item;
    	}
    }

    function createNodeWithComponent(componentIndex, props, domNamespace) {
    	var instance = undefined;
    	var lastRender = undefined;
    	var domNode = undefined;
    	var currentItem = undefined;
    	var node = {
    		create: function create(item, treeLifecycle) {
    			var valueItem = getCorrectItemForValues(node, item);
    			var Component = getValueWithIndex(valueItem, componentIndex);

    			currentItem = item;
    			if (Component == null) {
    				//bad component, make a text node
    				return document.createTextNode('');
    			} else if (typeof Component === 'function') {
    				//stateless component
    				if (!Component.prototype.render) {
    					var nextRender = Component(getValueForProps(props, valueItem));

    					nextRender.parent = item;
    					domNode = nextRender.domTree.create(nextRender, treeLifecycle);
    					lastRender = nextRender;
    				} else {
    					instance = new Component(getValueForProps(props, valueItem));
    					instance.componentWillMount();
    					var nextRender = instance.render();

    					nextRender.parent = item;
    					domNode = nextRender.domTree.create(nextRender, treeLifecycle);
    					lastRender = nextRender;
    					treeLifecycle.addTreeSuccessListener(instance.componentDidMount);
    					instance.forceUpdate = function () {
    						var nextRender = instance.render();

    						nextRender.parent = currentItem;
    						nextRender.domTree.update(lastRender, nextRender, treeLifecycle);
    						lastRender = nextRender;
    					};
    				}
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem, treeLifecycle) {
    			var Component = getValueWithIndex(nextItem, componentIndex);
    			currentItem = nextItem;

    			if (!Component) {
    				recreateRootNode$1(domNode, nextItem, node, treeLifecycle);
    				return;
    			}
    			if (typeof Component === 'function') {
    				//stateless component
    				if (!Component.prototype.render) {
    					var nextRender = Component(getValueForProps(props, nextItem));

    					nextRender.parent = currentItem;
    					nextRender.domTree.update(lastRender, nextRender, treeLifecycle);
    					lastRender = nextRender;
    				} else {
    					if (!instance || Component !== instance.constructor) {
    						recreateRootNode$1(domNode, nextItem, node, treeLifecycle);
    						return;
    					}
    					var prevProps = instance.props;
    					var prevState = instance.state;
    					var nextState = instance.state;
    					var nextProps = getValueForProps(props, nextItem);

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

    			if (value != null) {
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
    				domNode.nodeValue = nextValue;
    			}
    		},
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function createDynamicTextNode(templateNode, valueIndex) {
    	var domNode;

    	var node = {
    		create: function create(item) {
    			domNode = templateNode.cloneNode(false);
    			var value = getValueWithIndex(item, valueIndex);

    			if (value != null) {
    				domNode.nodeValue = value;
    			}
    			return domNode;
    		},
    		update: function update(lastItem, nextItem) {
    			var nextValue = getValueWithIndex(nextItem, valueIndex);

    			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
    				domNode.nodeValue = nextValue;
    			}
    		},
    		remove: function remove(lastItem) {}
    	};
    	return node;
    }

    function createStaticAttributes(node, domNode, excludeAttrs) {
        var attrs = node.attrs;

        if (attrs != null) {
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

    function createStaticTreeNode(node, parentNode, domNamespace, schema) {
        var staticNode = undefined;

        if (node == null) {
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

                if (text != null) {
                    if (children != null) {
                        throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
                    }
                    staticNode.textContent = text;
                } else {
                    if (children != null) {
                        createStaticTreeChildren(children, staticNode, domNamespace);
                    }
                }
                createStaticAttributes(node, staticNode);
            } else if (node.text) {
                staticNode = document.createTextNode(node.text);
            }
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

        if (isArray(schema)) {
            throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
        }

        if (!dynamicFlags) {
            templateNode = createStaticTreeNode(schema, null, domNamespace, schema);

            if (!templateNode) {
                throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
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

                    if (attrs != null) {
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

                    if (text != null) {
                        if (children != null) {
                            throw Error('Inferno Error: Template nodes cannot contain both TEXT and a CHILDREN properties, they must only use one or the other.');
                        }
                        if (dynamicFlags.TEXT === true) {
                            if (isRoot) {
                                node = createRootNodeWithDynamicText(templateNode, text.index, dynamicAttrs);
                            } else {
                                node = createNodeWithDynamicText(templateNode, text.index, dynamicAttrs);
                            }
                        } else {
                            templateNode.textContent = text;
                            if (isRoot) {
                                node = createRootNodeWithStaticChild(templateNode, dynamicAttrs);
                            } else {
                                node = createNodeWithStaticChild(templateNode, dynamicAttrs);
                            }
                        }
                    } else {
                        if (children != null) {
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
    		ATTRS: false, //attrs can also be an object
    		CHILDREN: false,
    		KEY: false,
    		COMPONENTS: false
    	};

    	if (node == null) {
    		return false;
    	}

    	if (node.type === ObjectTypes.VARIABLE) {
    		nodeIsDynamic = true;
    		dynamicFlags.NODE = true;
    	} else {
    		if (node != null) {
    			if (node.tag != null) {
    				if (node.tag.type === ObjectTypes.VARIABLE) {
    					nodeIsDynamic = true;
    					dynamicFlags.COMPONENTS = true;
    				}
    			}
    			if (node.text != null) {
    				if (node.text.type === ObjectTypes.VARIABLE) {
    					nodeIsDynamic = true;
    					dynamicFlags.TEXT = true;
    				}
    			}
    			if (node.attrs != null) {
    				if (node.attrs.type === ObjectTypes.VARIABLE) {
    					nodeIsDynamic = true;
    					dynamicFlags.ATTRS = true;
    				} else {
    					for (var attr in node.attrs) {
    						var attrVal = node.attrs[attr];
    						if (attrVal != null && attrVal.type === ObjectTypes.VARIABLE) {
    							if (attr === 'xmlns') {
    								throw Error('Inferno Error: The "xmlns" attribute cannot be dynamic. Please use static value for "xmlns" attribute instead.');
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
    			if (node.children != null) {
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
    			if (node.key != null) {
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
    	function Component(props, context) {
    		babelHelpers.classCallCheck(this, Component);

    		this.props = props || {};
    		this._blockRender = false;
    		this._blockSetState = false;
    		this._deferSetState = false;
    		this._pendingSetState = false;
    		this._pendingState = {};
    		this._componentTree = [];
    		this.state = {};
    	}

    	babelHelpers.createClass(Component, [{
    		key: "render",
    		value: function render() {}
    	}, {
    		key: "forceUpdate",
    		value: function forceUpdate() {}
    	}, {
    		key: "setState",
    		value: function setState(newState, callback) {
    			// TODO the callback
    			if (this._blockSetState === false) {
    				queueStateChanges(this, newState);
    			} else {
    				throw Error("Inferno Error: Cannot update state via setState() in componentWillUpdate()");
    			}
    		}
    	}, {
    		key: "componentDidMount",
    		value: function componentDidMount() {}
    	}, {
    		key: "componentWillMount",
    		value: function componentWillMount() {}
    	}, {
    		key: "componentWillUnmount",
    		value: function componentWillUnmount() {}
    	}, {
    		key: "componentDidUpdate",
    		value: function componentDidUpdate() {}
    	}, {
    		key: "shouldComponentUpdate",
    		value: function shouldComponentUpdate() {
    			return true;
    		}
    	}, {
    		key: "componentWillReceiveProps",
    		value: function componentWillReceiveProps() {}
    	}, {
    		key: "componentWillUpdate",
    		value: function componentWillUpdate() {}
    	}]);
    	return Component;
    })();

    var index = {
    	Component: Component,
    	createTemplate: createTemplate,
    	TemplateFactory: TemplateFactory,
    	render: render,
    	renderToString: renderToString
    };

    return index;

}));