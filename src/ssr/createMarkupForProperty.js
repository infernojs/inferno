import DOMProperty                    from '../template/DOMProperty';
import getPropertyValue               from '../template/getPropertyValue';
import getAttributeValue              from '../template/getAttributeValue';
import quoteAttributeValueForBrowser  from './quoteAttributeValueForBrowser';

 /**
   * Creates markup for HTML properties.
   *
   * @param {Object} propInfo
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
let renderMarkupForProperty = (propInfo, value) => `${propInfo.propertyName}=${quoteAttributeValueForBrowser(getPropertyValue(propInfo, value))}`;

 /**
   * Creates markup for a HTML attributes.
   *
   * @param {Object} propInfo
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
let renderMarkupForAttribute = (propInfo, value) => `${propInfo.attributeName}=${quoteAttributeValueForBrowser(getAttributeValue(propInfo, value))}`;

// Anything we don't set as an attribute is treated as a property
let getPropertySetter = (propInfo) => propInfo.mustUseAttribute ? renderMarkupForAttribute : renderMarkupForProperty;

 /**
  * Creates markup for a property.
  *
  * @param {string} name
  * @param {*} value
  * @return {?string} Markup string, or null if the property was invalid.
  */
 export default (name, value) => getPropertySetter(DOMProperty(name))(DOMProperty(name), value);