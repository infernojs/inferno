import DOMProperty from './DOMProperty';
import getAttributeValue from './getAttributeValue';

export default (node, name, value) => {

	let propInfo = DOMProperty(name);
	
    value = getAttributeValue(propInfo, value);
	
    if (propInfo.namespace) {
        node.setAttributeNS(propInfo.namespace, propInfo.attributeName, '' + value);
    } else if (propInfo.attributeName === 'type' && node.tagName.toLowerCase() === 'input') {
        const val = node.value; // value will be lost in IE if type is changed
        node.setAttribute(propInfo.attributeName, '' + value);
        node.value = val;
    } else {
        node.setAttribute(propInfo.attributeName, getAttributeValue(propInfo, value));
    }
};