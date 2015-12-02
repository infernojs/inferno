import HTMLProperties from './HTMLProperties';
import shouldIgnoreValue from './shared/shouldIgnoreValue';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import isArray from '../util/isArray';
import addPixelSuffixToValueIfNeeded from './shared/addPixelSuffixToValueIfNeeded';
import setSelectValueForProperty from './setSelectValueForProperty';
import setValueForStyles from './setValueForStyles';
import removeSelectValueForProperty from './removeSelectValueForProperty';

/*
 * Template interface
 */

let template = {};

if (ExecutionEnvironment.canUseDOM) {

    template = {

        setProperty(node, name, value) {

            let propertyInfo = HTMLProperties[name];

            if (propertyInfo) {
                if (value == null ||
                    propertyInfo.hasBooleanValue && !value ||
                    propertyInfo.hasNumericValue && isNaN(value) ||
                    propertyInfo.hasPositiveNumericValue && value < 1) {
                    template.removeProperty(node, name);
                } else {
                    if (propertyInfo.mustUseProperty) {

                        let propName = propertyInfo.propertyName;

                        if (propertyInfo.museUseObject) {
                            if (propName === 'style') {
                                setValueForStyles(node, value)
                            }
                        } else if (propName === 'value' && (node.tagName === 'SELECT')) {
                            if (value != null) {
                                setSelectValueForProperty(node, value);
                            }
                        } else if ('' + node[propName] !== '' + value) {
                            node[propName] = value;
                        }
                    } else {
                        const attributeName = propertyInfo.attributeName;
                        const namespace = propertyInfo.attributeNamespace;

                        if (namespace) {

                            node.setAttributeNS(namespace, attributeName, '' + value);
                        } else {
                            node.setAttribute(attributeName, '' + value);
                        }
                    }
                }
                // custom attributes
                // Take any attribute (with correct syntax) as custom attribute.

            } else if (name) { // TODO! Validate
                node.setAttribute(name, value);
            }
        },

        /**
         * Deletes the value for a property on a node.
         *
         * @param {DOMElement} node
         * @param {string} name
         */
        removeProperty(node, name) {
            let propertyInfo = HTMLProperties[name];

            if (propertyInfo !== undefined) {
                if (propertyInfo.mustUseProperty) {

                    let propName = propertyInfo.propertyName;
                    // Special case: 'style' and 'dataset' property has to be removed as an attribute
                    if (propertyInfo.museUseObject) {
                        node.removeAttribute(propName);
                    } else if (propName === 'value' && (node.tagName === 'SELECT')) {
                        removeSelectValueForProperty(node, propName);
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
    }
}

export default template;