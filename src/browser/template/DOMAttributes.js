import attrPropCfg            from "./cfg/attrPropCfg";
import nsCfg                  from "./cfg/nsCfg";
import attrNameCfg            from "./cfg/attrNameCfg";
import propNameCfg            from "./cfg/propNameCfg";
import checkMask              from "./checkMask";
import deleteValueForProperty from "./deleteValueForProperty";
import hooks                  from "./hooks";
import masks                  from "./vars/masks";
import forIn                  from "../../util/forIn";

let
    propertyInfo = {},

    properties = {},

    hasNumericValue = {},

    hasPositiveNumericValue = {},

    hasBooleanValue = {},

    hasOverloadedBooleanValue = {},

    shouldIgnoreValue = (name, value) => {
        return value == null ||
            (hasBooleanValue[name] && !value) ||
            (hasNumericValue[name] && isNaN(value)) ||
            (hasPositiveNumericValue[name] && (value < 1)) ||
            (hasOverloadedBooleanValue[name] && value === false);
    };

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

export default function(node, name, value) {

    let propertyInfo = properties[name] ? properties[name] : null;

    if (propertyInfo) {

        let hooks = propertyInfo.hooks;

        if (hooks) {
            hooks(node, value);
        } else if (shouldIgnoreValue(propertyInfo, value)) {
            deleteValueForProperty(node, name);
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
        } else {
            let propName = propertyInfo.propertyName;
            if (!propertyInfo.hasSideEffects || (node[propName] !== value)) {
                node[propName] = value;
            }
        }
    } else {
        node.setAttribute(name, "" + value);
    }
};