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
import hook from './hooks';

/**
 * Set attributes on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} attrName	  The attribute name to set.
 * @param {String} attrValue The attribute value to set.
 */
let setAttribute = (node, attrName, attrValue) => {
    // Avoid touching the DOM on falsy values
    if (attrValue !== 'false') {

        if (hook[attrName]) {

            hook[attrName](node, attrName, attrValue);
        } else {
            node.setAttribute(attrNameCfg[attrName] || attrName, attrValue);
        }
    }
};

/**
 * Set boolean attributes
 *
 * @param  {Object} node A DOM element.
 * @param  {String} attrName  The boolean attribute name to set.
 * @param {String} attrValue The boolean attribute value to set.
 */
let setBooleanAttribute = (node, attrName, attrValue) => {
	if (attrValue !== 'false') {
       node.setAttribute(attrName, '' + ((attrValue === 'true') ? '' : attrValue));
	}
};

/**
 * Set custom attributes on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} attrName	  The attribute name to set.
 * @param {String} attrValue The attribute value to set.
 */
let setCustomAttribute = (node, attrName, attrValue) => {
	// Custom attributes are the only arributes we are validating.
    if (validateAttribute( attrName )) {
	// All attributes are lowercase
	  node.setAttribute((attrNameCfg[attrName] || attrName).toLowerCase(), '' + attrValue); // cast to string
	}
};

/**
 * Set numeric attributes on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} attrName	  The numeric attribute name to set.
 * @param {String} attrValue  The numeric attribute value to set.
 */
let setNumericAttribute = (node, attrName, attrValue) => {
	  if (attrValue > 0 && (typeof attrValue === 'number')) {
		node.setAttribute(attrName, attrValue);
	}
};

/**
 * Set properties on a DOM node
 *
 * @param {Object} node A DOM element.
 * @param {String} propertyName	  The property name to set.
 * @param {String} propValue	 The property value to set.
 */
let setProperty = (node, propertyName, propValue) => {

    if (propValue != null) {
	
        if (hook[propertyName]) {
            hook[propertyName](node, propertyName, propValue);
        } else {

        // 'contentEditable' is a special case
        if (propertyName === 'contentEditable' && (propValue)) {

            /**
             * We would need this check here, else it will throw:
             *
             * ' Failed to set the 'contentEditable' property on 'HTMLElement': The value 
             * ' provided ('contentEditable') is not one of 'true', 'false', 'plaintext-only', or 'inherit'.'
             */

                // Workaround for the 'contentEditable' property
                let cEValue;
                switch (propValue) {
                    case true:
                        cEValue = propValue;
                        break;
                    case false:
                        cEValue = propValue;
                        break;
                    case 'plaintext-only':
                        cEValue = propValue;
                        break;
                    case 'inherit':
                        cEValue = propValue;
                        break;
                    default:
                        cEValue = 'inherit';
                }

                propValue = cEValue;
        }

        node[propNameCfg[propertyName] || propertyName] = propValue;
    }
  }	
};

/**
 * Set boolean property
 *
 * @param {Object} node A DOM element.
 * @param {String} propertyName	  The boolean property propertyName to set.
 * @param {String} propValue  The boolean property value to set.
 */
let setBooleanProperty = (node, propertyName, propValue) => {
	node[propertyName] = !!propValue;
};

/**
 * Set dataset object properties
 *
 * @param {Object} node A DOM element.
 * @param {String} propertyName  The property propertyName to set.
 * @param {String} propValue  The property value to set.
 */
let setPropertyForDataset = (node, propertyName, propValue) => {
	if (process.env.NODE_ENV !== 'production') {
		let typeOfVal = typeof propValue;
		if (typeOfVal !== 'object') {
			console.error(`Error! "${propertyName}" attribute expects an object as a value, not a ${typeOfVal}`);
			return;
		}
	}

	let prop = node[propertyName];

	for (let idx in propValue) {
      // regarding the specs we need to camelize the 'propertyName'
		prop[camelize(idx)] = propValue[idx] == null ? '' : dasherize(propValue[idx]);
	}
};

