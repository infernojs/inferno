import isVoid from '../util/isVoid';
import addPixelSuffixToValueIfNeeded from '../shared/addPixelSuffixToValueIfNeeded';

/**
 * Sets the value for multiple styles on a node. If a value is specified as
 * '' ( empty string ), the corresponding style property will be unset.
 *
 * @param {DOMElement} node
 * @param {object} styles
 */
export default ( vNode, domNode, styles ) => {
	for ( const styleName in styles ) {
		if ( styles.hasOwnProperty( styleName ) ) {
			const styleValue = styles[styleName];

			domNode.style[styleName] = isVoid( styleValue ) ? '' : addPixelSuffixToValueIfNeeded( styleName, styleValue );
		}
	}
};
