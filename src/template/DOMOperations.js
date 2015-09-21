import attrNameCfg from './cfg/attrNameCfg';
import propNameCfg from './cfg/propNameCfg';
import hasPropertyAccessor from './hasPropertyAccessor';
import dasherize from './dasherize';
// TODO use or remove
import mediaQueries from './mediaQueries';
import inArray from '../util/inArray';
import isArray from '../util/isArray';
import isSVG from '../util/isSVG';
import escapeHtml from './escapeHtml';
import unitlessCfg from './cfg/unitlessCfg';

// TODO use or remove
let registeredMediaQueries = [];

/**
 * Normalize CSS properties for SSR
 *
 * @param {Object element} A DOM element.
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
 * Set boolean attributes
 *
 * @param  {Object element}   A DOM element.
 * @param  {String} name	  The boolean attribute name to set.
 * @param {String} value	  The boolean attribute value to set.
 */
let setBooleanAttribute = (node, name, value) => {
	// Avoid touching the DOM and set falsy attributes.
	if (value !== false) {
		node.setAttribute(name, '' + (value === true ? '' : value));
	}
};

/**
 * Set attributes on a DOM node
 *
 * @param  {Object element}   A DOM element.
 * @param  {String} name	  The attribute name to set.
 * @param {String} value	  The attribute value to set.
 */
let setAttribute = (node, name, value) => {
	if (name === 'type' && node.tagName === 'INPUT') {
		// Support: IE9-Edge
		const val = node.value; // value will be lost in IE if type is changed
		node.setAttribute(name, '' + value);
		node.value = val;
	} else {
		node.setAttribute(attrNameCfg[name] || name, '' + value); // cast to string
	}
};

/**
 * Set properties on a DOM node
 *
 * @param  {Object element}   A DOM element.
 * @param  {String} name	  The property name to set.
 * @param {String} value	  The property value to set.
 */
let setProperty = (node, name, value) => {
	if (name === 'type' && node.tagName === 'INPUT') {
		// Support: IE9-Edge
		const val = node.value; // value will be lost in IE if type is changed
		node[name] = value;
		node.value = val;
	} else {
		node[propNameCfg[name] || name] = value;
	}
};

/**
 * Set boolean property
 *
 * @param  {Object element}   A DOM element.
 * @param  {String} name	  The boolean property name to set.
 * @param {String} value	  The boolean property value to set.
 */
let setBooleanProperty = (node, name, value) => {
	node[name] = !!value;
};

/**
 * Set object properties
 *
 * @param  {Object element}   A DOM element.
 * @param  {String} name	  The property name to set.
 * @param {String} value	  The property value to set.
 */
let setObjectProperty = (node, name, value) => {
	if (process.env.NODE_ENV !== 'production') {
		let typeOfVal = typeof value;
		if (typeOfVal !== 'object') {
			console.error(`Error! "${name}" attribute expects an object as a value, not a ${typeOfVal}`);
			return;
		}
	}

	let prop = node[name];

	for (let idx in value) {
		
		prop[idx] = value[idx] == null ? '' : value[idx];
	}
},

