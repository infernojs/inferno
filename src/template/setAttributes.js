import DOMProperties              from './DOMProperties';
import propertyToAttributeMapping from './propertyToAttributeMapping';

/**
 * Apply a HTML attribute on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name The attribute / property name
 * @param {String} value The attribute / property value
 */
export default (node, name, value) => {

    let propInfo = DOMProperties(name);

    name = propInfo.attributeName;
	
    // namespace attributes
    if (propInfo.attributeNamespace) {
        node.setAttributeNS(propInfo.attributeNamespace, name, '' + value);
	} else if (propInfo.mutationMethod) {
        propInfo.mutationMethod(node, name, value);
    } else {

        switch (name) {
            case 'type':
                if (node.tagName.toLowerCase() === 'input') {
                    const val = node.value; // value will be lost in IE if type is changed
                    node.setAttribute(name, '' + value);
                    node.value = val;
                    return;
                }
            default:
                node.setAttribute(name, propInfo.hasBooleanValue ? value : value);
        }
    }
};