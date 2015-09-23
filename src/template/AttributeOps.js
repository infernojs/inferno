import attrNameCfg from './cfg/attrNameCfg';
import propNameCfg from './cfg/propNameCfg';
import hasPropertyAccessor from './hasPropertyAccessor';
import dasherize from './dasherize';
import camelize from './camelize';
import inArray from '../util/inArray';
import isArray from '../util/isArray';
import isSVG from '../util/isSVG';
import escapeHtml from './escapeHtml';
import unitlessCfg from './cfg/unitlessCfg';

// Simplified subset
let VALID_ATTRIBUTE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z_\.\-\d]*$/,
    illegalAttributeNameCache = {},
    validatedAttributeNameCache = {},

 xmlMap = {
	'xml:base': 'base',
	'xml:id': 'id',
	'xml:lang': 'lang',
	'xml:space': 'spac'
},

 xlinkMap = {
	'xlink:actuate': 'actuate',
	'xlink:arcrole': 'arcrole',
	'xlink:href': 'href',
	'xlink:role': 'role',
	'xlink:show': 'show',
	'xlink:title': 'title',
	'xlink:type': 'type'
},
 contentEditable = {
		'true': true, 
		'false': true, 
		'plaintext-only': true, 
		'inherit':true
};

/**
 * Returns a DOM node tagName as lowerCase
 * @param {Object} node A DOM element.
 */
let getNodeName = (node) => {
	
	// TODO!! Cache this for re-use?
    return node.tagName.toLowerCase();	
};

/**
 * Normalize CSS properties for SSR
 *
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
let normalize = (name, value) => {
	if (value === null || (value === '')) {
		return '';
	}
	if (value === 0 || (unitlessCfg[name] || (isNaN(value)))) {
		return '' + value; // cast to string
	}
	if (typeof value === 'string') {
		value = value.trim();
	}
	return value + 'px';
};

/**
 * Validate custom attributes
 *
 * @param  {String} name  The boolean attribute name to set.
 */
 let validateAttribute = ( name ) => {

    if ( validatedAttributeNameCache[name] ) {
        return true;
    }

    if ( illegalAttributeNameCache[name] ) {
        return false;
    }
     // namespace attributes are seen as non-valid, avoid that!
     if ( VALID_ATTRIBUTE_NAME_REGEX.test( name ) || 
	    ( xmlMap[name] ) || 
		( xlinkMap[name] ) ) {
			
        validatedAttributeNameCache[name] = true;
        return true;
    }

    illegalAttributeNameCache[name] = true;

    return false;
};

/**
 * Set boolean attributes
 *
 * @param  {Object} node A DOM element.
 * @param  {String} name  The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
let setBooleanAttribute = (node, name, value) => {
	// Avoid touching the DOM and set falsy attributes.
	if (value !== false) {
		node.setAttribute(name, '' + (value === true ? '' : value));
	}
};

/**
 * Set Inferno attributes
 *
 * @param  {Object} node A DOM element.
 * @param  {String} name  The attribute name to set.
 * @param {String} value The attribute value to set.
 */
let setInfernoAttribute = (node, name, value) => {
	node.setAttribute(name, value);
};

/**
 * Set volume attributes on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} name	 The attribute name to set.
 * @param {String} value  The attribute value to set.
 */
let setVolumAttribute = (node, name, value) => {
    // The 'volume' attribute can only contain a number in the range 0.0 to 1.0, where 0.0 is the 
	// quietest and 1.0 the loudest. So we optimize by checking for the most obvious first...
    if ( value === 0.0 || (value === 1) || (typeof value === 'number' && (value > -1 && (value < 1.1 )))) {
		node.setAttribute(attrNameCfg[name] || name, value);
	}
};

let setCustomAttribute = (node, name, value) => {
	if (name === 'type' && (getNodeName(node) === 'input')) {
		// Support: IE9-Edge
		const val = node.value; // value will be lost in IE if type is changed
		node.setAttribute(name, '' + value);
		node.value = val;
	} else if (validateAttribute( name )) {
		node.setAttribute(attrNameCfg[name] || name, value);
	}
};