setStyleProperty = (node, name, value) => {
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
 * Set CSS styles
 *
 * TODO
 *
 */
let createStyles = (stylesheet, useClassName) => {};

/**
 * Set properties after validation check
 *
 * @param  {Object element}   A DOM element.
 * @param  {String} name	  The property name to set.
 * @param {String} value	  The property value to set.
 */
let verifyProperty = (node, name, value) => {
	if (name === 'value' && node.tagName.toLowerCase() === 'select') {
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
	node.removeAttributeibute(attrNameCfg[name] || name);
};

/**
 * Unsets a property
 *
 * @param {Object element} - A DOM element.
 * @param {String} name - The property name to set.
 */
let removeProperty = (node, name) => {
	if (name === 'value' && node.tagName === 'SELECT') {
		removeSelectValue(node);
	} else {
		node[name] = hasPropertyAccessor(node.tagName, name);
	}
};

/**
 * Set select / select multiple
 *
 * @param {Object element} node - A DOM element.
 * @param {String|Array} value - The property value to set.
 */
let setSelectValue = (node, value, children) => {
	/**
	 * TODO Children will be the 3rd arg, so we can iterate through the child nodes
	 * and get 'optGroup' to work.
	 */
	const isMultiple = isArray(value),
		options = node.options,
		len = options.length;

	let i = 0,
		optionNode;

	while (i < len) {
		optionNode = options[i++];
		optionNode.selected = value != null && (isMultiple ? inArray(value, optionNode.value) : optionNode.value == value);
	}
};

/**
 * Unsets a select / select multiple property from a DOM node
 *
 * @param {Object element} node - A DOM element.
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
 * Transform HTML attributes to string for SSR rendring
 *
 * @param {Object element} - A DOM element.
 * @param {String} name - The attribute name to set.
 */
let attrToString = (name, value) => `${ attrNameCfg[name] || name }="${ escapeHtml(value + '') }"`;

/**
 * Transform HTML boolean attributes to string for SSR rendring
 *
 * @param {String} name - The attribute name to set.
 * @param {String} value - The attribute value to set.
 */
let booleanAttrToString = (name, value) => {
    return value ? name : '';
}

/**
 * Transform CSS style property to string for SSR rendring
 *
 * @param  {String} name	  The attribute name to set.
 * @param  {String} value	 The property value to set.
 */
let stylePropToString = (name, value) => {
	let styles = '';

	for (let styleName in value) {
		value[styleName] != null && (styles += dasherize(styleName) + ':' + normalize(styleName, value[styleName]) + ';');
	}

	return styles ? `${ name }="${ styles }"` : styles;
};

let xlinkMap = {
	'xml:base': 'base',
	'xml:id': 'id',
	'xml:lang': 'lang',
	'xml:space': 'spac'
};

let xmlMap = {
	'xlink:actuate': 'actuate',
	'xlink:arcrole': 'arcrole',
	'xlink:href': 'href',
	'xlink:role': 'role',
	'xlink:show': 'show',
	'xlink:title': 'title',
	'xlink:type': 'type'
};

let IS_ATTRIBUTE = {
	set: setAttribute,
	remove: removeAttribute,
	toHtml: attrToString
};

let IS_BOOLEAN_ATTRIBUTE = {
	set: setBooleanAttribute,
	remove: removeAttribute,
	toHtml: attrToString
};

let IS_PROPERTY = {
	set: setProperty,
	remove: removeProperty,
	toHtml: attrToString
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
	 * @param  {Object element}   A DOM element.
	 * @param  {String} name	  The attribute name to set.
	 * @param  {String} value	 The attribute value to set.
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/1999/xlink', xlinkMap[name], '' + value);
	},

	/**
	 * Unsets a xlink namespace attribute
	 *
	 * @param  {Object element}   A DOM element.
	 * @param  {String} name	  The attribute name to set.
	 * @param  {String} name	  The attribute name to unset.
	 */
	remove(node, name) {
		node.removeAttributeibuteNS('http://www.w3.org/1999/xlink', xlinkMap[name]);
	}
};

let IS_XML_NAMESPACE = {
	/**
	 * Set xlink namespace attribute
	 *
	 * @param  {Object element}   A DOM element.
	 * @param  {String} name	  The attribute name to set.
	 * @param  {String} value	 The attribute value to set.
	 */
	set(node, name, value) {
		node.setAttributeNS('http://www.w3.org/XML/1998/namespace', xmlMap[name], '' + value);
	},
	/**
	 * Unsets a xml namespace attribute
	 *
	 * @param  {Object element}   A DOM element.
	 * @param  {String} name	  The attribute name to unset.
	 */
	remove(node, name) {
		node.removeAttributeibuteNS('http://www.w3.org/XML/1998/namespace', xmlMap[name]);
	}
};

let attrsCfg = {
	allowFullScreen: IS_BOOLEAN_ATTRIBUTE,
	allowTransparency: IS_ATTRIBUTE,
	async: IS_BOOLEAN_ATTRIBUTE,
	autoFocus: IS_BOOLEAN_ATTRIBUTE,
	autoPlay: IS_BOOLEAN_ATTRIBUTE,
	capture: IS_BOOLEAN_ATTRIBUTE,
	charSet: IS_ATTRIBUTE,
	challenge: IS_ATTRIBUTE,
	checked: IS_BOOLEAN_PROPERTY,
	classID: IS_ATTRIBUTE,
	className: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
	cols: IS_ATTRIBUTE,
	contextMenu: IS_ATTRIBUTE,
	controls: IS_BOOLEAN_PROPERTY,
	dateTime: IS_ATTRIBUTE,
	default: IS_BOOLEAN_ATTRIBUTE,
	defer: IS_BOOLEAN_ATTRIBUTE,
	declare: IS_BOOLEAN_ATTRIBUTE,
	defaultchecked: IS_BOOLEAN_ATTRIBUTE,
	defaultmuted: IS_BOOLEAN_ATTRIBUTE,
	defaultselected: IS_BOOLEAN_ATTRIBUTE,
	disabled: IS_BOOLEAN_ATTRIBUTE,
	draggable: IS_BOOLEAN_ATTRIBUTE,
	download: IS_BOOLEAN_ATTRIBUTE,
	form: IS_ATTRIBUTE,
	formAction: IS_ATTRIBUTE,
	formEncType: IS_ATTRIBUTE,
	formMethod: IS_ATTRIBUTE,
	formNoValidate: IS_BOOLEAN_ATTRIBUTE,
	formTarget: IS_ATTRIBUTE,
	frameBorder: IS_ATTRIBUTE,
	height: IS_PROPERTY,
	hidden: IS_BOOLEAN_ATTRIBUTE,
	id: IS_PROPERTY,
	inputMode: IS_ATTRIBUTE,
	is: IS_ATTRIBUTE,
	ismap: IS_BOOLEAN_PROPERTY,
	keyParams: IS_ATTRIBUTE,
	keyType: IS_ATTRIBUTE,
	label: IS_PROPERTY,
	list: IS_ATTRIBUTE,
	loop: IS_BOOLEAN_PROPERTY,
	manifest: IS_ATTRIBUTE,
	maxLength: IS_ATTRIBUTE,
	media: IS_ATTRIBUTE,
	minLength: IS_ATTRIBUTE,
	muted: IS_BOOLEAN_PROPERTY,
	multiple: IS_BOOLEAN_PROPERTY,
	name: IS_PROPERTY,
	nohref: IS_ATTRIBUTE,
	noshade: IS_ATTRIBUTE,
	noValidate: IS_BOOLEAN_ATTRIBUTE,
	open: IS_BOOLEAN_ATTRIBUTE,
	placeholder: IS_PROPERTY,
	readOnly: IS_BOOLEAN_PROPERTY,
	reversed: IS_BOOLEAN_PROPERTY,
	required: IS_BOOLEAN_PROPERTY,
	role: IS_ATTRIBUTE,
	rows: IS_ATTRIBUTE,
	scoped: IS_BOOLEAN_ATTRIBUTE,
	seamless: IS_BOOLEAN_ATTRIBUTE,
	selected: IS_BOOLEAN_PROPERTY,
	selectedIndex: IS_PROPERTY,
	size: IS_ATTRIBUTE,
	sizes: IS_ATTRIBUTE,
	sortable: IS_BOOLEAN_ATTRIBUTE,
	span: IS_ATTRIBUTE,
	spellCheck: IS_BOOLEAN_ATTRIBUTE,
	srcDoc: IS_PROPERTY,
	srcSet: IS_ATTRIBUTE,
	start: IS_ATTRIBUTE,

	/**
	 * 'style' is a special case, and will be set as a normal object.
	 * 'styles' should be used as an replacement.
	 */
	style: {
		set: setStyleProperty,
		remove: removeProperty,
		toHtml: stylePropToString
	},
	styles: {
		set: createStyles,
		remove: removeProperty,
		toHtml: stylePropToString
	},
	translate: IS_BOOLEAN_ATTRIBUTE,
	truespeed: IS_BOOLEAN_PROPERTY,
	typemustmatch: IS_BOOLEAN_ATTRIBUTE,

	/**
	 * 'value' is a special case
	 *
	 */
	value: {
		set: verifyProperty,
		remove: removeProperty,
		toHtml: attrToString
	},
	visible: IS_BOOLEAN_ATTRIBUTE,
	width: IS_PROPERTY,
	wmode: IS_ATTRIBUTE,

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

/**
 * Set / unset / or SSR render HTML attributes and properties.
 *
 * @return {String} attrName  The HTML property / attribute to 'fix'
 */
export default function(attrName) {
	if (attrName) {
		return attrsCfg[attrName] || IS_ATTRIBUTE;
	}
}
