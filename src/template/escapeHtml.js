let ESCAPE_REGEX = /[&><]/g;

	// `'` and `'` are not escaped; they are parsed as regular characters in the
	// context of text content.

let ESCAPE_TABLE = {
	'&': '&amp;',
	'>': '&gt;',
	'<': '&lt;'
};

export default str => str.replace(ESCAPE_REGEX, match => ESCAPE_TABLE[match]);