let setPropertyForStyle = (node, propertyName, propValue) => {
	// CSS style need to be a object literal, not a string value
	if (process.env.NODE_ENV !== 'production') {
		let typeOfVal = typeof propValue;
		if (typeOfVal !== 'object') {
			console.error(`Error! "${propertyName}" attribute expects an object as a value, not a ${typeOfVal}`);
			return;
		}
	}

	let prop = node[propertyName];

	for (let idx in propValue) {
		node.style[idx] = (propValue[idx] == null) ? '' : normalizeCSS(idx, propValue[idx]);
	}
};

/**
 * Set 'value' property after validation check
 *
 * @param {Object} node A DOM element.
 * @param {String} propertyName	  The property propertyName to set.
 * @param {String} propValue  The property value to set.
 */
let setValueForProperty = (node, propertyName, propValue) => {
	if (propertyName === 'value' && (tagName(node) === 'select')) {
		setSelectValue(node, propValue);
	} else {
		// Need to validate this else it will fail when we update fragments etc.
		node[propertyName] !== propValue && (node[propertyName] = propValue);
	}
};

/**
 * Unsets an attribute
 *
 * @param {Object element} node - A DOM element.
 * @param {String} name - The attribute name to remove.
 */
let removeAttribute = (node, attrName) => {
	node.removeAttribute(attrNameCfg[attrName] || attrName);
};

/**
 * Unsets a property
 *
 * @param {Object} node A DOM element.
 * @param {String} propertyName - The property name to set.
 */
let removeProperty = (node, propertyName) => {
	// 'select' is a special case
	if (propertyName === 'value' && (tagName(node) === 'select')) {
		removeSelectValue(node);
	} else if (propertyName === 'className') {	
	    node.className = '';
	} else {
		node[propertyName] = hasPropertyAccessor(node, propertyName);
	}
};

/**
 * Set select / select multiple
 *
 * @param {Object} node  A DOM element.
 * @param {String|Array} value  The property value to set.
 */

let setSelectValue = (node, value) => {

	const arrayish = isArray(value),
		options = node.options;

	let i = 0,
		optionNode;
   for (let i = 0; i < options.length; i++) { 
		optionNode = options[i];
		optionNode.selected = value != null && (arrayish ? inArray(value, optionNode.value) : optionNode.value == value);
	}
};

/**
 * Unsets a select / select multiple property from a DOM node
 *
 * @param {Object} node A DOM element.
 */
