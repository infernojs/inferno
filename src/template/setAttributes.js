import DOMProperties              from './DOMProperties';
import getAttributeValue          from './getAttributeValue';
import propertyToAttributeMapping from './PropertyToAttributeMapping';

/**
 * Set HTML properties on a node
 *
 * @param {!Element} node
 * @param {String} name
 * @param {*} value
 */
export default (node, name, value) => {

    let propInfo = DOMProperties(name);

    value = getAttributeValue(propInfo, value);
    name = propInfo.attributeName;
	
    // namespace attributes
    if (propInfo.namespace) {
        node.setAttributeNS(propInfo.namespace, propInfo.attributeName, '' + value);
    } else {

        switch (propInfo.attributeName) {
            case 'type':
                if (node.tagName.toLowerCase() === 'input') {
                    const val = node.value; // value will be lost in IE if type is changed
                    node.setAttribute(propInfo.attributeName, '' + value);
                    node.value = val;
                    return;
                }
            default:
                node.setAttribute((propertyToAttributeMapping[propInfo.attributeName] || name), getAttributeValue(propInfo, value));
        }
    }
};