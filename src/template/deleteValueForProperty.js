import DOMProperties from './DOMProperties';

/**
 * Deletes the value for a property on a node.
 *
 * @param {DOMElement} node
 * @param {string} name
 */
function deleteValueForProperty(node, name) {

    let propertyInfo = DOMProperties[name];

    if (propertyInfo !== undefined) {

        if (propertyInfo.mustUseProperty) {

            let propName = propertyInfo.propertyName;

            if (propName === 'value' && (node.tagName.toLowerCase() === 'select')) {

                const options = node.options;
                const len = options.length;

                let i = 0;

                while (i < len) {
                    options[i++].selected = false;
                }
            } else if (propertyInfo.hasBooleanValue) {
                node[propName] = false;
            } else {

                if ('' + node[propName] !== '') {
                    node[propName] = '';
                }
            }
        } else {
            node.removeAttribute(propertyInfo.attributeName);
        }
        // Custom attributes
       } else {
        node.removeAttribute(name);
    }
}

export default deleteValueForProperty;