import DOMProperties              from './DOMProperties';
import parseValues                from './parseValues';
import setStyles      from './setStyles';
import attributeToPropertyMapping from './attributeToPropertyMapping';

/**
 * Apply a HTML property on a given Element
 *
 * @param {!Element} node  A DOM element.
 * @param {string} name The attribute / property name
 * @param {String|Object} value The attribute / property value
 */
 export default (node, name, value) => {

    let propInfo = DOMProperties(name),
        propName = propInfo.propertyName;

	if (propInfo.hasBooleanValue) {
        node[(attributeToPropertyMapping[propName] || propName)] = (value === '' || name.toLowerCase() === propInfo.attributeName) ? true : false;
	} else if (propInfo.mutationMethod) {
        propInfo.mutationMethod(node, name, value);
    } else {

        switch (name) {

            case 'style':
                setStyles(node, value);
                return;
            case 'value':
                if (node.tagName.toLowerCase() === 'select') {
                    parseValues(node, value);
                    return;
                }
            default:
                node[(attributeToPropertyMapping[propName] || propName)] = value;
        }
    }
};