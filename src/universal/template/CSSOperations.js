import forIn from '../../util/forIn';
import cleanValues from './cleanValues';
import camelToKebab from './camelToKebab';

/**
 * Create HTML markup for CSS styles
 * @param {Object} styles
 * @return { string}
 */
function renderStyleToString(styles) {
	let html = '';

	forIn(styles, (styleName, styleValue) => {
		if (styleValue !== undefined) {
			html += camelToKebab(styleName) + ':' + cleanValues(styleName, styleValue) + ';';
		}
	});

	return html;
}

/**
 * Set CSS styles
 *
 * @param {Object} node
 * @param {String} propertyName
 * @param {String} value
 */
function setStyles(node, value) {
	forIn(value, (styleName, styleValue) => {
		node.style[styleName] = styleValue != null
			? cleanValues(styleName, styleValue)
			: '';
	});
}

export { renderStyleToString, setStyles };
