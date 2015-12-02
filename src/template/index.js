import HTMLProperties from './HTMLProperties';
import shouldIgnoreValue from './shared/shouldIgnoreValue';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import isArray from '../util/isArray';
import addPixelSuffixToValueIfNeeded from './shared/addPixelSuffixToValueIfNeeded';

export default shouldIgnoreValue;
/*
 * Template interface
 */

let template = {};

if (ExecutionEnvironment.canUseDOM) {

    template = {

        setProperty(node, name, value) {

            let propertyInfo = HTMLProperties(name);

            if (propertyInfo !== undefined) {
                if (shouldIgnoreValue(propertyInfo, value)) {
                    template.removeProperty(node, name);
                    return;
                }
                if (propertyInfo.mustUseProperty) {

                    let propName = propertyInfo.propertyName;

                    if (propertyInfo.setAsObject) {

                        if (propName === 'style') {
                            for (let styleName in value) {
                                let styleValue = value[styleName];

                                node.style[styleName] = styleValue == null ? '' : addPixelSuffixToValueIfNeeded(styleName, styleValue);
                            }
                        }
                        // TODO! Clean up this mess
                    } else if (propName === 'value' && (node.tagName.toLowerCase() === 'select')) {
                        const multiple = isArray(value);
                        const options = node.options;

                        let selectedValue;
                        let idx;
                        let l;

                        if (multiple) {
                            selectedValue = {};
                            for (idx = 0, l = value.length; idx < l; ++idx) {
                                selectedValue['' + value[idx]] = true;
                            }
                            for (idx = 0, l = options.length; idx < l; idx++) {
                                let selected = selectedValue[options[idx].value];

                                if (options[idx].selected !== selected) {
                                    options[idx].selected = selected;
                                }
                            }
                        } else {
                            // Do not set `select.value` as exact behavior isn't consistent across all
                            // browsers for all cases.
                            selectedValue = '' + value;
                            for (idx = 0, l = options.length; idx < l; idx++) {

                                if (options[idx].value === selectedValue) {
                                    options[idx].selected = true;
                                }
                            }
                        }
                    } else if ('' + node[propName] !== '' + value) {
                        node[propName] = value;
                    }
                    return;
                }
                let attributeName = propertyInfo.attributeName;
                let namespace = propertyInfo.attributeNamespace;

                if (namespace) {
                    node.setAttributeNS(namespace, attributeName, '' + value);
                } else {
                    node.setAttribute(attributeName, '' + value);
                }

            } else { // custom attributes
                // Take any attribute (with correct syntax) as custom attribute.
                if (name) {
                    node.setAttribute(name, value);
                }
            }
        },

        /**
         * Deletes the value for a property on a node.
         *
         * @param {DOMElement} node
         * @param {string} name
         */
        removeProperty(node, name) {
            let propertyInfo = HTMLProperties(name);

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
    }
}

export default template;