import attrPropCfg from './cfg/attrPropCfg';
import nsCfg from './cfg/nsCfg';
import attrNameCfg from './cfg/attrNameCfg';
import propNameCfg from './cfg/propNameCfg';
import checkMask from './checkMask';
import hooks from './hooks';
import memoizeString from './memoizeString';
import shouldIgnoreValue from './shouldIgnoreValue';
import masks from './vars/masks';
import forIn from '../util/forIn';
import escapeHtml from './escapeHtml';
import hasPropertyAccessor from './hasPropertyAccessor';

let propInfo = {},
	properties = {};

// Populate the 'properties' object
forIn(attrPropCfg, (propName, propConfig) => {

	propInfo = {
		attributeName: propName.toLowerCase(),
		attributeNamespace: null,
		propertyName: propName,
		hooks: null,

		mustUseAttribute: checkMask(propConfig, masks.MUST_USE_ATTRIBUTE),
		mustUseProperty: checkMask(propConfig, masks.MUST_USE_PROPERTY),
		hasSideEffects: checkMask(propConfig, masks.HAS_SIDE_EFFECTS),
		hasBooleanValue: checkMask(propConfig, masks.HAS_BOOLEAN_VALUE),
		hasNumericValue: checkMask(propConfig, masks.HAS_NUMERIC_VALUE),
		hasPositiveNumericValue: checkMask(propConfig, masks.HAS_POSITIVE_NUMERIC_VALUE),
		hasOverloadedBooleanValue: checkMask(propConfig, masks.HAS_OVERLOADED_BOOLEAN_VALUE)
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
});

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

			if (!propInfo.hasSideEffects || ('' + node[propName]) !== initialValue) {
				node[propName] = initialValue;
			}
		}
	} else {
		node.removeAttribute(name);
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
			} else if (propInfo.hasBooleanValue ||
				(propInfo.hasOverloadedBooleanValue && value === true)) {
				// Avoid touching the DOM with 'removeAttribute'. Compare against 'false' instead
				if (value !== false) {
					node.setAttribute(attributeName, '');
				}
			} else {
				node.setAttribute(attributeName, '' + value);
			}
			// HTML properties
		} else {
			let propName = propInfo.propertyName;
			// Must explicitly cast values for HAS_SIDE_EFFECTS-properties to the
			// property type before comparing; only `value` does and is string.
			if (!propInfo.hasSideEffects || (node[propName] !== value)) {
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
