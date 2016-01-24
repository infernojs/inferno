/*!
 * inferno-server v0.5.21
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('inferno')) :
  typeof define === 'function' && define.amd ? define(['inferno'], factory) :
  (global.InfernoServer = factory(global.Inferno));
}(this, function (Inferno) { 'use strict';

  Inferno = 'default' in Inferno ? Inferno['default'] : Inferno;

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };
  babelHelpers;

  function renderToString(item) {
  	return item.tree.html.create(item);
  }

  function createStaticNode(html) {
  	return {
  		create: function create() {
  			return html;
  		}
  	};
  }

  var isArray = (function (x) {
    return x.constructor === Array;
  })

  var isStringOrNumber = (function (x) {
    return typeof x === 'string' || typeof x === 'number';
  })

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

  var isVoid = (function (x) {
    return x === null || x === undefined;
  })

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

  function getDynamicNode(dynamicNodes, schema) {
  	for (var i = 0; i < dynamicNodes.length; i++) {
  		var dynamicNode = dynamicNodes[i];

  		if (dynamicNode.node === schema) {
  			return dynamicNode.dynamicFlags;
  		}
  	}
  }

  var ESCAPE_LOOKUP = {
  	'&': '&amp;',
  	'>': '&gt;',
  	'<': '&lt;',
  	'"': '&quot;',
  	'`': '&#x60;',
  	"'": '&#x27;'
  };

  var ESCAPE_REGEX = /[&><"'`]/g;

  /**
   * Escapes attribute value to prevent scripting attacks.
   *
   * @param {*} value Attribute value to escape.
   * @return {string} An escaped string.
   */
  var quoteAttributeValueForBrowser = (function (value) {
  	return '"' + ('' + value).replace(ESCAPE_REGEX, function (match) {
  		return ESCAPE_LOOKUP[match];
  	}) + '"';
  })

  var selfClosingTags = {
  	area: true,
  	base: true,
  	basefont: true,
  	br: true,
  	col: true,
  	command: true,
  	embed: true,
  	frame: true,
  	hr: true,
  	img: true,
  	input: true,
  	isindex: true,
  	keygen: true,
  	link: true,
  	meta: true,
  	param: true,
  	source: true,
  	track: true,
  	wbr: true,

  	// common self closing svg elements
  	path: true,
  	circle: true,
  	ellipse: true,
  	line: true,
  	rect: true,
  	use: true,
  	stop: true,
  	polyline: true,
  	polygon: true
  };

  function renderMarkupForSelect(node) {
  	var value = node.attrs && node.attrs.value;

  	if (!isVoid(value)) {
  		var values = {};
  		if (isArray(value)) {
  			for (var i = 0, len = value.length; i < len; i++) {
  				values[value[i]] = value[i];
  			}
  		} else {
  			values[value] = value;
  		}
  		populateOptions(node, values);
  		if (node.attrs && node.attrs.value) {
  			delete node.attrs.value;
  		}
  	}
  }

  /**
   * Populates values to options node.
   *
   * @param  Object node      A starting node (generaly a select node).
   * @param  Object values    The selected values to populate.
   */
  function populateOptions(node, values) {
  	if (node.tag !== 'option') {
  		for (var i = 0, len = node.children.length; i < len; i++) {
  			populateOptions(node.children[i], values);
  		}
  		return;
  	}
  	var value = node.attrs && node.attrs.value;

  	if (!values[value]) {
  		return;
  	}
  	node.attrs = node.attrs || {};
  	node.attrs.selected = 'selected';
  }

  /**
   *  WORK IN PROGRESS
   *
   *  Need to run tests for this one!!
   *
   * */
  function renderMarkupForStyles(styles, component) {
  	var serialized = '';

  	for (var styleName in styles) {
  		if (isValidAttribute(styleName)) {
  			var styleValue = styles[styleName];

  			if (!isVoid(styleValue)) {
  				if (!unitlessProperties[styleName]) {
  					if (typeof styleValue !== 'string') {
  						styleValue = styleValue + 'px';
  					}
  				}
  				serialized += styleName + ':';
  				serialized += styleValue + ';';
  			}
  		}
  	}
  	return serialized || null;
  }

  function renderMarkupForAttributes(name, value) {
  	if (name === 'data-inferno') {
  		return '' + name;
  	}
  	var propertyInfo = HTMLPropsContainer[name] || null;

  	if (propertyInfo) {
  		if (isVoid(value) || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && value !== value || propertyInfo.hasPositiveNumericValue && value < 1 || value === 'false' || value.length === 0) {
  			return '';
  		}
  		var attributeName = propertyInfo.attributeName;

  		return attributeName + '=' + quoteAttributeValueForBrowser(value);
  	} else {
  		if (isVoid(value) || !isValidAttribute(name)) {
  			return '';
  		}
  		// custom attributes
  		return (DOMAttributeNames[name] || name.toLowerCase()) + '=' + quoteAttributeValueForBrowser(value);
  	}
  }
  function createStaticAttributes(props, excludeAttrs) {
  	var HTML = '';

  	for (var propKey in props) {
  		var propValue = props[propKey];

  		if (!isVoid(propValue)) {
  			if (propKey === 'style') {
  				propValue = renderMarkupForStyles(propValue);
  			}
  			var markup = null;

  			markup = renderMarkupForAttributes(propKey, propValue);
  			if (markup) {
  				HTML += ' ' + markup;
  			}
  		}
  	}
  	return HTML;
  }

  function createStaticTreeChildren(children) {
  	var isLastChildNode = false;

  	if (isArray(children)) {
  		return children.map(function (child, i) {
  			if (isStringOrNumber(child)) {
  				if (isLastChildNode) {
  					isLastChildNode = true;
  					return '<!---->' + child;
  				} else {
  					isLastChildNode = true;
  					return child;
  				}
  			}
  			isLastChildNode = false;
  			return createStaticTreeNode(false, child);
  		}).join('');
  	} else {
  		if (isStringOrNumber(children)) {
  			return children;
  		} else {
  			return createStaticTreeNode(false, children);
  		}
  	}
  }

  function createStaticTreeNode(isRoot, node) {
  	var staticNode = undefined;

  	if (isVoid(node)) {
  		return '';
  	}
  	if (node.tag) {
  		var tag = typeof node.tag === 'string' && node.tag.toLowerCase();
  		var attrs = node.attrs;
  		var attributes = {};

  		for (var key in node.attrs) {
  			if (key === 'value') {
  				if (tag === 'select') {
  					renderMarkupForSelect(node);
  					continue;
  				} else if (tag === 'textarea' || attrs.contenteditable) {
  					node.text = attrs[key];
  					continue;
  				}
  			}
  			attributes[key] = attrs[key];
  		}
  		if (isRoot) {
  			attributes['data-inferno'] = true;
  		}
  		staticNode = '<' + tag;

  		// In React they can add innerHTML like this, just workaround it
  		if (attributes.innerHTML) {
  			node.text = attributes.innerHTML;
  		} else {
  			staticNode += createStaticAttributes(attributes, null);
  		}

  		if (selfClosingTags[tag]) {
  			staticNode += ' />';
  		} else {
  			staticNode += '>';

  			if (!isVoid(node.children)) {
  				staticNode += createStaticTreeChildren(node.children);
  			} else if (!isVoid(node.text)) {
  				staticNode += node.text;
  			}
  			staticNode += '</' + tag + '>';
  		}
  	}

  	return staticNode;
  }

  function createHTMLTree(schema, isRoot, dynamicNodes) {
  	var dynamicFlags = getDynamicNode(dynamicNodes, schema);
  	var node = undefined;
  	// static html
  	if (!dynamicFlags) {
  		return createStaticNode(createStaticTreeNode(isRoot, schema));
  	}

  	return node;
  }

  if (Inferno) {
  	if (typeof Inferno.addTreeConstructor !== 'function') {
  		throw 'Your package is out-of-date! Upgrade to latest Inferno in order to use the InfernoDOM package.';
  	} else {
  		Inferno.addTreeConstructor('html', createHTMLTree);
  	}
  }

  var index = {
  	renderToString: renderToString
  };

  return index;

}));