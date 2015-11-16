import attrNameCfg from './cfg/attrNameCfg';
import propNameCfg from './cfg/propNameCfg';
import xmlCfg from './cfg/xmlCfg';
import xlinkCfg from './cfg/xlinkCfg';
import hasPropertyAccessor from './hasPropertyAccessor';
import validateAttribute from './validateAttribute';
import dasherize from './dasherize';
import camelize from './camelize';
import normalizeCSS from './normalizeCSS';
import inArray from '../util/inArray';
import isArray from '../util/isArray';
import isSVG from '../util/isSVG';
import tagName from '../util/tagName';
import escapeHtml from './escapeHtml';

/**
 * Applies a single attribute or property to a given Element. If the value is null
 * or undefined, it is not set. Otherwise, the value is set
 * as an attribute.
 * @param {!Element} node
 * @param {string} name The attribute's name.
 * @param {?(boolean|number|string)=} value The attribute's value.
 */
 let setAttribute = (node, name, value) => {
	if (name === 'type' && (tagName(node) === 'input')) {
		// Support: IE9-Edge
		const val = node.value; // value will be lost in IE if type is changed
		node.setAttribute(name, '' + value);
		// Check if val exist, if not we will get a stupid 'value=""' in the markup
		if ( val ) {
		   node.value = val;
		}
	} else {

		// Avoid touching the DOM on falsy values
		if ( value !== 'false') {
		node.setAttribute(attrNameCfg[name] || name, '' + value); // cast to string
	   }
	}
};

/**
 * Applies the 'volume' attribute on a given Element
 *
 * @param {Object} node A DOM element.
 * @param {String} name	 The attribute name to set.
 * @param {String} value  The attribute value to set.
 */
let setVolumAttribute = (node, name, value) => {
	// The 'volume' attribute can only contain a number in the range 0.0 to 1.0, where 0.0 is the
	// quietest and 1.0 the loudest. So we optimize by checking for the most obvious first...
	if ( value === 0.0 || (value === 1) || (typeof value === 'number' && (value > -1 && (value < 1.1 )))) {
		  node.setAttribute(name, value);
	}
};
/**
 * Applies a custom attribute on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name	  The attribute name
 * @param {*} value value The attribute value
 */
let setCustomAttribute = (node, name, value) => {
	// Custom attributes are the only arributes we are validating.
	if (validateAttribute( name )) {
	// All attributes are lowercase
		node.setAttribute((attrNameCfg[name] || name).toLowerCase(), '' + value); // cast to string
	}
};

/**
 * Applies a numeric attribute on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name	  The numeric attribute name
 * @param {*} value  The numeric attribute value
 */
let setNumericAttribute = (node, name, value) => {
	if (value > 0 && (typeof value === 'number')) {
		node.setAttribute(name, value);
	}
};

/**
 * Applies a property on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name	  The property name
 * @param {string} value	 The property value
 */
let setProperty = (node, name, value) => {
	if (value != null) {
			// 'contentEditable' is a special case
			if (name === 'contentEditable' && (value)) {
				/**
				 * We would need this check here, else it will throw:
				 *
				 * ' Failed to set the 'contentEditable' property on 'HTMLElement': The value
				 * ' provided ('contentEditable') is not one of 'true', 'false', 'plaintext-only', or 'inherit'.'
				 */

				// Workaround for the 'contentEditable' property
				let cEValue;

				switch (value) {
				case true:
					cEValue = value;
					break;
				case false:
					cEValue = value;
					break;
				case 'plaintext-only':
					cEValue = value;
					break;
				case 'inherit':
					cEValue = value;
					break;
				default:
					cEValue = 'inherit';
				}

				value = cEValue;
			}

			node[propNameCfg[name] || name] = value;
	}
};

/**
 * Applies the selectedIndex property on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {String} name	  The property name to set.
 * @param {*} value  The property value to set.
 */
let setSelectedIndexProperty = (node, name, value) => {

	// selectbox has special case
  if (Array.prototype.every.call(node.options, (opt) => !(opt.selected = opt.value === value))) {
	  // TODO! Fix this so we use a normal iteration loop, and avoid using 'Array.prototype.every'.
	 node[name] = -1;
  }
};

