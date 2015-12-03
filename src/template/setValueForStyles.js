import addPixelSuffixToValueIfNeeded from './shared/addPixelSuffixToValueIfNeeded';

/**
 * Sets the value for multiple styles on a node. If a value is specified as
 * '' (empty string), the corresponding style property will be unset.
 *
 * @param {DOMElement} node
 * @param {object} styles
 */
 
export default (node, styles) => {
	
	const style = node.style;

    for (let styleName in styles) {

     let styleValue = addPixelSuffixToValueIfNeeded(styleName, styles[styleName]);

      if (styleValue) {
        style[styleName] = styleValue;
      } else {
          style[styleName] = '';
      }
    }
};