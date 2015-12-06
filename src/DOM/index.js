import HTMLProperties from './HTMLProperties';
import setSelectValueForProperty from './setSelectValueForProperty';
import setValueForStyles from './setValueForStyles';
import removeSelectValueForProperty from './removeSelectValueForProperty';

export default {
	/**
	 * Sets the value for a property on a node. If a value is specified as
	 * '' (empty string), the corresponding style property will be unset.
	 *
	 * @param {DOMElement} node
	 * @param {string} name
	 * @param {*} value
	 */
	setProperty(vNode, domNode, name, value) {
		const propertyInfo = HTMLProperties[name];

		if (propertyInfo) {
			if (value == null ||
				propertyInfo.hasBooleanValue && !value ||
				propertyInfo.hasNumericValue && isNaN(value) || // Todo! Find alternative for 'isNaN'
				propertyInfo.hasPositiveNumericValue && value < 1) {
				template.removeProperty(vNode, domNode, name);
			} else {
				const propName = propertyInfo.propertyName;

				if (propertyInfo.mustUseProperty) {
					if (propertyInfo.museUseObject) {
						if (propName === 'style') {
							setValueForStyles(vNode, domNode, value)
						}
					} else if (propName === 'value' && (domNode.tag === 'select')) {
						setSelectValueForProperty(vNode, domNode, value);
					} else if ('' + domNode[propName] !== '' + value) {
						domNode[propName] = value;
					}
				} else {

					const attributeName = propertyInfo.attributeName;
					const namespace = propertyInfo.attributeNamespace;

					if (namespace) {
						domNode.setAttributeNS(namespace, attributeName, value);
					} else {
						domNode.setAttribute(attributeName, value);
					}
				}
			}
			// custom attributes
		} else if (name && (name.length > 1)) {
			domNode.setAttribute(name, value);
		}
	},

	/**
	 * Removes the value for a property on a node.
	 *
	 * @param {DOMElement} node
	 * @param {string} name
	 */
	removeProperty(vNode, domNode, name) {
		const propertyInfo = HTMLProperties[name];

		if (propertyInfo) {
			if (propertyInfo.mustUseProperty) {
				let propName = propertyInfo.propertyName;
				if (propertyInfo.hasBooleanValue) {
					domNode[propName] = false;
					// 'style' and 'dataset' property has to be removed as an attribute
				} else if (propertyInfo.museUseObject) {
					domNode.removeAttribute(propName);
				} else if (propName === 'value' && (vNode.tag === 'select')) {
					removeSelectValueForProperty(node, domNode, propName);
				} else {
					if ('' + domNode[propName] !== '') {
						domNode[propName] = '';
					}
				}
			} else {
				domNode.removeAttribute(propertyInfo.attributeName);
			}
			// Custom attributes
		} else {
			domNode.removeAttribute(name);
		}
	}
};