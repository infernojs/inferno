const unsafeCharsPattern = /[<>"'&]/g;
const htmlChars = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;'
};

export function escapeText(_string) {
	const string = _string + '';
	return string.replace(unsafeCharsPattern, char => htmlChars[char]);
}

export function toHyphenCase(str) {
	return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

const voidElements = {
	area: true,
	base: true,
	br: true,
	col: true,
	command: true,
	embed: true,
	hr: true,
	img: true,
	input: true,
	keygen: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true
};

export function isVoidElement(str) {
	return !!voidElements[str];
}