/**
 * Applies a dataset object property on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name  The property name
 * @param {*} value  The property value
 */
let setPropertyForDataset = (node, name, value) => {
	if (process.env.NODE_ENV !== 'production') {
		let typeOfVal = typeof value;
		if (typeOfVal !== 'object') {
			console.error(`Error! "${name}" attribute expects an object as a value, not a ${typeOfVal}`);
			return;
		}
	}

	let prop = node[name];

	for (let idx in value) {
		// regarding the specs we need to camelize the 'name'
		prop[camelize(idx)] = value[idx] == null ? '' : dasherize(value[idx]);
	}
};

/**
 * Applies a style to an Element. Vendor prefix expansion is done for
 * property names/values as well as adding the 'px' suffix.
 * @param {!Element} el
 * @param {string} name The property's name.
 * @param {string|Object<string,string>} style The style to set. Either a
 *	 string of css or an object containing property-value pairs.
 */
let applyStyle = (node, name, value) => {
	// CSS style need to be a object literal, not a string value
	if (process.env.NODE_ENV !== 'production') {
		let typeOfVal = typeof value;
		if (typeOfVal !== 'object') {
			console.error(`Error! "${name}" attribute expects an object as a value, not a ${typeOfVal}`);
			return;
		}
	}

	let prop = node[name];

	for (let idx in value) {
		node.style[idx] = (value[idx] == null) ? '' : normalizeCSS(idx, value[idx]);
	}
};

/**
 * Applies a 'value' property on a given Element after validation check
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name	  The property name
 * @param {*} value  The property value
 */
let setValueForProperty = (node, name, value) => {
	if (name === 'value' && (tagName(node) === 'select')) {
		setSelectValue(node, value);
	} else {
		// Need to validate this else it will fail when we update fragments etc.
		node[name] !== value && (node[name] = value);
	}
};

/**
 * Applies a select / select multiple attribute on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {String|Array} value  The property value
 */

let setSelectValue = (node, value) => {
	const multiple = isArray(value),
		options = node.options;

	if ( multiple && (typeof value[0] === 'number')) {
		const selectedValue = {};
		for (i = 0; i < value.length; i++) {
			selectedValue['' + value[i]] = true;
		}

		for (i = 0; i < options.length; i++) {
			const selected = selectedValue.hasOwnProperty(options[i].value);
			if (options[i].selected !== selected) {
				options[i].selected = true;
			}
		}
	} else {
		let optionNode;
		for (let i = 0; i < options.length; i++) {
			optionNode = options[i];
			optionNode.selected = value != null && (multiple ? inArray(value, optionNode.value) : optionNode.value == value);
		}
	}
};

/**
 * Render HTML attributes to a string for SSR
 *
 * @param {string} name
 * @param {*} value
 * @return {string} Markup string, or empty string if the property was invalid.
 */
let createAttributeMarkup = (name, value) => {
	return (!validateAttribute( name ) || value == null) ? '' : `${ attrNameCfg[name] || name }="${ escapeHtml(value + '') }"`;
};

/**
 * Render HTML markup from a dataset property for SSR rendring
 *
 * @param {string} name The name to be set.
 * @param {Object} value  The value to be set.
 */
let datasetToString = (name, value) => {
	let objectLiteral = '';
	for (let objName in value) {
		objectLiteral += value[objName] != null && ( 'data-' + objName + '="' + dasherize(value[objName]) + '" ');
	}
	return objectLiteral;
};

/**
 * Render HTML markup from boolean attributes to string for SSR rendring
 *
 * @param {string} name  The attribute name
 * @param {*} value  The attribute value
 */
let booleanAttrToString = (name, value) => {
	// XHTML friendly
	switch (name) {
	case 'download':
	case 'multiple':
		return value ? name : '';
	case false:
		return '';
	case true:
		return `${ name }="${ '' }"`;
	default:
		return `${ name }="${ escapeHtml(value + '') }"`; // cast to string
	}
};

/**
 * Render CSS style property to string for SSR rendring
 *
 * @param {string} name  The attribute name
 * @param {*} value The property value
 */
