import attrPropCfg               from "./cfg/attrPropCfg";
import nsCfg                     from "./cfg/nsCfg";
import attrNameCfg               from "./cfg/attrNameCfg";
import propNameCfg               from "./cfg/propNameCfg";
import checkMask                 from "./checkMask";
import removeFromDOM             from "./removeFromDOM";
import hooks                     from "./hooks";
import memoizeString             from "./memoizeString";
import shouldIgnoreValue         from "./shouldIgnoreValue";
import masks                     from "./vars/masks";
import forIn                     from "../../util/forIn";
import escapeHtml                from "../shared/escapeHtml";
import hasNumericValue           from "./vars/hasNumericValue";
import hasPositiveNumericValue   from "./vars/hasPositiveNumericValue";
import hasOverloadedBooleanValue from "./vars/hasOverloadedBooleanValue";
import hasBooleanValue           from "./vars/hasBooleanValue";

let
    propertyInfo = {},

    properties = {},

    /**
     * Convert HTML attributes / properties to HTML
     * @param { string} name
     * @param { string} value
     * @return { string}
     */
    renderHtmlMarkup = (name, value) => {

        let propertyInfo = properties[name] || null;

        if (propertyInfo) {
            if (shouldIgnoreValue(propertyInfo, value)) {
                return "";
            }

            let attributeName = propertyInfo.attributeName;
         
		    // for BOOLEAN `value` only has to be truthy
            // for OVERLOADED_BOOLEAN `value` has to be === true
            if (propertyInfo.hasBooleanValue ||
                (propertyInfo.hasOverloadedBooleanValue && value === true)) {

                return attributeName + "=\"\"";
            }
            return memoizeString(name) + escapeHtml(value) + "\"";

        } else {
          
		    if (value == null) {
                return "";
            }

            return name + "=" + "\"" + escapeHtml(value) + "\"";
        }
    };

// Populate the 'properties' object
forIn(attrPropCfg, (propName, propConfig) => {

    propertyInfo = {
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
        hasOverloadedBooleanValue: checkMask(propConfig, masks.HAS_OVERLOADED_BOOLEAN_VALUE),
    };

    if (attrNameCfg[propName]) {
        propertyInfo.attributeName = attrNameCfg[propName];
    } else if (propNameCfg[propName]) {
        propertyInfo.propertyName = propNameCfg[propName];
    }

    if (nsCfg[propName]) {
        propertyInfo.attributeNamespace = nsCfg[propName];
    }

    if (hooks[propName]) {
        propertyInfo.hooks = hooks[propName];
    }

    properties[propName] = propertyInfo;
});

/**
 * Sets the value for a property on a DOM node
 * @param {DOMElement} node
 * @param {string} name
 * @param {string} value
 * @return {*} value
 */
function setHtml(node, name, value) {

    let propertyInfo = properties[name] || null;

    if (propertyInfo) {

        let hooks = propertyInfo.hooks;

        if (hooks) {
            hooks(node, value);
        } else if (shouldIgnoreValue(propertyInfo, value)) {
            removeFromDOM(node, name);
        // HTML attributes
		} else if (propertyInfo.mustUseAttribute) {
            let attributeName = propertyInfo.attributeName,
                namespace = propertyInfo.attributeNamespace;
            if (namespace) {
                node.setAttributeNS(namespace, attributeName, "" + value);
            } else if (propertyInfo.hasBooleanValue ||
                (propertyInfo.hasOverloadedBooleanValue && value === true)) {
                node.setAttribute(attributeName, "");
            } else {
                node.setAttribute(attributeName, "" + value);
            }
        // HTML properties
        } else {
            let propName = propertyInfo.propertyName;
           // Must explicitly cast values for HAS_SIDE_EFFECTS-properties to the
           // property type before comparing; only `value` does and is string.
            if (!propertyInfo.hasSideEffects || (node[propName] !== value)) {
                node[propName] = value;
            }
        }
// set custom attributes
    } else {
        node.setAttribute(name, "" + value);
    }
};

export { renderHtmlMarkup, setHtml };