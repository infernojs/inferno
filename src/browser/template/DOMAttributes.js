import attrPropCfg from "./cfg/attrPropCfg";
import nsCfg from "./cfg/nsCfg";
import attrNameCfg from "./cfg/attrNameCfg";
import propNameCfg from "./cfg/propNameCfg";
import checkMask from "./checkMask";
import hooks from "./hooks";
import masks from "./vars/masks";

let
    MUST_USE_ATTRIBUTE = masks.MUST_USE_ATTRIBUTE,
    MUST_USE_PROPERTY = masks.MUST_USE_PROPERTY,
    HAS_SIDE_EFFECTS = masks.HAS_SIDE_EFFECTS,
    HAS_BOOLEAN_VALUE = masks.HAS_BOOLEAN_VALUE,
    HAS_NUMERIC_VALUE = masks.HAS_NUMERIC_VALUE,
    HAS_POSITIVE_NUMERIC_VALUE = masks.HAS_POSITIVE_NUMERIC_VALUE,
    HAS_OVERLOADED_BOOLEAN_VALUE = masks.HAS_OVERLOADED_BOOLEAN_VALUE;

let properties = {},

    isStandardName = {},

    getAttributeName = {},

    hasNumericValue = {},

    hasPositiveNumericValue = {},

    hasBooleanValue = {},

    hasOverloadedBooleanValue = {},

    hasSideEffects = {};


for (let propName in attrPropCfg) {

    let lowerCased = propName.toLowerCase();
    let propConfig = attrPropCfg[propName];

    let propertyInfo = {
        attributeName: lowerCased,
        attributeNamespace: null,
        propertyName: propName,
        hooks: null,

        mustUseAttribute: checkMask(propConfig, MUST_USE_ATTRIBUTE),
        mustUseProperty: checkMask(propConfig, MUST_USE_PROPERTY),
        hasSideEffects: checkMask(propConfig, HAS_SIDE_EFFECTS),
        hasBooleanValue: checkMask(propConfig, HAS_BOOLEAN_VALUE),
        hasNumericValue: checkMask(propConfig, HAS_NUMERIC_VALUE),
        hasPositiveNumericValue: checkMask(propConfig, HAS_POSITIVE_NUMERIC_VALUE),
        hasOverloadedBooleanValue: checkMask(propConfig, HAS_OVERLOADED_BOOLEAN_VALUE),
    };


    if (attrNameCfg.hasOwnProperty(propName)) {
        propertyInfo.attributeName = attrNameCfg[propName];
    }

    if (nsCfg[propName]) {
        propertyInfo.attributeNamespace = nsCfg[propName];
    }

    if (propNameCfg[propName]) {
        propertyInfo.propertyName = propNameCfg[propName];
    }


    if (hooks[propName]) {
        propertyInfo.hooks = hooks[propName];
    }
    properties[propName] = propertyInfo;
}


function shouldIgnoreValue(name, value) {
    return value == null ||
        (hasBooleanValue[name] && !value) ||
        (hasNumericValue[name] && isNaN(value)) ||
        (hasPositiveNumericValue[name] && (value < 1)) ||
        (hasOverloadedBooleanValue[name] && value === false);
}

function deleteValueForProperty(node, name) {
    let propertyInfo = properties[name] ?
        properties[name] : null;
    if (propertyInfo) {
        let hooks = propertyInfo.hooks;
        if (hooks) {
            hooks(node, undefined);
        } else if (propertyInfo.mustUseAttribute) {
            node.removeAttribute(propertyInfo.attributeName);
        } else {
            let propName = propertyInfo.propertyName;
            let defaultValue = getDefaultValueForProperty(
                node.nodeName,
                propName
            );

            if (!propertyInfo.hasSideEffects ||
                ("" + node[propName]) !== defaultValue) {
                node[propName] = defaultValue;
            }
        }
    } else {
        node.removeAttribute(name);
    }
}


export default function(node, name, value) {

    let propertyInfo = properties[name] ? properties[name] : null;

    if (propertyInfo) {

        let hooks = propertyInfo.hooks;

        if (hooks) {
            hooks(node, value);
        } else if (shouldIgnoreValue(propertyInfo, value)) {
            this.deleteValueForProperty(node, name);
        } else if (propertyInfo.mustUseAttribute) {
            let attributeName = propertyInfo.attributeName;
            let namespace = propertyInfo.attributeNamespace;
            if (namespace) {
                node.setAttributeNS(namespace, attributeName, "" + value);
            } else if (propertyInfo.hasBooleanValue ||
                (propertyInfo.hasOverloadedBooleanValue && value === true)) {
                node.setAttribute(attributeName, "");
            } else {
                node.setAttribute(attributeName, "" + value);
            }
        } else {
            let propName = propertyInfo.propertyName;
            if (!propertyInfo.hasSideEffects || ("" + node[propName]) !== ("" + value)) {
                node[propName] = value;
            }
        }
    } else {
        node.setAttribute(name, "" + value);
    }
};