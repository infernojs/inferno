import forIn from '../../util/forIn';
import cleanValues from './cleanValues';
import camelToKebab from './camelToKebab';

/**
* Create SSR HTML markup for CSS styles
* @param {Object} styles
* @return { string}
*/
let renderStyleToString = function(styles) {
		let html = '';

		forIn(styles, (styleName, styleValue) => {
			if (styleValue !== undefined) {
				html += camelToKebab(styleName) + ':' + cleanValues(styleName, styleValue) + ';';
			}
		});

		return html;
	},

	/**
	* Set CSS styles
	*
	* @param {Object} node
	* @param {String} propertyName
	* @param {String} value
	*/

	setStyles = function(node, propertyName, value) {
		let style = node[propertyName];

		forIn(value, (styleName, styleValue) => {
			if (styleValue !== undefined) {
				style[styleName] = cleanValues(styleName, styleValue);
			} else {
				style[styleName] = '';
			}
		});
	};


export { renderStyleToString, setStyles };
