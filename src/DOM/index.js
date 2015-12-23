import DOMRegistry from './DOMRegistry';
import setSelectValueForProperty from './setSelectValueForProperty';

const template = {
    /**
     * Sets the value for a property on a node. If a value is specified as
     * '' (empty string), the corresponding style property will be unset.
     *
     * @param {DOMElement} node
     * @param {string} name
     * @param {*} value
     */
    setProperty(vNode, domNode, name, value, useProperties) {

        const propertyInfo = DOMRegistry[name] || null;

        if (propertyInfo) {
            if (value == null ||
                propertyInfo.hasBooleanValue && !value ||
                propertyInfo.hasNumericValue && (value !== value) ||
                propertyInfo.hasPositiveNumericValue && value < 1 ||
                value.length === 0) {
                template.removeProperty(vNode, domNode, name, useProperties);
            } else {
                const propName = propertyInfo.propertyName;

                if (propertyInfo.mustUseProperty) {
					
                    if (propName === 'value' && ((vNode !== null && vNode.tag === 'select') || (domNode.tagName === 'SELECT'))) {
                        setSelectValueForProperty(vNode, domNode, value, useProperties);
                    } else if ('' + domNode[propName] !== '' + value) {
                        if (useProperties) {
							
							if (propertyInfo.hasBooleanValue) {

    							if (name === value || !!value) {
						        	domNode[propName] = true;
							    } else {
						        	domNode[propName] = false;
    							}
							} else {
    						
							domNode[propName] = value;
							
							}
                            
                        } else {
                            if (propertyInfo.hasBooleanValue && value === true) {
                                value = propName;
                            }
                            domNode.setAttribute(propName, value);
                        }
                    }
                } else {

                    const attributeName = propertyInfo.attributeName;
                    const namespace = propertyInfo.attributeNamespace;

                    // if 'truthy' value, and boolean, it will be 'propName=propName'
                    if (propertyInfo.hasBooleanValue && value === true) {
                        value = attributeName;
                    }

                    if (namespace) {
                        domNode.setAttributeNS(namespace, attributeName, value);
                    } else {
                        domNode.setAttribute(attributeName, value);
                    }
                }
            }
        } else if (value == null) {
            domNode.removeAttribute(name);
        } else if (name) {
            domNode.setAttribute(name, value);
        }
    },

    /**
     * Removes the value for a property on a node.
     *
     * @param {DOMElement} node
     * @param {string} name
     */
    removeProperty(vNode, domNode, name, useProperties) {
        const propertyInfo = DOMRegistry[name];

        if (propertyInfo) {
            if (propertyInfo.mustUseProperty) {
                let propName = propertyInfo.propertyName;
                if (propertyInfo.hasBooleanValue) {
                    if (useProperties) {
                        domNode[propName] = false;
                    } else {
                        domNode.removeAttribute(propName);
                    }
                } else {
                    if (useProperties) {
                        if ('' + domNode[propName] !== '') {
                            domNode[propName] = '';
                        }
                    } else {
                        domNode.removeAttribute(propName);
                    }
                }
            } else {
                domNode.removeAttribute(propertyInfo.attributeName);
            }
            // HTML attributes and custom attributes
        } else {
            domNode.removeAttribute(name);
        }
    }
};

export default template;