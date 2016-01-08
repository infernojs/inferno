const ESCAPE_LOOKUP = {
	'&': '&amp;',
	'>': '&gt;',
	'<': '&lt;',
	'"': '&quot;',
	'`': '&#x60;',
	"'": '&#x27;'
};

const ESCAPE_REGEX = /[&><"'`]/g;
/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Attribute value to escape.
 * @return {string} An escaped string.
 */
export default (value) => '"' + ('' + value).replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]) + '"';