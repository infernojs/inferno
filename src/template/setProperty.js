import DOMProperties              from './DOMProperties';
import parseValues                from './parseValues';
import getPropertyValue           from './getPropertyValue';
import CSSPropertyOperations      from './CSSPropertyOperations';
import attributeToPropertyMapping from './attributeToPropertyMapping';

/**
 * Set HTML properties on a node
 *
 * @param {!Element} node
 * @param {String} name
 * @param {*} value
 */
export default (node, name, value) => {

    let propInfo = DOMProperties(name),
        propName = propInfo.propertyName;

    switch (name) {

        case 'style':
            CSSPropertyOperations(node, value);
            return;
        case 'value':
            if (node.tagName.toLowerCase() === 'select') {
                parseValues(node, value);
                return;
            };
        default:
            node[(attributeToPropertyMapping[propName] || propName)] = getPropertyValue(propInfo, value);
    }
};