/**
 * Set attributes on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} name	  The attribute name to set.
 * @param {String} value The attribute value to set.
 */
let setAttribute = (node, name, value) => {
	if (name === 'type' && (getNodeName(node) === 'input')) {
		// Support: IE9-Edge
		const val = node.value; // value will be lost in IE if type is changed
		node.setAttribute(name, '' + value);
		node.value = val;
	} else {
		node.setAttribute(attrNameCfg[name] || name, '' + value); // cast to string
	}
};

/**
 * Set numeric attributes on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} name	  The numeric attribute name to set.
 * @param {String} value  The numeric attribute value to set.
 */
let setNumericAttribute = (node, name, value) => {
      if (typeof value === "number" && (value > 0)) {
		node.setAttribute(name, '' + value); // cast to string
	}
};

/**
 * Set properties on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} name	  The property name to set.
 * @param {String} value	 The property value to set.
 */
let setProperty = (node, name, value) => {

	if (name === 'type' && (getNodeName(node) === 'input')) {
		// Support: IE9-Edge
		const val = node.value; // value will be lost in IE if type is changed
		node[name] = value;
		node.value = val;
	} else if (value != null) {

    // 'contentEditable' is a special case
	if (name === 'contentEditable') {

      if (value) {
        value = contentEditable[value] ? value : 'inherit';
      }
    }
    node[propNameCfg[name] || name] = value;
  }
};

/**
 * Set selectedIndex property
 *
 * @param {Object} node A DOM element.
 * @param {String} name	  The property name to set.
 * @param {String} value  The property value to set.
 */
let setSelectedIndexProperty = (node, name, value) => {

    // selectbox has special case
    if (Array.prototype.every.call(node.options, function(o) {
            return !(o.selected = o.value === value)
        })) {
        node[name] = -1;
    }
};

/**
 * Set boolean property
 *
 * @param {Object} node A DOM element.
 * @param {String} name	  The boolean property name to set.
 * @param {String} value  The boolean property value to set.
 */
let setBooleanProperty = (node, name, value) => {
	node[name] = !!value;
};

/**
 * Set dataset object properties
 *
 * @param {Object} node A DOM element.
 * @param {String} name  The property name to set.
 * @param {String} value  The property value to set.
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

let setPropertyForStyle = (node, name, value) => {
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
		node.style[idx] = value[idx] == null ? '' : normalize(idx, value[idx]);
	}
};

/**
 * Set 'value' property after validation check
 *
 * @param {Object} node A DOM element.
 * @param {String} name	  The property name to set.
 * @param {String} value  The property value to set.
 */
let setValueForProperty = (node, name, value) => {
	if (name === 'value' && (getNodeName(node) === 'select')) {
		setSelectValue(node, value);
	} else {
		node[name] !== value && (node[name] = value);
	}
};

/**
 * Unsets an attribute
 *
 * @param {Object element} node - A DOM element.
 * @param {String} name - The attribute name to remove.
 */
let removeAttribute = (node, name) => {
	node.removeAttribute(attrNameCfg[name] || name);
};

/**
 * Unsets a property
 *
 * @param {Object} node A DOM element.
 * @param {String} name - The property name to set.
 */
let removeProperty = (node, name) => {
	if (name === 'value' && (getNodeName(node) === 'select')) {
		removeSelectValue(node);
	} else {
		node[name] = hasPropertyAccessor(node, name);
	}
};

/**
 * Set select / select multiple
 *
 * @param {Object} node  A DOM element.
 * @param {String|Array} value  The property value to set.
 */
let setSelectValue = (node, value, children) => {

	const arrayish = isArray(value),
		options = node.options,
		len = options.length;

	let i = 0,
		optionNode;

	while (i < len) {
		optionNode = options[i++];
		optionNode.selected = value != null && (arrayish ? inArray(value, optionNode.value) : optionNode.value == value);
	}
};

/**
 * Unsets a select / select multiple property from a DOM node
 *
 * @param {Object} node A DOM element.
 */
