import DOMProperty from './DOMProperty';
import parseValues from './parseValues';
import getPropertyValue from './getPropertyValue';
import CSSPropertyOperations from './CSSPropertyOperations';
import propertyValueConversions from './vars/propertyValueConversions';

export default (node, name, value) => {

	let propInfo = DOMProperty(name);
	
    let propName = propInfo.propertyName;
    let valueConverter;

    if (propName === 'value' && node.tagName === 'SELECT') {
        parseValues(node, value);
    } else if (propName === 'style') {
        CSSPropertyOperations(node, value);
    } else {
        if (propName && propertyValueConversions[propName]) {
            valueConverter = propertyValueConversions[propInfo.propertyName];
            value = valueConverter(node, value);
        }

        node[propInfo.propertyName] = getPropertyValue(propInfo, value);
    }
};
