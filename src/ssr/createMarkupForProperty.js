import DOMProperties from '../template/DOMProperties';
import quoteAttributeValueForBrowser from './quoteAttributeValueForBrowser';
import propertyToAttributeMapping from '../template/propertyToAttributeMapping';
import camelCasePropsToDashCase from '../template/camelCasePropsToDashCase';

/**
 * Creates markup for HTML properties.
 *
 * @param {Object} propInfo
 * @param {*} value
 * @return {?string} Markup string, or null if the property was invalid.
 */
let renderMarkupForProperty = (propInfo, value) => {

    if (propInfo.propertyName === 'dataset') {

        let objectLiteral = '';
        for (let objName in value) {
            objectLiteral += value[objName] != null && ('data-' + objName + '="' + camelCasePropsToDashCase(value[objName]) + '" ');
        }
        return objectLiteral;

    } else {
        return `${propInfo.propertyName}=${quoteAttributeValueForBrowser(propInfo.hasBooleanValue ? (value === '' || value === propInfo.attributeName) : value)}`;
    }
}

/**
 * Creates markup for a HTML attributes.
 *
 * @param {Object} propInfo
 * @param {*} value
 * @return {?string} Markup string, or null if the property was invalid.
 */
let renderMarkupForAttribute = (propInfo, value) => `${(propertyToAttributeMapping[propInfo.attributeName] || propInfo.attributeName)}=${quoteAttributeValueForBrowser(propInfo.hasBooleanValue ? value : value)}`;

// Anything we don't set as an attribute is treated as a property
let getPropertySetter = (propInfo) => propInfo.mustUseAttribute ? renderMarkupForAttribute : renderMarkupForProperty;

/**
 * Creates markup for a property.
 *
 * @param {string} name
 * @param {*} value
 * @return {?string} Markup string, or null if the property was invalid.
 */
export default (name, value) => getPropertySetter(DOMProperties(name))(DOMProperties(name), value);