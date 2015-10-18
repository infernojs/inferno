import DOMProperty                    from '../template/DOMProperty';
import getPropertyValue               from '../template/getPropertyValue';
import getAttributeValue              from '../template/getAttributeValue';
import quoteAttributeValueForBrowser  from './quoteAttributeValueForBrowser';

// Render markup for HTML properties
let renderMarkupForProperty = (propInfo, value) => `${propInfo.propertyName}=${quoteAttributeValueForBrowser(getPropertyValue(propInfo, value))}`;

// Render markup for HTML attributes
let renderMarkupForAttribute = (propInfo, value) => `${propInfo.attributeName}=${quoteAttributeValueForBrowser(getAttributeValue(propInfo, value))}`;

// Anything we don't set as an attribute is treated as a property
let getPropertySetter = (propInfo) => propInfo.mustUseAttribute ? renderMarkupForAttribute : renderMarkupForProperty;

export default (name, value) => getPropertySetter(DOMProperty(name))(DOMProperty(name), value);