let removeSelectValue = node => {
   for (let i = 0; i < node.options.length; i++) { 
		node.options[i].selected = false;
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
  return (!validateAttribute( name ) || value == null) ? '' : `${ attrNameCfg[name] || name }="${ escapeHtml(value + '') }"`;
}

/**
 * Render HTML markup from a dataset property for SSR rendring
 *
 * @param {String} name The name to be set.
 * @param {Object} value  The value to be set.
 */
let datasetToString = (name, value) => {

	let objectLiteral = '';

	for (let objName in value) {
		objectLiteral += value[objName] != null && ( 'data-' + objName + '="' + dasherize(value[objName]) + '" ');
	}
	return objectLiteral;
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
		value[styleName] != null && (styles += dasherize(styleName) + ':' + normalizeCSS(styleName, value[styleName]) + ';');
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

let IS_BOOLEAN_PROPERTY = {
	set: setBooleanProperty,
	remove: removeProperty,
	toHtml: booleanAttrToString
};
 
 /****************************** NOTE!! *************************************
  *                                                                         *
  * Both xlink and xml namespace attrs are removed in the upcoming SVG 2.0. *
  *                                                                         *
  **************************************************************************/
let IS_XLINK_NAMESPACE = {
	
	/**
	 * Set xlink namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name  The attribute name to set.
	 * @param  {String} value	The attribute value to set.
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/1999/xlink', xlinkCfg[name], value);
	},

	/**
	 * Unsets a xlink namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name  The attribute name to set.
	 * @param  {String} name  The attribute name to unset.
	 */
	remove(node, name) {
		node.removeAttributeNS('http://www.w3.org/1999/xlink', xlinkCfg[name]);
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
		node.setAttributeNS('http://www.w3.org/XML/1998/namespace', xmlCfg[name], value);
	},
	
	/**
	 * Unsets a xml namespace attribute
	 *
	 * @param  {Object} node A DOM element.
	 * @param  {String} name The attribute name to unset.
	 */
	remove(node, name) {
		node.removeAttributeNS('http://www.w3.org/XML/1998/namespace', xmlCfg[name]);
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
	defer: IS_BOOLEAN_PROPERTY,
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
	height: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
	hidden: IS_BOOLEAN_ATTRIBUTE,
	href: IS_ATTRIBUTE,
	htmlfor: IS_PROPERTY,
	icon: IS_ATTRIBUTE,
	id: IS_PROPERTY,
	inputMode: IS_ATTRIBUTE,
	is: IS_ATTRIBUTE,
	ismap: IS_BOOLEAN_PROPERTY,
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
	noResize: IS_BOOLEAN_PROPERTY,
	// number used once or number once
	nonce: IS_NUMERIC, 
	noshade: IS_ATTRIBUTE,
	noValidate: IS_BOOLEAN_PROPERTY,
	opacity: IS_ATTRIBUTE,
	open: IS_BOOLEAN_ATTRIBUTE,
	placeholder: IS_PROPERTY,
	playbackRate: IS_PROPERTY,
	points: IS_ATTRIBUTE,
	poster: IS_ATTRIBUTE,
	preload: IS_PROPERTY,
	r: IS_ATTRIBUTE,
	readOnly: IS_BOOLEAN_PROPERTY,
	reversed: IS_BOOLEAN_PROPERTY,
	required: IS_BOOLEAN_PROPERTY,
	role: IS_ATTRIBUTE,
	rows: IS_NUMERIC,
	rx: IS_ATTRIBUTE,
	ry: IS_ATTRIBUTE,
	scoped: IS_BOOLEAN_ATTRIBUTE,
	seamless: IS_BOOLEAN_ATTRIBUTE,
	selected: IS_BOOLEAN_PROPERTY,
	selectedIndex: IS_PROPERTY,
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
	tabIndex: IS_PROPERTY,
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
	volume: IS_ATTRIBUTE,
	width: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
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
 * @param {String} name The attribute / property name to set.
 * @param {String|Object} value The attribute / property value to set.
 */
	set: (node, name, value, skip) => {
		
    // Prioritized HTML properties

    if (!skip) {

        switch (name) {

            case 'id':    // Core attribute
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
			
			if ( value != null) {
               node[name] = value;
			}
	
		return;
        }
    }

    // Prioritized HTML attributes
    switch (name) {

        case 'allowFullScreen': // bool
        case 'autoFocus': // bool
        case 'autoPlay': // bool
        case 'capture': // bool
        case 'default':
        case 'defaultchecked': // bool
        case 'defaultmuted': // bool
        case 'defaultselected': // bool
        case 'disabled': // bool
        case 'dir': // Core attribute
        case 'draggable': // bool
        case 'for':
        case 'formNoValidate': // bool
        case 'hidden': // bool
        case 'seamless':
        case 'sortable':
        case 'title': // Core attribute
        case 'type':
        
		if (value !== 'false') {
            node.setAttribute(name, '' + ((value === 'true') ? '' : value));
        }
		return;	
    }		
		
      return (DOMConfig[name] || IS_CUSTOM).set(node, name, value);
 },

/**
 * Unsets a HTML attribute / property
 *
 * @param {Object} node A DOM element.
 * @param {String} name The attribute / property name to set.
 * @param {String} value The attribute / property value to set.
 */
	remove: (node, name) => (DOMConfig[name] || IS_CUSTOM).remove(node, name),
/**
 * Create HTML attribute / property markup for SSR
 *
 * @param {String} name The attribute / property name to set.
 * @param {String} value The attribute / property value to set.
 */
	toHtml: (name, value) => (DOMConfig[name] || IS_CUSTOM).toHtml(name, value)
};