let createPropertyMarkup = (name, value) => {
	let styles = '';

	for (let styleName in value) {
		value[styleName] != null && (styles += dasherize(styleName) + ':' + normalizeCSS(styleName, value[styleName]) + ';');
	}

	return styles ? `${ name }="${ styles }"` : styles;
};

let IS_ATTRIBUTE = {
	set: setAttribute,
	toHtml: createAttributeMarkup
};

let IS_CUSTOM = {
	set: setCustomAttribute,
	toHtml: createAttributeMarkup
};

let IS_VOLUME_ATTRIBUTE = {
	set: setVolumAttribute,
	toHtml: createAttributeMarkup
};

let IS_NUMERIC = {
	set: setNumericAttribute,
	toHtml: createAttributeMarkup
};

let IS_PROPERTY = {
	set: setProperty,
	toHtml: createAttributeMarkup
};

let IS_SELECTED_PROPERTY = {
	set: setSelectedIndexProperty,
	toHtml: createAttributeMarkup
};

let IS_XLINK_NAMESPACE = {

	/**
	 * Applies a xlink namespace attribute on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name  The attribute name
	 * @param {*} value	The attribute value
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/1999/xlink', xlinkCfg[name], value);
	},

	toHtml:createAttributeMarkup
};

let IS_XML_NAMESPACE = {

	/**
	 * Applies a xlink namespace attribute on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name The attribute name
	 * @param {*} value The attribute value
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/XML/1998/namespace', xmlCfg[name], value);
	},
	toHtml:createAttributeMarkup
};

let DOMConfig = {
	acceptCharset: IS_ATTRIBUTE,
	accept: IS_ATTRIBUTE,
	allowTransparency: IS_ATTRIBUTE,
	charSet: IS_ATTRIBUTE,
	challenge: IS_ATTRIBUTE,
	classID: IS_ATTRIBUTE,
	className: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
	clipPath: IS_ATTRIBUTE,
	cols: IS_NUMERIC,
	crossOrigin: IS_ATTRIBUTE,
	contentEditable: IS_PROPERTY,
	contextMenu: IS_ATTRIBUTE,
	cx: IS_ATTRIBUTE,
	cy: IS_ATTRIBUTE,
	d: IS_ATTRIBUTE,
	data: IS_ATTRIBUTE,
	dateTime: IS_ATTRIBUTE,

	/**
	 * 'dataset' is a special case
	 *
	 */
	dataset: {
		set: setPropertyForDataset,
		// 'dataset' property has to be removed as an attribute
		// because it's set as an attribute - e.g. data-foo='bar'
		toHtml: datasetToString
	},
	defaultPlaybackRate: IS_PROPERTY,
	designMode: IS_PROPERTY,
	dir: IS_ATTRIBUTE,
	dropzone: IS_ATTRIBUTE,
	dx: IS_ATTRIBUTE,
	dy: IS_ATTRIBUTE,
	encType: IS_ATTRIBUTE,
	file: IS_ATTRIBUTE,
	fill: IS_ATTRIBUTE,
	fillOpacity: IS_ATTRIBUTE,
	form: IS_ATTRIBUTE,
	formAction: IS_ATTRIBUTE,
	formEncType: IS_ATTRIBUTE,
	formMethod: IS_ATTRIBUTE,
	formTarget: IS_ATTRIBUTE,
	fontFamily: IS_ATTRIBUTE,
	fontSize: IS_ATTRIBUTE,
	frameBorder: IS_ATTRIBUTE,
	for: IS_ATTRIBUTE,
	fx: IS_ATTRIBUTE,
	fy: IS_ATTRIBUTE,
	height: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
	icon: IS_ATTRIBUTE,
	inputMode: IS_ATTRIBUTE,
	is: IS_ATTRIBUTE,
	keyParams: IS_ATTRIBUTE,
	keyType: IS_ATTRIBUTE,
	lang: IS_ATTRIBUTE,
	list: IS_ATTRIBUTE,
	manifest: IS_ATTRIBUTE,
	marginHeight: IS_ATTRIBUTE,
	marginWidth: IS_ATTRIBUTE,
	markerEnd: IS_ATTRIBUTE,
	markerMid: IS_ATTRIBUTE,
	markerStart: IS_ATTRIBUTE,
	maxLength: IS_ATTRIBUTE,
	max: IS_ATTRIBUTE,
	media: IS_ATTRIBUTE,
	mediagroup: IS_ATTRIBUTE,
	minLength: IS_ATTRIBUTE,
	name: IS_ATTRIBUTE,
	nohref: IS_ATTRIBUTE,
	// number used once or number once
	nonce: IS_NUMERIC,
	noshade: IS_ATTRIBUTE,
	opacity: IS_ATTRIBUTE,
	points: IS_ATTRIBUTE,
	poster: IS_ATTRIBUTE,
	prefix: IS_ATTRIBUTE,
	r: IS_ATTRIBUTE,
	resource: IS_ATTRIBUTE,
	role: IS_ATTRIBUTE,
	rows: IS_NUMERIC,
	rx: IS_ATTRIBUTE,
	ry: IS_ATTRIBUTE,
	selectedIndex: IS_SELECTED_PROPERTY,
	size: IS_NUMERIC,
	// Viewport-based selection
	sizes: IS_ATTRIBUTE,
	span: IS_NUMERIC,
	stroke: IS_ATTRIBUTE,
	src: IS_ATTRIBUTE,
	srcSet: IS_ATTRIBUTE,
	start: IS_ATTRIBUTE,
	step: IS_ATTRIBUTE,
	tabIndex: IS_PROPERTY,
	target: IS_ATTRIBUTE,
	transform: IS_ATTRIBUTE,
	title: IS_ATTRIBUTE,
	type: IS_ATTRIBUTE,
	typeof: IS_ATTRIBUTE,

	/**
	 * CSS styling attribute is a special case, and will be set as a normal object.
	 * 'styles' should be used as an replacement.
	 */
	style: {
		set: applyStyle,
		toHtml: createPropertyMarkup
	},
	usemap: IS_ATTRIBUTE,

	/**
	 * 'value' is a special case
	 *
	 */
	value: {
		set: setValueForProperty,
		toHtml: createAttributeMarkup
	},
	version: IS_ATTRIBUTE,
	viewBox: IS_ATTRIBUTE,
	volume: IS_VOLUME_ATTRIBUTE,
	width: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
	wmode: IS_ATTRIBUTE,
	x1: IS_ATTRIBUTE,
	x2: IS_ATTRIBUTE,
	x: IS_ATTRIBUTE,
	y1: IS_ATTRIBUTE,
	y2: IS_ATTRIBUTE,
	y: IS_ATTRIBUTE,

	/**
	 * Non-standard attributes
	 */

	// itemProp, itemScope, itemType are for
	// Microdata support. See http://schema.org/docs/gs.html
	itemProp: IS_ATTRIBUTE,
	itemType: IS_ATTRIBUTE,
	// itemID and itemRef are for Microdata support as well but
	// only specified in the the WHATWG spec document. See
	// https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
	itemID: IS_ATTRIBUTE,
	itemRef: IS_ATTRIBUTE,
	// IE-only attribute that specifies security restrictions on an iframe
	// as an alternative to the sandbox attribute on IE<10
	security: IS_ATTRIBUTE,
	// IE-only attribute that controls focus behavior
	unselectable: IS_ATTRIBUTE,

	/**
	 * Namespace attributes
	 */
	'xml:base': IS_XML_NAMESPACE,
	'xml:id': IS_XML_NAMESPACE,
	'xml:lang': IS_XML_NAMESPACE,
	'xml:space': IS_XML_NAMESPACE,
	'xlink:actuate': IS_XLINK_NAMESPACE,
	'xlink:arcrole': IS_XLINK_NAMESPACE,
	'xlink:href': IS_XLINK_NAMESPACE,
	'xlink:role': IS_XLINK_NAMESPACE,
	'xlink:show': IS_XLINK_NAMESPACE,
	'xlink:title': IS_XLINK_NAMESPACE,
	'xlink:type': IS_XLINK_NAMESPACE,

	/**
	 * Navigation attributes (SVG)
	 */
	'nav-up': IS_ATTRIBUTE,
	'nav-up-right': IS_ATTRIBUTE,
	'nav-right': IS_ATTRIBUTE,
	'nav-down-right': IS_ATTRIBUTE,
	'nav-down': IS_ATTRIBUTE,
	'nav-down-left': IS_ATTRIBUTE,
	'nav-left': IS_ATTRIBUTE,
	'xlink:role': IS_ATTRIBUTE,
	'nav-up-left ': IS_ATTRIBUTE,

	/**
	 * Conditional processing attributes (SVG)
	 */

	'requiredExtensions': IS_ATTRIBUTE,
	'requiredFeatures': IS_ATTRIBUTE,
	'requiredFonts': IS_ATTRIBUTE,
	'requiredFormats': IS_ATTRIBUTE,
	'systemLanguage': IS_ATTRIBUTE,

	/**
	 * Timing attributes (SVG)
	 */

	dur: IS_ATTRIBUTE,
	end: IS_ATTRIBUTE,
	restart: IS_ATTRIBUTE,
	repeatCount: IS_ATTRIBUTE,
	repeatDur: IS_ATTRIBUTE,
	fill: IS_ATTRIBUTE

};

