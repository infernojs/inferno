const ESCAPE_REGEX = /[&><]/g,

	// `'` and `'` are not escaped; they are parsed as regular characters in the
	// context of text content.

	ESCAPE_LOOKUP = {
		'&': '&amp;',
		'>': '&gt;',
		'<': '&lt;'
	};

export default value => ('' + value).replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match]);
