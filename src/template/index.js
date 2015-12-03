import HTMLProperties from './HTMLProperties';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import setSelectValueForProperty from './setSelectValueForProperty';
import setValueForStyles from './setValueForStyles';
import removeSelectValueForProperty from './removeSelectValueForProperty';
import isFormElement from '../util/isFormElement';

const nodeAttributes = {

// TODO!! Limit this even more, so A element, with target attr, only touch DOM if
// either of this values matches.
/*    A: {
        target: {
            blank: true,
            parent: true,
            top: true,
            self: true
        }
    },*/
    BUTTON: {
        disabled: true
    }
};

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
            } else if (name && (name.length > 1)) {
                // NOTE!! This 'trick' helps us avoiding touching the DOM if it's not a valid attribute
                if (nodeAttributes[node.tagName]) {
                    if (nodeAttributes[node.tagName][name]) {
                        node.setAttribute(name, value);
                    }
                } else {
                    node.setAttribute(name, value);
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