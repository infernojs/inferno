/*!
 * inferno v0.4.0
 * (c) 2015 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

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
  const recyclingEnabled$9 = true;

  function pool(item) {
  	const key = item.key;
  	const tree = item.domTree;
  	if (key === null) {
  		tree.pool.push(item);
  	} else {
  		const keyedPool = tree.keyedPool; // TODO rename
  		(keyedPool[key] || (keyedPool[key] = [])).push(item);
  	}
  }

  function recycle(tree, item) {
  	// TODO use depth as key
  	const key = item.key;
  	let recyclableItem;
  	// TODO faster to check pool size first?
  	if (key !== null) {
  		const keyPool = tree.keyedPool[key];
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
  	return recyclingEnabled$9;
  }

  const recyclingEnabled = isRecyclingEnabled();

  function updateKeyed(items, oldItems, parentNode, parentNextNode) {
  	let stop = false;
  	let startIndex = 0;
  	let oldStartIndex = 0;
  	const itemsLength = items.length;
  	const oldItemsLength = oldItems.length;

  	// TODO only if there are no other children
  	if (itemsLength === 0 && oldItemsLength >= 5) {
  		if (recyclingEnabled) {
  			for (let i = 0; i < oldItemsLength; i++) {
  				pool(oldItems[i]);
  			}
  		}
  		parentNode.textContent = '';
  		return;
  	}

  	let endIndex = itemsLength - 1;
  	let oldEndIndex = oldItemsLength - 1;
  	let startItem = itemsLength > 0 && items[startIndex];
  	let oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
  	let endItem;
  	let oldEndItem;
  	let nextNode;
  	let oldItem;
  	let item;

  	// TODO don't read key too often
  	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
  		stop = true;
  		while (startItem.key === oldStartItem.key) {
  			startItem.domTree.update(oldStartItem, startItem);
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
  			endItem.domTree.update(oldEndItem, endItem);
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
  			endItem.domTree.update(oldStartItem, endItem);
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
  			startItem.domTree.update(oldEndItem, startItem);
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
  				insertOrAppend(parentNode, item.domTree.create(item), nextNode);
  			}
  		}
  	} else if (startIndex > endIndex) {
  		for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
  			oldItem = oldItems[oldStartIndex];
  			remove(oldItem, parentNode);
  		}
  	} else {
  		const oldItemsMap = {};
  		let oldNextItem = oldEndIndex + 1 < oldItemsLength ? oldItems[oldEndIndex + 1] : null;

  		for (let i = oldEndIndex; i >= oldStartIndex; i--) {
  			oldItem = oldItems[i];
  			oldItem.nextItem = oldNextItem;
  			oldItemsMap[oldItem.key] = oldItem;
  			oldNextItem = oldItem;
  		}
  		let nextItem = endIndex + 1 < itemsLength ? items[endIndex + 1] : null;
  		for (let i = endIndex; i >= startIndex; i--) {
  			item = items[i];
  			const key = item.key;

  			oldItem = oldItemsMap[key];
  			if (oldItem) {
  				oldItemsMap[key] = null;
  				oldNextItem = oldItem.nextItem;
  				item.domTree.update(oldItem, item);
  				// TODO optimise
  				if (item.rootNode.nextSibling != (nextItem && nextItem.rootNode)) {
  					nextNode = nextItem && nextItem.rootNode || parentNextNode;
  					insertOrAppend(parentNode, item.rootNode, nextNode);
  				}
  			} else {
  				nextNode = nextItem && nextItem.rootNode || parentNextNode;
  				insertOrAppend(parentNode, item.domTree.create(item), nextNode);
  			}
  			nextItem = item;
  		}
  		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
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
  	let lastItem;
  	const _componentTree = [];
  	const treeSuccessListeners = [];
  	const treeLifecycle = {
  		addTreeSuccessListener(listener) {
  			treeSuccessListeners.push(listener);
  		},
  		removeTreeSuccessListener(listener) {
  			for (let i = 0; i < treeSuccessListeners.length; i++) {
  				const treeSuccessListener = treeSuccessListeners[i];

  				if (treeSuccessListener === listener) {
  					treeSuccessListeners.splice(i, 1);
  					return;
  				}
  			}
  		}
  	};
  	const fragment = {
  		parentNode,
  		_componentTree,
  		render(nextItem) {
  			if (!nextItem) {
  				return;
  			}
  			const tree = nextItem.domTree;

  			if (lastItem) {
  				tree.update(lastItem, nextItem, _componentTree, treeLifecycle);
  			} else {
  				const dom = tree.create(nextItem, _componentTree, treeLifecycle);

  				if (nextNode) {
  					parentNode.insertBefore(dom, nextNode);
  				} else if (parentNode) {
  					parentNode.appendChild(dom);
  				}
  			}
  			lastItem = nextItem;
  			return fragment;
  		},
  		remove() {
  			remove(lastItem, parentNode);
  			return fragment;
  		}
  	};
  	return fragment;
  }

  const rootFragments = [];

  function unmountComponentsAtFragment(fragment) {}

  function getRootFragmentAtNode(node) {
  	const rootFragmentsLength = rootFragments.length;

  	if (rootFragmentsLength === 0) {
  		return null;
  	}
  	for (let i = 0; i < rootFragmentsLength; i++) {
  		const rootFragment = rootFragments[i];
  		if (rootFragment.parentNode === node) {
  			return rootFragment;
  		}
  	}
  	return null;
  }

  function removeRootFragment(rootFragment) {
  	for (let i = 0; i < rootFragments.length; i++) {
  		if (rootFragments[i] === rootFragment) {
  			rootFragments.splice(i, 1);
  			return true;
  		}
  	}
  	return false;
  }

  function render(nextItem, parentNode) {
  	const rootFragment = getRootFragmentAtNode(parentNode);

  	if (rootFragment === null) {
  		const fragment = createDOMFragment(parentNode);
  		fragment.render(nextItem);
  		rootFragments.push(fragment);
  	} else {
  		if (nextItem === null) {
  			unmountComponentsAtFragment(rootFragment);
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

  function unmountComponentsAtNode(parentNode) {
  	const rootFragment = getRootFragmentAtNode(parentNode);
  	unmountComponentsAtFragment(rootFragment);
  }

  var isArray = (x => x.constructor === Array)

  function createChildren(children) {
  	const childrenArray = [];
  	if (isArray(children)) {
  		for (let i = 0; i < children.length; i++) {
  			const childItem = children[i];
  			childrenArray.push(childItem);
  		}
  	}
  	return childrenArray;
  }

  function createElement(tag, attrs, ...children) {
  	if (tag) {
  		const vNode = {
  			tag
  		};
  		if (attrs) {
  			if (attrs.key !== undefined) {
  				vNode.key = attrs.key;
  				delete attrs.key;
  			}
  			vNode.attrs = attrs;
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
  	createElement
  };

  const ObjectTypes = {
  	VARIABLE: 1
  };

  const ValueTypes$1 = {
  	TEXT: 0,
  	ARRAY: 1,
  	TREE: 21
  };

  function createVariable(index) {
  	return {
  		index,
  		type: ObjectTypes.VARIABLE
  	};
  }

  function getValueWithIndex(item, index) {
  	return index < 2 ? index === 0 ? item.v0 : item.v1 : item.values[index - 2];
  }

  function getTypeFromValue$1(value) {
  	if (typeof value === 'string' || typeof value === 'number' || value === undefined) {
  		return ValueTypes$1.TEXT;
  	} else if (isArray(value)) {
  		return ValueTypes$1.ARRAY;
  	} else if (typeof value === 'object' && value.create) {
  		return ValueTypes$1.TREE;
  	}
  }

  function getValueForProps(props, item) {
  	const newProps = {};

  	for (let name in props) {
  		const val = props[name];

  		if (val && val.index) {
  			newProps[name] = getValueWithIndex(item, val.index);
  		} else {
  			newProps[name] = val;
  		}
  	}
  	return newProps;
  }

  const PROPERTY = 0x1;
  const BOOLEAN = 0x2;
  const NUMERIC_VALUE = 0x4;
  const POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;

  const xlink = 'http://www.w3.org/1999/xlink';
  const xml = 'http://www.w3.org/XML/1998/namespace';

  const DOMAttributeNamespaces = {
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

  const DOMAttributeNames = {
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

  const DOMPropertyNames = {
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
  const Whitelist = {
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

  let HTMLPropsContainer = {};

  function checkBitmask(value, bitmask) {
      return bitmask !== null && (value & bitmask) === bitmask;
  }

  for (let propName in Whitelist) {

      const propConfig = Whitelist[propName];

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
      const len = arr.length;
      let i = 0;

      while (i < len) {
          if (arr[i++] == item) {
              return true;
          }
      }

      return false;
  }

  // TODO!! Optimize!!
  function setSelectValueForProperty(vNode, domNode, value, useProperties) {
  	const isMultiple = isArray(value);
  	const options = domNode.options;
  	const len = options.length;

  	let i = 0,
  	    optionNode;
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

  const template = {
      /**
       * Sets the value for a property on a node. If a value is specified as
       * '' (empty string), the corresponding style property will be unset.
       *
       * @param {DOMElement} node
       * @param {string} name
       * @param {*} value
       */
      setProperty(vNode, domNode, name, value, useProperties) {

          const propertyInfo = HTMLPropsContainer[name] || null;

          if (propertyInfo) {
              if (value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && value !== value || propertyInfo.hasPositiveNumericValue && value < 1 || value.length === 0) {
                  template.removeProperty(vNode, domNode, name, useProperties);
              } else {
                  const propName = propertyInfo.propertyName;

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

                      const attributeName = propertyInfo.attributeName;
                      const namespace = propertyInfo.attributeNamespace;

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
      removeProperty(vNode, domNode, name, useProperties) {
          const propertyInfo = HTMLPropsContainer[name];

          if (propertyInfo) {
              if (propertyInfo.mustUseProperty) {
                  let propName = propertyInfo.propertyName;
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

  const standardNativeEventMapping = {
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

  const nonBubbleableEventMapping = {
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

  let propertyToEventType = {};
  [standardNativeEventMapping, nonBubbleableEventMapping].forEach(mapping => {
  	Object.keys(mapping).reduce((state, property) => {
  		state[property] = mapping[property];
  		return state;
  	}, propertyToEventType);
  });

  const INFERNO_PROP = '__Inferno__id__';
  let counter = 1;

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

  const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

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
    let hook = eventHooks[type];
    if (hook) {
      let hooked = hook(handler);
      hooked.originalHandler = handler;
      return hooked;
    }

    return { handler, originalHandler: handler };
  }

  const standardNativeEvents = Object.keys(standardNativeEventMapping).map(key => standardNativeEventMapping[key]);

  const nonBubbleableEvents = Object.keys(nonBubbleableEventMapping).map(key => nonBubbleableEventMapping[key]);

  let EventRegistry = {};

  if (ExecutionEnvironment.canUseDOM) {
  	let i = 0;
  	let type;
  	const nativeFocus = 'onfocusin' in document.documentElement;

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
  				const _type = this._type;
  				let handler = setHandler(_type, e => {
  					addRootListener(e, _type);
  				}).handler;
  				document.addEventListener(focusEvents[_type], handler);
  			}
  			// firefox doesn't support focusin/focusout events
  			: function () {
  				const _type = this._type;
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
  	const name = node.nodeName.toLowerCase();
  	if (name !== 'input') {
  		if (name === 'select' && node.multiple) {
  			return 'select-multiple';
  		}
  		return name;
  	}
  	const type = node.getAttribute('type');
  	if (!type) {
  		return 'text';
  	}
  	return type.toLowerCase();
  }

  function selectValues(node) {
  	let result = [];
  	let index = node.selectedIndex;
  	let option;
  	let options = node.options;
  	let length = options.length;
  	let i = index < 0 ? length : 0;

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
  	const name = getFormElementType(node);

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
  	const type = event.type;
  	const nodeName = target.nodeName.toLowerCase();

  	let tagHooks;

  	if (tagHooks = setupHooks[type]) {
  		let hook = tagHooks[nodeName];
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
  	const registry = EventRegistry[type];

  	// Support: Safari 6-8+
  	// Target should not be a text node
  	if (e.target.nodeType === 3) {
  		e.target = e.target.parentNode;
  	}

  	let target = e.target,
  	    listenersCount = registry._counter,
  	    listeners,
  	    listener,
  	    nodeID,
  	    event,
  	    args,
  	    defaultArgs;

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
  				let numArgs = listener.originalHandler.length;
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
  	return e => {
  		const target = e.target;
  		const listener = listenersStorage[InfernoNodeID(target)][type];
  		const args = listener.originalHandler.length > 1 ? createListenerArguments(target, e) : [e];

  		listener.originalHandler.apply(target, args);
  	};
  }

  function addListener(vNode, domNode, type, listener) {
  	if (!domNode) {
  		return null; // TODO! Should we throw?
  	}
  	const registry = EventRegistry[type];

  	// only add listeners for registered events
  	if (registry) {
  		if (!registry._enabled) {
  			// handle focus / blur events
  			if (registry._focusBlur) {
  				registry._focusBlur();
  			} else if (registry._bubbles) {
  				let handler = setHandler(type, addRootListener).handler;
  				document.addEventListener(type, handler, false);
  			}
  			registry._enabled = true;
  		}
  		const nodeID = InfernoNodeID(domNode),
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

  const unitlessProps = {
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

  var unitlessProperties = (str => {
  	return str in unitlessProps;
  })

  /**
   * Normalize CSS properties for SSR
   *
   * @param {String} name The boolean attribute name to set.
   * @param {String} value The boolean attribute value to set.
   */
  var addPixelSuffixToValueIfNeeded = ((name, value) => {
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
  var setValueForStyles = ((vNode, domNode, styles) => {
    for (let styleName in styles) {
      let styleValue = styles[styleName];

      domNode.style[styleName] = styleValue == null ? '' : addPixelSuffixToValueIfNeeded(styleName, styleValue);
    }
  })

  /**
   * Set HTML attributes on the template
   * @param{ HTMLElement } node
   * @param{ Object } attrs
   */
  function addDOMStaticAttributes(vNode, domNode, attrs) {

  	let styleUpdates;

  	for (let attrName in attrs) {
  		const attrVal = attrs[attrName];

  		if (attrVal) {
  			if (attrName === 'style') {

  				styleUpdates = attrVal;
  			} else {
  				template.setProperty(vNode, domNode, attrName, attrVal, false);
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

  	let styleUpdates;

  	for (let attrName in dynamicAttrs) {
  		let attrVal = getValueWithIndex(item, dynamicAttrs[attrName]);

  		if (attrVal !== undefined) {

  			if (attrName === 'style') {

  				styleUpdates = attrVal;
  			} else {

  				if (fastPropSet(attrName, attrVal, domNode) === false) {
  					if (propertyToEventType[attrName]) {
  						addListener(item, domNode, propertyToEventType[attrName], attrVal);
  					} else {
  						template.setProperty(item, domNode, attrName, attrVal, true);
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
  		const nextDynamicAttrs = getValueWithIndex(nextItem, dynamicAttrs.index);
  		addDOMStaticAttributes(nextItem, domNode, nextDynamicAttrs);
  		return;
  	}

  	let styleUpdates;

  	for (let attrName in dynamicAttrs) {
  		const lastAttrVal = getValueWithIndex(lastItem, dynamicAttrs[attrName]);
  		const nextAttrVal = getValueWithIndex(nextItem, dynamicAttrs[attrName]);

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

  function recreateRootNode(lastItem, nextItem, node) {
  	const lastDomNode = lastItem.rootNode;
  	const domNode = node.create(nextItem);
  	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
  	// TODO recycle old node
  }

  const recyclingEnabled$2 = isRecyclingEnabled();

  function createRootNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item) {
  			let domNode;

  			if (recyclingEnabled$2) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			const value = getValueWithIndex(item, valueIndex);

  			if (value != null) {
  				domNode.textContent = value;
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update(lastItem, nextItem) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			const nextValue = getValueWithIndex(nextItem, valueIndex);

  			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
  				domNode.firstChild.nodeValue = nextValue;
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  function createNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
  	var domNode;

  	const node = {
  		create(item) {
  			domNode = templateNode.cloneNode(false);
  			const value = getValueWithIndex(item, valueIndex);

  			if (value != null) {
  				domNode.textContent = value;
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			return domNode;
  		},
  		update(lastItem, nextItem) {
  			const nextValue = getValueWithIndex(nextItem, valueIndex);

  			if (nextValue !== getValueWithIndex(lastItem, valueIndex)) {
  				domNode.firstChild.nodeValue = nextValue;
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  const recyclingEnabled$1 = isRecyclingEnabled();

  function createRootNodeWithStaticChild(templateNode, dynamicAttrs) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item) {
  			let domNode;

  			if (recyclingEnabled$1) {
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
  		update(lastItem, nextItem) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  function createNodeWithStaticChild(templateNode, dynamicAttrs) {
  	let domNode;
  	const node = {
  		create(item) {
  			domNode = templateNode.cloneNode(true);
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			return domNode;
  		},
  		update(lastItem, nextItem) {
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  const recyclingEnabled$3 = isRecyclingEnabled();

  function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item, parentComponent, treeLifecycle) {
  			let domNode;

  			if (recyclingEnabled$3) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			const value = getValueWithIndex(item, valueIndex);

  			if (value != null) {
  				if (isArray(value)) {
  					for (let i = 0; i < value.length; i++) {
  						const childItem = value[i];

  						if (typeof childItem === 'object') {
  							domNode.appendChild(childItem.domTree.create(childItem, parentComponent));
  						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
  							const textNode = document.createTextNode(childItem);
  							domNode.appendChild(textNode);
  						}
  					}
  				} else if (typeof value === 'object') {
  					domNode.appendChild(value.domTree.create(value));
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
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			const nextValue = getValueWithIndex(nextItem, valueIndex);
  			const lastValue = getValueWithIndex(lastItem, valueIndex);

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
  					} else if (typeof nextValue === 'object') {
  							const tree = nextValue.domTree;

  							if (tree !== null) {
  								if (lastValue.domTree !== null) {
  									tree.update(lastValue, nextValue, parentComponent);
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
  		}
  	};
  	return node;
  }

  function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
  	let domNode;
  	const node = {
  		create(item, parentComponent, treeLifecycle) {
  			domNode = templateNode.cloneNode(false);
  			const value = getValueWithIndex(item, valueIndex);

  			if (value != null) {
  				if (isArray(value)) {
  					for (let i = 0; i < value.length; i++) {
  						const childItem = value[i];

  						if (typeof childItem === 'object') {
  							domNode.appendChild(childItem.domTree.create(childItem));
  						} else if (typeof childItem === 'string' || typeof childItem === 'number') {
  							const textNode = document.createTextNode(childItem);
  							domNode.appendChild(textNode);
  						}
  					}
  				} else if (typeof value === 'object') {
  					domNode.appendChild(value.domTree.create(value, parentComponent));
  				} else if (typeof value === 'string' || typeof value === 'number') {
  					domNode.textContent = value;
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			const nextValue = getValueWithIndex(nextItem, valueIndex);
  			const lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				if (typeof nextValue === 'string') {
  					domNode.firstChild.nodeValue = nextValue;
  				} else if (nextValue === null) {
  					// TODO
  				} else if (isArray(nextValue)) {
  						if (isArray(lastValue)) {
  							updateKeyed(nextValue, lastValue, domNode, null);
  						} else {
  							//debugger;
  						}
  					} else if (typeof nextValue === 'object') {
  							const tree = nextValue.domTree;

  							if (tree !== null) {
  								if (lastValue.domTree !== null) {
  									tree.update(lastValue, nextValue, parentComponent);
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
  		}
  	};
  	return node;
  }

  const recyclingEnabled$4 = isRecyclingEnabled();

  function createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item, parentComponent, treeLifecycle) {
  			let domNode;
  			if (recyclingEnabled$4) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			domNode = templateNode.cloneNode(false);
  			if (subTreeForChildren != null) {
  				if (isArray(subTreeForChildren)) {
  					for (let i = 0; i < subTreeForChildren.length; i++) {
  						const subTree = subTreeForChildren[i];
  						domNode.appendChild(subTree.create(item, parentComponent));
  					}
  				} else if (typeof subTreeForChildren === 'object') {
  					domNode.appendChild(subTreeForChildren.create(item, parentComponent));
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			item.rootNode = domNode;
  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			if (subTreeForChildren != null) {
  				if (isArray(subTreeForChildren)) {
  					for (let i = 0; i < subTreeForChildren.length; i++) {
  						const subTree = subTreeForChildren[i];
  						subTree.update(lastItem, nextItem, parentComponent);
  					}
  				} else if (typeof subTreeForChildren === 'object') {
  					subTreeForChildren.update(lastItem, nextItem, parentComponent);
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  function createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
  	let domNode;
  	const node = {
  		create(item, parentComponent, treeLifecycle) {
  			domNode = templateNode.cloneNode(false);
  			if (subTreeForChildren != null) {
  				if (isArray(subTreeForChildren)) {
  					for (let i = 0; i < subTreeForChildren.length; i++) {
  						const subTree = subTreeForChildren[i];
  						domNode.appendChild(subTree.create(item));
  					}
  				} else if (typeof subTreeForChildren === 'object') {
  					domNode.appendChild(subTreeForChildren.create(item, parentComponent));
  				}
  			}
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			if (subTreeForChildren != null) {
  				if (isArray(subTreeForChildren)) {
  					for (let i = 0; i < subTreeForChildren.length; i++) {
  						const subTree = subTreeForChildren[i];
  						subTree.update(lastItem, nextItem);
  					}
  				} else if (typeof subTreeForChildren === 'object') {
  					subTreeForChildren.update(lastItem, nextItem, parentComponent);
  				}
  			}
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  const recyclingEnabled$5 = isRecyclingEnabled();

  function createRootStaticNode(templateNode) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item) {
  			let domNode;
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
  		update(lastItem, nextItem) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			nextItem.rootNode = lastItem.rootNode;
  		}
  	};
  	return node;
  }

  function createStaticNode(templateNode) {
  	var domNode;

  	const node = {
  		create() {
  			domNode = templateNode.cloneNode(true);
  			return domNode;
  		},
  		update() {}
  	};
  	return node;
  }

  const recyclingEnabled$6 = isRecyclingEnabled();

  function createRootDynamicNode(valueIndex, domNamespace) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item, parentComponent, treeLifecycle) {
  			let domNode;

  			if (recyclingEnabled$6) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			let value = getValueWithIndex(item, valueIndex);
  			const type = getTypeFromValue(value);

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
  					domNode = value.create(item, parentComponent);
  					break;
  				default:
  					break;
  			}

  			item.rootNode = domNode;
  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;

  			const nextValue = getValueWithIndex(nextItem, valueIndex);
  			const lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				const nextType = getTypeFromValue(nextValue);
  				const lastType = getTypeFromValue(lastValue);

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
  		}
  	};
  	return node;
  }

  function createDynamicNode(valueIndex, domNamespace) {
  	let domNode;

  	const node = {
  		create(item, parentComponent) {
  			let value = getValueWithIndex(item, valueIndex);
  			const type = getTypeFromValue$1(value);

  			switch (type) {
  				case ValueTypes$1.TEXT:
  					// TODO check if string is empty?
  					if (value == null) {
  						value = '';
  					}
  					domNode = document.createTextNode(value);
  					break;
  				case ValueTypes$1.ARRAY:
  					throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
  					break;
  				case ValueTypes$1.TREE:
  					domNode = value.create(item, parentComponent);
  					break;
  				default:
  					break;
  			}

  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent) {
  			let nextValue = getValueWithIndex(nextItem, valueIndex);
  			const lastValue = getValueWithIndex(lastItem, valueIndex);

  			if (nextValue !== lastValue) {
  				const nextType = getTypeFromValue$1(nextValue);
  				const lastType = getTypeFromValue$1(lastValue);

  				if (lastType !== nextType) {
  					// TODO replace node and rebuild
  					return;
  				}

  				switch (nextType) {
  					case ValueTypes$1.TEXT:
  						// TODO check if string is empty?
  						if (nextValue == null) {
  							nextValue = '';
  						}
  						domNode.nodeValue = nextValue;
  						break;
  					case ValueTypes$1.ARRAY:
  						throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
  						break;
  					case ValueTypes$1.TREE:
  						//debugger;
  						break;
  					default:
  						break;
  				}
  			}
  		}
  	};
  	return node;
  }

  const recyclingEnabled$7 = isRecyclingEnabled();

  function createRootVoidNode(templateNode, dynamicAttrs) {
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item) {
  			let domNode;
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
  		update(lastItem, nextItem) {
  			if (node !== lastItem.domTree) {
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;
  			nextItem.rootNode = lastItem.rootNode;
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  function createVoidNode(templateNode, dynamicAttrs) {
  	let domNode;
  	const node = {
  		create(item) {
  			domNode = templateNode.cloneNode(true);
  			if (dynamicAttrs) {
  				addDOMDynamicAttributes(item, domNode, dynamicAttrs);
  			}
  			return domNode;
  		},
  		update(lastItem, nextItem) {
  			if (dynamicAttrs) {
  				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
  			}
  		}
  	};
  	return node;
  }

  function unmountComponent(instance) {
  	// TODO
  	// if we have a parentComponent, remove us from there
  	// unmount us and then
  	// unmount all our child components too
  }

  const recyclingEnabled$8 = isRecyclingEnabled();

  function createRootNodeWithComponent(componentIndex, props, domNamespace) {
  	let instance;
  	let lastRender;
  	const node = {
  		pool: [],
  		keyedPool: [],
  		create(item, parentComponent, treeLifecycle) {
  			let domNode;

  			if (recyclingEnabled$8) {
  				domNode = recycle(node, item);
  				if (domNode) {
  					return domNode;
  				}
  			}
  			const Component = getValueWithIndex(item, componentIndex);

  			if (Component == null) {
  				//bad component, make a text node
  				domNode = document.createTextNode('');
  				item.rootNode = domNode;
  				return domNode;
  			}
  			instance = new Component(getValueForProps(props, item));
  			instance.componentWillMount();
  			const nextRender = instance.render();

  			nextRender.parent = item;
  			domNode = nextRender.domTree.create(nextRender, instance);
  			item.rootNode = domNode;
  			lastRender = nextRender;
  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			const Component = getValueWithIndex(nextItem, componentIndex);

  			if (Component !== instance.constructor) {
  				unmountComponent(instance);
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			if (node !== lastItem.domTree) {
  				unmountComponent(instance);
  				recreateRootNode(lastItem, nextItem, node);
  				return;
  			}
  			const domNode = lastItem.rootNode;

  			nextItem.rootNode = domNode;

  			const prevProps = instance.props;
  			const prevState = instance.state;
  			const nextState = instance.state;
  			const nextProps = getValueForProps(props, nextItem);

  			if (!nextProps.children) {
  				nextProps.children = prevProps.children;
  			}

  			if (prevProps !== nextProps || prevState !== nextState) {
  				if (prevProps !== nextProps) {
  					instance._blockRender = true;
  					instance.componentWillReceiveProps(nextProps);
  					instance._blockRender = false;
  				}
  				const shouldUpdate = instance.shouldComponentUpdate(nextProps, nextState);

  				if (shouldUpdate) {
  					instance._blockSetState = true;
  					instance.componentWillUpdate(nextProps, nextState);
  					instance._blockSetState = false;
  					instance.props = nextProps;
  					instance.state = nextState;
  					const nextRender = instance.render();

  					nextRender.parent = nextItem;
  					nextRender.domTree.update(lastRender, nextRender, instance);
  					nextItem.rootNode = nextRender.rootNode;
  					instance.componentDidUpdate(prevProps, prevState);
  					lastRender = nextRender;
  				}
  			}
  		}
  	};
  	return node;
  }

  function recreateRootNode$1(lastDomNode, nextItem, node) {
  	const domNode = node.create(nextItem);
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
  	let instance;
  	let lastRender;
  	let domNode;
  	const node = {
  		create(item, parentComponent, treeLifecycle) {
  			const valueItem = getCorrectItemForValues(node, item);
  			const Component = getValueWithIndex(valueItem, componentIndex);

  			if (Component == null) {
  				//bad component, make a text node
  				return document.createTextNode('');
  			}
  			instance = new Component(getValueForProps(props, valueItem));
  			instance.componentWillMount();
  			const nextRender = instance.render();

  			nextRender.parent = item;
  			domNode = nextRender.domTree.create(nextRender, instance);
  			lastRender = nextRender;
  			return domNode;
  		},
  		update(lastItem, nextItem, parentComponent, treeLifecycle) {
  			const Component = getValueWithIndex(nextItem, componentIndex);

  			if (Component !== instance.constructor) {
  				unmountComponent(instance);
  				recreateRootNode$1(domNode, nextItem, node);
  				return;
  			}
  			const prevProps = instance.props;
  			const prevState = instance.state;
  			const nextState = instance.state;
  			const nextProps = getValueForProps(props, nextItem);

  			if (!nextProps.children) {
  				nextProps.children = prevProps.children;
  			}

  			if (prevProps !== nextProps || prevState !== nextState) {
  				if (prevProps !== nextProps) {
  					instance._blockRender = true;
  					instance.componentWillReceiveProps(nextProps);
  					instance._blockRender = false;
  				}
  				const shouldUpdate = instance.shouldComponentUpdate(nextProps, nextState);

  				if (shouldUpdate) {
  					instance._blockSetState = true;
  					instance.componentWillUpdate(nextProps, nextState);
  					instance._blockSetState = false;
  					instance.props = nextProps;
  					instance.state = nextState;
  					const nextRender = instance.render();

  					nextRender.parent = nextItem;
  					nextRender.domTree.update(lastRender, nextRender, instance);
  					instance.componentDidUpdate(prevProps, prevState);
  					lastRender = nextRender;
  				}
  			}
  		}
  	};
  	return node;
  }

  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  function createStaticAttributes(node, domNode, excludeAttrs) {
      const attrs = node.attrs;

      if (attrs != null) {
          if (excludeAttrs) {
              const newAttrs = _extends({}, attrs);

              for (let attr in excludeAttrs) {
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
          for (let i = 0; i < children.length; i++) {
              const childItem = children[i];
              if (typeof childItem === 'string' || typeof childItem === 'number') {
                  const textNode = document.createTextNode(childItem);
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
      let staticNode;

      if (typeof node === 'string' || typeof node === 'number') {
          staticNode = document.createTextNode(node);
      } else {
          const tag = node.tag;
          if (tag) {
              let namespace = node.attrs && node.attrs.xmlns || null;
              let is = node.attrs && node.attrs.is || null;

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
              const text = node.text;
              const children = node.children;

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
      const dynamicFlags = dynamicNodeMap.get(schema);
      let node;
      let templateNode;

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
              const tag = schema.tag;

              if (tag) {
                  if (tag.type === ObjectTypes.VARIABLE) {
                      const lastAttrs = schema.attrs;
                      const attrs = _extends({}, lastAttrs);
                      let children = null;

                      if (schema.children) {
                          if (isArray(schema.children) && schema.children.length > 1) {
                              attrs.children = [];
                              for (let i = 0; i < schema.children.length; i++) {
                                  const childNode = schema.children[i];
                                  attrs.children.push(createDOMTree(childNode, false, dynamicNodeMap, domNamespace));
                              }
                          } else {
                              if (isArray(schema.children) && schema.children.length === 1) {
                                  attrs.children = createDOMTree(schema.children[0], false, dynamicNodeMap, domNamespace);
                              } else {
                                  attrs.children = createDOMTree(schema.children, false, dynamicNodeMap, domNamespace);
                              }
                          }
                      }
                      if (isRoot) {
                          return createRootNodeWithComponent(tag.index, attrs, children, domNamespace);
                      } else {
                          return createNodeWithComponent(tag.index, attrs, children, domNamespace);
                      }
                  }
                  let namespace = schema.attrs && schema.attrs.xmlns || null;
                  let is = schema.attrs && schema.attrs.is || null;

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
                  const attrs = schema.attrs;
                  let dynamicAttrs = null;

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
                  const text = schema.text;
                  const children = schema.children;

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
                              let subTreeForChildren = [];
                              if (isArray(children)) {
                                  for (let i = 0; i < children.length; i++) {
                                      const childItem = children[i];
                                      subTreeForChildren.push(createDOMTree(childItem, false, dynamicNodeMap, domNamespace));
                                  }
                              } else if (typeof children === 'object') {
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
                              const childNodeDynamicFlags = dynamicNodeMap.get(children);

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
              }
          }
      }
      return node;
  }

  function createHTMLStringTree() {}

  function scanTreeForDynamicNodes(node, nodeMap) {
  	let nodeIsDynamic = false;
  	const dynamicFlags = {
  		NODE: false,
  		TEXT: false,
  		ATTRS: false, //attrs can also be an object
  		CHILDREN: false,
  		KEY: false,
  		COMPONENTS: false
  	};

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
  					for (let attr in node.attrs) {
  						const attrVal = node.attrs[attr];
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
  						for (let i = 0; i < node.children.length; i++) {
  							const childItem = node.children[i];
  							const result = scanTreeForDynamicNodes(childItem, nodeMap);

  							if (result === true) {
  								nodeIsDynamic = true;
  								dynamicFlags.CHILDREN = true;
  							}
  						}
  					} else if (typeof node === 'object') {
  						const result = scanTreeForDynamicNodes(node.children, nodeMap);

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
  	let construct = callback.construct;

  	if (!construct) {
  		const callbackLength = callback.length;
  		const callbackArguments = new Array(callbackLength);
  		for (let i = 0; i < callbackLength; i++) {
  			callbackArguments[i] = createVariable(i);
  		}
  		const schema = callback.apply(undefined, callbackArguments);
  		const dynamicNodeMap = new Map();
  		scanTreeForDynamicNodes(schema, dynamicNodeMap);
  		const domTree = createDOMTree(schema, true, dynamicNodeMap);
  		const htmlStringTree = createHTMLStringTree(schema, true, dynamicNodeMap);
  		const key = schema.key;
  		const keyIndex = key ? key.index : -1;

  		switch (callbackLength) {
  			case 0:
  				construct = () => ({
  					parent: null,
  					domTree,
  					htmlStringTree,
  					key: null,
  					nextItem: null,
  					rootNode: null
  				});
  				break;
  			case 1:
  				construct = v0 => {
  					let key;

  					if (keyIndex === 0) {
  						key = v0;
  					}
  					return {
  						parent: null,
  						domTree,
  						htmlStringTree,
  						key,
  						nextItem: null,
  						rootNode: null,
  						v0
  					};
  				};
  				break;
  			case 2:
  				construct = (v0, v1) => {
  					let key;

  					if (keyIndex === 0) {
  						key = v0;
  					} else if (keyIndex === 1) {
  						key = v1;
  					}
  					return {
  						parent: null,
  						domTree,
  						htmlStringTree,
  						key,
  						nextItem: null,
  						rootNode: null,
  						v0,
  						v1
  					};
  				};
  				break;
  			default:
  				construct = (v0, v1, ...values) => {
  					let key;

  					if (keyIndex === 0) {
  						key = v0;
  					} else if (keyIndex === 1) {
  						key = v1;
  					} else if (keyIndex > 1) {
  						key = values[keyIndex];
  					}
  					return {
  						parent: null,
  						domTree,
  						htmlStringTree,
  						key,
  						nextItem: null,
  						rootNode: null,
  						v0,
  						v1,
  						values
  					};
  				};
  				break;
  		}
  		callback.construct = construct;
  	}
  	return construct;
  }

  var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  function applyState(component) {
  	var blockRender = component._blockRender;
  	requestAnimationFrame(() => {
  		if (component._deferSetState === false) {
  			component._pendingSetState = false;
  			const pendingState = component._pendingState;
  			const oldState = component.state;
  			const nextState = _extends$1({}, oldState, pendingState);
  			component._pendingState = {};
  			component._pendingSetState = false;
  			//updateComponent(component, component.props, nextState, blockRender);
  			// TODO
  		} else {
  				applyState(component);
  			}
  	});
  }

  function queueStateChanges(component, newState) {
  	for (let stateKey in newState) {
  		component._pendingState[stateKey] = newState[stateKey];
  	}
  	if (component._pendingSetState === false) {
  		component._pendingSetState = true;
  		applyState(component);
  	}
  }

  class Component {
  	constructor(props, context) {
  		this.props = props || {};
  		this._blockRender = false;
  		this._blockSetState = false;
  		this._deferSetState = false;
  		this._pendingSetState = false;
  		this._pendingState = {};
  		this._componentTree = [];
  		this.state = {};
  	}
  	render() {}
  	forceUpdate() {}
  	setState(newState, callback) {
  		// TODO the callback
  		if (this._blockSetState === false) {
  			queueStateChanges(this, newState);
  		} else {
  			throw Error("Inferno Error: Cannot update state via setState() in componentWillUpdate()");
  		}
  	}
  	componentDidMount() {}
  	componentWillMount() {}
  	componentWillUnmount() {}
  	componentDidUpdate() {}
  	shouldComponentUpdate() {
  		return true;
  	}
  	componentWillReceiveProps() {}
  	componentWillUpdate() {}
  }

  module.exports = {
  	Component,
  	createTemplate,
  	TemplateFactory,
  	render,
  	renderToString,
  	unmountComponentsAtNode
  };

}));