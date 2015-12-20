import addPixelSuffixToValueIfNeeded from '../shared/addPixelSuffixToValueIfNeeded';

/**
 * Sets the value for multiple styles on a node. If a value is specified as
 * '' (empty string), the corresponding style property will be unset.
 *
 * @param {DOMElement} node
 * @param {object} styles
 */
export default (vNode, domNode, styles) => {
	for (let styleName in styles) {
		let styleValue = styles[styleName];

		domNode.style[styleName] = styleValue == null ? '' : addPixelSuffixToValueIfNeeded(styleName, styleValue);
	}
};