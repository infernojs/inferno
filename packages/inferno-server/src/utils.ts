const ecapeCharacters = {
	'"': '&quot;',
	'&': '&amp;',
	"'": '&#039;',
	'<': '&lt;',
	'>': '&gt;',
};
const escapeChar = char => ecapeCharacters[char] || char;

export function escapeText(text) {
	return String(text).replace(/[<>"'&]/g, escapeChar);
}

const uppercasePattern = /[A-Z]/g;
const msPattern = /^ms-/;

export function toHyphenCase(str) {
	return str.replace(uppercasePattern, '-$&').toLowerCase().replace(msPattern, '-ms-');
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
	wbr: true,
};

export function isVoidElement(str) {
	return !!voidElements[str];
}
