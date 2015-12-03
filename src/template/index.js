import HTMLProperties from './HTMLProperties';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import setSelectValueForProperty from './setSelectValueForProperty';
import setValueForStyles from './setValueForStyles';
import removeSelectValueForProperty from './removeSelectValueForProperty';
import HTMLPropertyLimitation from './HTMLPropertyLimitation';
import isFormElement from '../util/isFormElement';

/*
 * Template interface
 */

let template = {};

if (ExecutionEnvironment.canUseDOM) {

    template = {

        /**
         * Sets the value for a property on a node.
         *
         * @param {DOMElement} node
         * @param {string} name
         * @param {*} value
         */
        setProperty(node, name, value) {

            let propertyInfo = HTMLProperties[name];

            if (propertyInfo) {
                if (value == null ||
                    propertyInfo.hasBooleanValue && !value ||
                    propertyInfo.hasNumericValue && isNaN(value) || // Todo! Find alternative for 'isNaN'
                    propertyInfo.hasPositiveNumericValue && value < 1) {
                    template.removeProperty(node, name);
                } else {

                    let propName = propertyInfo.propertyName;

                    // E.g. 'form' is actually a legitimate readOnly property, that is to be
                    // mutated, but must be mutated by setAttribute...
                    if (propertyInfo.hasFormElement && (isFormElement(node.tagName.toLowerCase()))) {
                        node.setAttribute(propName, '' + value);
                    } else if (propertyInfo.mustUseProperty) {

                        if (propertyInfo.museUseObject) {
                            if (propName === 'style') {
                                setValueForStyles(node, value)
                            }
                        } else if (propName === 'value' && (node.tagName === 'SELECT')) {
                            setSelectValueForProperty(node, value);
                        } else if ('' + node[propName] !== '' + value) {
                            node[propName] = value;
                        }
                    } else {

                        const attributeName = propertyInfo.attributeName;
                        const namespace = propertyInfo.attributeNamespace;

                        if (namespace) {
                            node.setAttributeNS(namespace, attributeName, value);
                        } else {
                            node.setAttribute(attributeName, value);
                        }
                    }
                }
                // custom attributes
            } else {

                if (process.env.NODE_ENV !== 'production') {

                    // NOTE!! This 'trick' helps us avoiding touching the DOM if it's not a valid attribute
                    const limitation = HTMLPropertyLimitation[node.tagName]
                    if (limitation && limitation[name]) {
                        if (limitation[name][value]) {
                            node.setAttribute(name, value);
                        } else {
                            console.warn('Are you sure you\'re doing something right now? Head back to school');
                        }
                    } else if (name && (name.length > 1)) {
                        node.setAttribute(name, value);
                    }
                } else {
                    if (name && (name.length > 1)) {
                        node.setAttribute(name, value);
                    }
                }
            }
        },

        /**
         * Removes the value for a property on a node.
         *
         * @param {DOMElement} node
         * @param {string} name
         */
        removeProperty(node, name) {
            let propertyInfo = HTMLProperties[name];

            if (propertyInfo) {
                if (propertyInfo.mustUseProperty) {

                    let propName = propertyInfo.propertyName;

                    if (propertyInfo.hasBooleanValue) {
                        node[propName] = false;
                        // 'style' and 'dataset' property has to be removed as an attribute
                    } else if (propertyInfo.museUseObject) {
                        node.removeAttribute(propName);
                    } else if (propName === 'value' && (node.tagName === 'SELECT')) {
                        removeSelectValueForProperty(node, propName);
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