export default {

/**
 * Apply a HTML attribute / property on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name The attribute / property name
 * @param {String|Object} value The attribute / property value
 */
	set(node, name, value, skip) {

		// Prioritized HTML properties
		if (!skip) {
			switch (name) {
			case 'id':	// Core attribute
			case 'label':
			case 'placeholder':
			case 'name':
			case 'designMode':
			case 'htmlFor':
			case 'playbackRate':
			case 'preload':
			case 'srcDoc':
			case 'autoPlay': // bool
			case 'checked': // bool
			case 'isMap': // bool
			case 'loop': // bool
			case 'muted': // bool
			case 'readOnly': // bool
			case 'reversed':
			case 'required': // bool
			case 'selected': // bool
			case 'spellCheck': // bool
			case 'trueSpeed': // bool
			case 'multiple': // bool
			case 'controls': // bool
			case 'defer': // bool
			case 'noValidate':
			case 'scoped': // bool
			case 'noResize':  // bool
				if (value != null) {
					node[name] = value;
				}
				return;
			}
		}

		// Prioritized HTML attributes
		switch (name) {
		case 'about': // RDFA
		case 'async': // bool
		case 'allowFullScreen': // bool
		case 'autoFocus': // bool
		case 'autoPlay': // bool
		case 'baseProfile': // SVG
		case 'capture': // bool
		case 'datatype': // RDFA
		case 'default':
		case 'defaultchecked': // bool
		case 'defaultmuted': // bool
		case 'defaultselected': // bool
		case 'draggable': // bool
		case 'download': // bool
		case 'disabled': // bool
		case 'dir': // Core attribute
		case 'draggable': // bool
		case 'dropzone': // bool
		case 'for':
		case 'form':
		case 'formNoValidate': // bool
		case 'formEncType':
		case 'formMethod':
		case 'formTarget':
		case 'fontFamily':
		case 'fontSize':
		case 'frameBorder':
		case 'fontWeight':
		case 'hidden': // bool
		case 'href':
		case 'itemScope': // bool
		case 'is':
		case 'integrity':
		case 'name':
		case 'open':
		// 'property' is also supported for OpenGraph in meta tags.
		case 'property': // RDFA
		case 'seamless':
		case 'sortable':
		case 'title': // Core attribute
		case 'translate': // bool attribute
		case 'typemustmatch': // bool attribute
		case 'type':
		case 'vocab': // RDFA
		case 'viewBox':
		case 'visible':
		case 'xmlns':

			if (value !== 'false') {
				node.setAttribute(name, '' + ((value === 'true') ? '' : value));
			}
			return;
		}

		return (DOMConfig[name] || IS_CUSTOM).set(node, name, value);
	},

	/**
	 * Render HTML attribute / property markup for SSR
	 *
	 * @param {string} name The attribute / property name to render.
	 * @param {*} value The attribute / property value to render.
	 */
	toHtml: (name, value) => (DOMConfig[name] || IS_CUSTOM).toHtml(name, value)
};