let removeSelectValue = node => {
	const options = node.options,
		len = options.length;

	let i = 0;

	while (i < len) {
		options[i++].selected = false;
	}
};

/**
 * Transform HTML attributes to a string for SSR rendring
 *
 * @param {string} name
 * @param {*} value
 * @return {string} Markup string, or empty string if the property was invalid.
 */
let createAttributeMarkup = (name, value) => {
 if (!validateAttribute( name ) || value == null) {
    return '';
 }
   return `${ attrNameCfg[name] || name }="${ escapeHtml(value + '') }"`;
}

/**
 * Render HTML markup from a dataset property for SSR rendring
 *
 * @param {String} name The name to be set.
 * @param {Object} value  The value to be set.
 */
let datasetToString = (name, value) => {

	let objL = '';

	for (let objName in value) {
		objL += value[objName] != null && ( 'data-' + objName + '="' + dasherize(value[objName]) + '" ');
	}
	return objL;
}

/**
 * Render HTML markup from boolean attributes to string for SSR rendring
 *
 * @param {String} name  The attribute name to set.
 * @param {String} value  The attribute value to set.
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
}

/**
 * Render CSS style property to string for SSR rendring
 *
 * @param  {String} name  The attribute name to set.
 * @param  {String} value The property value to set.
 */
let createPropertyMarkup = (name, value) => {
	let styles = '';

	for (let styleName in value) {
		value[styleName] != null && (styles += dasherize(styleName) + ':' + normalize(styleName, value[styleName]) + ';');
	}

	return styles ? `${ name }="${ styles }"` : styles;
};

let IS_ATTRIBUTE = {
	set: setAttribute,
	remove: removeAttribute,
	toHtml: createAttributeMarkup
};

let IS_CUSTOM = {
	set: setCustomAttribute,
	remove: removeAttribute,
	toHtml: createAttributeMarkup
};

let IS_VOLUME_ATTRIBUTE = {
	set: setVolumAttribute,
	remove: removeAttribute,
	toHtml: createAttributeMarkup
};

let IS_INFERNO_ATTRIBUTE = {
	set: setInfernoAttribute,
	remove: removeAttribute,
	toHtml: createAttributeMarkup
};

let IS_NUMERIC = {
	set: setNumericAttribute,
	remove: removeAttribute,
	toHtml: createAttributeMarkup
};

let IS_BOOLEAN_ATTRIBUTE = {
	set: setBooleanAttribute,
	remove: removeAttribute,
	toHtml: createAttributeMarkup
};

let IS_PROPERTY = {
	set: setProperty,
	remove: removeProperty,
	toHtml: createAttributeMarkup
};

let IS_SELECTED_PROPERTY = {
	set: setSelectedIndexProperty,
	remove: removeProperty,
	toHtml: createAttributeMarkup
};

let IS_BOOLEAN_PROPERTY = {
	set: setBooleanProperty,
	remove: removeProperty,
	toHtml: booleanAttrToString
};

let IS_XLINK_NAMESPACE = {
	
	/**
	 * Set xlink namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name  The attribute name to set.
	 * @param  {String} value	The attribute value to set.
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/1999/xlink', xlinkMap[name], value);
	},

	/**
	 * Unsets a xlink namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name  The attribute name to set.
	 * @param  {String} name  The attribute name to unset.
	 */
	remove(node, name) {
		node.removeAttributeNS('http://www.w3.org/1999/xlink', xlinkMap[name]);
	},
	toHtml:createAttributeMarkup
};

let IS_XML_NAMESPACE = {

	/**
	 * Set xlink namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name The attribute name to set.
	 * @param  {String} value The attribute value to set.
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/XML/1998/namespace', xmlMap[name], value);
	},
	
	/**
	 * Unsets a xml namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name The attribute name to unset.
	 */
	remove(node, name) {
		node.removeAttributeNS('http://www.w3.org/XML/1998/namespace', xmlMap[name]);
	},
	toHtml:createAttributeMarkup
};

