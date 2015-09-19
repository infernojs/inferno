import attrPropCfg from './cfg/attrPropCfg';
import nsCfg from './cfg/nsCfg';
import attrNameCfg from './cfg/attrNameCfg';
import propNameCfg from './cfg/propNameCfg';
import checkBitmask from './checkBitmask';
import hooks from './hooks';
import memoizeString from './memoizeString';
import shouldIgnoreValue from './shouldIgnoreValue';
import masks from './vars/masks';
import escapeHtml from './escapeHtml';
import hasPropertyAccessor from './hasPropertyAccessor';

let propInfo = {},
    properties = {},
    {
        MUST_USE_ATTRIBUTE,
        MUST_USE_PROPERTY,
        SET_WITH_CHECK,
        HAS_BOOLEAN_VALUE,
        HAS_NUMERIC_VALUE,
        HAS_POSITIVE_NUMERIC_VALUE,
        HAS_OVERLOADED_BOOLEAN_VALUE
    } = masks;
	
// Populate the 'properties' object
for(let propName in attrPropCfg) {
		let propConfig = attrPropCfg[propName];

	propInfo = {
		attributeName: propName.toLowerCase(),
		attributeNamespace: null,
		propertyName: propName,
		hooks: null,

		mustUseAttribute: checkBitmask(propConfig, MUST_USE_ATTRIBUTE),
		mustUseProperty: checkBitmask(propConfig, MUST_USE_PROPERTY),
		setWithCheck: checkBitmask(propConfig, SET_WITH_CHECK),
		hasBooleanValue: checkBitmask(propConfig, HAS_BOOLEAN_VALUE),
		hasNumericValue: checkBitmask(propConfig, HAS_NUMERIC_VALUE),
		hasPositiveNumericValue: checkBitmask(propConfig, HAS_POSITIVE_NUMERIC_VALUE),
		hasOverloadedBooleanValue: checkBitmask(propConfig, HAS_OVERLOADED_BOOLEAN_VALUE)
	};

	if (attrNameCfg[propName]) {
		propInfo.attributeName = attrNameCfg[propName];
	} else if (propNameCfg[propName]) {
		propInfo.propertyName = propNameCfg[propName];
	}

	if (nsCfg[propName]) {
		propInfo.attributeNamespace = nsCfg[propName];
	}

	if (hooks[propName]) {
		propInfo.hooks = hooks[propName];
	}

	properties[propName] = propInfo;
}

/**
 * Convert HTML attributes / properties to HTML
 * @param { string} name
 * @param { string} value
 * @return { string}
 */
function renderHtmlMarkup(name, value) {

	let propInfo = properties[name] || null;

	if (propInfo) {
		if (shouldIgnoreValue(propInfo, value)) {
			return '';
		}

		let attributeName = propInfo.attributeName;

		// for BOOLEAN `value` only has to be truthy
		// for OVERLOADED_BOOLEAN `value` has to be === true
		if (propInfo.hasBooleanValue ||
			(propInfo.hasOverloadedBooleanValue && value === true)) {
			return attributeName + '=\'\'';
		}
		return memoizeString(name) + escapeHtml(value) + '\'';

	}
    else {
		if (value === null) {
			return '';
		}
		return name + '=' + '\'' + escapeHtml(value) + '\'';
	}
}
/**
 * Remove a HTML attribute / property from DOM
 * @param { string} name
 */
function removeFromDOM(node, name) {
	let propInfo = properties[name] || null;
	if (propInfo) {
		let hooks = propInfo.hooks;
		if (hooks) {
			hooks(node, undefined);
		} else if (propInfo.mustUseAttribute) {
			node.removeAttribute(propInfo.attributeName);
		} else {
			let propName = propInfo.propertyName,
				initialValue = hasPropertyAccessor(node.nodeName, propName);

			if (!propInfo.setWithCheck || (('' + node[propName]) !== initialValue)) {
				node[propName] = initialValue;
			}
		}
	} else {
		if ( name ) {
		node.removeAttribute(name);
	  }	
	}
}

/**
 * Sets the value for a attribute on a DOM node
 * @param {DOMElement} node
 * @param {string} name
 * @param {string} value
 * @param {Boolean} property true/false for HTML property
 * @return {*} value
 */
function setAttribute(node, name, value, property) {

	let propInfo = properties[name] || null;

	if (propInfo) {

		let hooks = propInfo.hooks;

		if (hooks) {
			hooks(node, value);
		} else if (shouldIgnoreValue(propInfo, value)) {
			removeFromDOM(node, name);
			// HTML attributes
		} else if (propInfo.mustUseAttribute) {

			let attributeName = propInfo.attributeName,
				namespace = propInfo.attributeNamespace;
			if (namespace) {
				node.setAttributeNS(namespace, attributeName, '' + value);
            // for BOOLEAN `value` only has to be truthy
            // for OVERLOADED_BOOLEAN `value` has to be === true				
			} else if (propInfo.hasBooleanValue) { 
                  if ( value === true) {
				   node.setAttribute(attributeName, '');
				   } else {
				   // HTML5 compat
					node.setAttribute(attributeName, value);
					}
			} else if (propInfo.hasOverloadedBooleanValue && value === true) { 
				   node.setAttribute(attributeName, '');
			} else {
				node.setAttribute(attributeName, '' + value);
			}
			// HTML properties
		} else {
			let propName = propInfo.propertyName;
			if (!propInfo.setWithCheck || (node[propName] !== value)) {
				node[propName] = value;
			} 
		}

	}
    else {
        // custom properties
		if (property) {
			node[name] = value;
			// custom attributes
		}
        else {
			node.setAttribute(name, '' + value);
		}
	}
}

export { renderHtmlMarkup, setAttribute };