let DOMConfig = {
	acceptCharset: IS_ATTRIBUTE,
	accept: IS_ATTRIBUTE,
	allowFullScreen: IS_BOOLEAN_ATTRIBUTE,
	allowTransparency: IS_ATTRIBUTE,

	async: IS_BOOLEAN_ATTRIBUTE,
	autoFocus: IS_BOOLEAN_ATTRIBUTE,
	autoPlay: IS_BOOLEAN_PROPERTY,
	capture: IS_BOOLEAN_ATTRIBUTE,
	charSet: IS_ATTRIBUTE,
	challenge: IS_ATTRIBUTE,
	checked: IS_BOOLEAN_PROPERTY,
	classID: IS_ATTRIBUTE,
	className: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
	clipPath: IS_ATTRIBUTE,
	cols: IS_NUMERIC,
	crossOrigin: IS_ATTRIBUTE,
	contentEditable: IS_PROPERTY,
	contextMenu: IS_ATTRIBUTE,
	controls: IS_BOOLEAN_PROPERTY,
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
		// because it's set as an attribute - e.g. data-foo="bar"
		remove: removeAttribute,
		toHtml: datasetToString
	},
	default: IS_BOOLEAN_ATTRIBUTE,
	data: IS_ATTRIBUTE,
	defer: IS_BOOLEAN_ATTRIBUTE,
	declare: IS_BOOLEAN_ATTRIBUTE,
    defaultPlaybackRate: IS_PROPERTY,
	defaultchecked: IS_BOOLEAN_ATTRIBUTE,
	defaultmuted: IS_BOOLEAN_ATTRIBUTE,
	defaultselected: IS_BOOLEAN_ATTRIBUTE,
	designMode: IS_PROPERTY,
	dir: IS_ATTRIBUTE,
	disabled: IS_BOOLEAN_ATTRIBUTE,
	draggable: IS_BOOLEAN_ATTRIBUTE,
	dropzone: IS_ATTRIBUTE,
	dx: IS_ATTRIBUTE,
	dy: IS_ATTRIBUTE,
	download: IS_BOOLEAN_ATTRIBUTE,
	encType: IS_ATTRIBUTE,
	file: IS_ATTRIBUTE,
	fill: IS_ATTRIBUTE,
	fillOpacity: IS_ATTRIBUTE,
	forceSpellCheck: IS_PROPERTY,
	form: IS_ATTRIBUTE,
	formAction: IS_ATTRIBUTE,
	formEncType: IS_ATTRIBUTE,
	formMethod: IS_ATTRIBUTE,
	formNoValidate: IS_BOOLEAN_ATTRIBUTE,
	formTarget: IS_ATTRIBUTE,
	fontFamily: IS_ATTRIBUTE,
	fontSize: IS_ATTRIBUTE,
	frameBorder: IS_ATTRIBUTE,
	for: IS_ATTRIBUTE,
	fx: IS_ATTRIBUTE,
	fy: IS_ATTRIBUTE,
	height: IS_PROPERTY,
	hidden: IS_BOOLEAN_ATTRIBUTE,
	href: IS_ATTRIBUTE,
	htmlfor: IS_PROPERTY,
	icon: IS_ATTRIBUTE,
	id: IS_PROPERTY,
	inputMode: IS_ATTRIBUTE,
	is: IS_ATTRIBUTE,
	ismap: IS_BOOLEAN_PROPERTY,
	key: IS_INFERNO_ATTRIBUTE,
	keyParams: IS_ATTRIBUTE,
	keyType: IS_ATTRIBUTE,
	label: IS_PROPERTY,
	lang: IS_ATTRIBUTE,
	list: IS_ATTRIBUTE,
	loop: IS_BOOLEAN_PROPERTY,
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
	muted: IS_BOOLEAN_PROPERTY,
	multiple: IS_BOOLEAN_PROPERTY,
	name: IS_PROPERTY,
	nohref: IS_ATTRIBUTE,
	// number used once or number once
	nonce: IS_NUMERIC, 
	noshade: IS_ATTRIBUTE,
	noValidate: IS_BOOLEAN_ATTRIBUTE,
	opacity: IS_ATTRIBUTE,
	open: IS_BOOLEAN_ATTRIBUTE,
	placeholder: IS_PROPERTY,
	playbackRate: IS_PROPERTY,
	points: IS_ATTRIBUTE,
	poster: IS_ATTRIBUTE,
	preload: IS_PROPERTY,
	r: IS_ATTRIBUTE,
	readOnly: IS_BOOLEAN_PROPERTY,
	ref: IS_INFERNO_ATTRIBUTE,
	reversed: IS_BOOLEAN_PROPERTY,
	required: IS_BOOLEAN_PROPERTY,
	role: IS_ATTRIBUTE,
	rows: IS_NUMERIC,
	rx: IS_ATTRIBUTE,
	ry: IS_ATTRIBUTE,
	scoped: IS_BOOLEAN_ATTRIBUTE,
	seamless: IS_BOOLEAN_ATTRIBUTE,
	selected: IS_BOOLEAN_PROPERTY,
	selectedIndex: IS_SELECTED_PROPERTY,
	size: IS_NUMERIC,
	// Viewport-based selection
	sizes: IS_ATTRIBUTE,
	sortable: IS_BOOLEAN_ATTRIBUTE,
	span: IS_NUMERIC,
	spellCheck: IS_BOOLEAN_PROPERTY,
	stroke: IS_ATTRIBUTE,
	src: IS_ATTRIBUTE,
	srcDoc: IS_PROPERTY,
	srcSet: IS_ATTRIBUTE,
	start: IS_ATTRIBUTE,
	step: IS_ATTRIBUTE,
	tabIndex: IS_ATTRIBUTE,
	target: IS_ATTRIBUTE,
	transform: IS_ATTRIBUTE,
	title: IS_ATTRIBUTE,
	type: IS_ATTRIBUTE,
	
	/**
	 * CSS styling attribute is a special case, and will be set as a normal object.
	 * 'styles' should be used as an replacement.
	 */
	style: {
		set: setPropertyForStyle,
		remove: removeProperty,
		toHtml: createPropertyMarkup
	},
	translate: IS_BOOLEAN_ATTRIBUTE,
	truespeed: IS_BOOLEAN_PROPERTY,
	typemustmatch: IS_BOOLEAN_ATTRIBUTE,
	usemap: IS_ATTRIBUTE,

	/**
	 * 'value' is a special case
	 *
	 */
	value: {
		set: setValueForProperty,
		remove: removeProperty,
		toHtml: createAttributeMarkup
	},
	version: IS_ATTRIBUTE,
	viewBox: IS_ATTRIBUTE,

	visible: IS_BOOLEAN_ATTRIBUTE,
	volume: IS_VOLUME_ATTRIBUTE,
	width: IS_PROPERTY,
	wmode: IS_ATTRIBUTE,
	x1: IS_ATTRIBUTE,
	x2: IS_ATTRIBUTE,
	x: IS_ATTRIBUTE,
	y1: IS_ATTRIBUTE,
	y2: IS_ATTRIBUTE,
	y: IS_ATTRIBUTE,

	/**
	 * Non-standard properties
	 */

	// itemProp, itemScope, itemType are for
	// Microdata support. See http://schema.org/docs/gs.html
	itemProp: IS_ATTRIBUTE,
	itemScope: IS_BOOLEAN_ATTRIBUTE,
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
	'xlink:type': IS_XLINK_NAMESPACE
};

export default {

/**
 * Sets a HTML attribute / property
 *
 * @param {Object} node A DOM element.
 * @param {String} name The boolean attribute name to set.
 * @param {String|Object} value The boolean attribute value to set.
 */
	set: (node, name, value) => (DOMConfig[name] || IS_CUSTOM).set(node, name, value),
/**
 * Unsets a HTML attribute / property
 *
 * @param {Object} node A DOM element.
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
	remove: (node, name) => (DOMConfig[name] || IS_CUSTOM).remove(node, name),
/**
 * Create HTML attribute / property markup for SSR
 *
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
	toHtml: (name, value) => (DOMConfig[name] || IS_CUSTOM).toHtml(name, value)
};