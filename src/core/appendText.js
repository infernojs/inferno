export default function appendText(domNode, text) {
	// validation
	if (process.env.NODE_ENV !== 'production') {
		if (text !== '' && !isStringOrNumber(text)) {
			throw Error('');
		}
	}

	const firstChild = domNode.firstChild;
	if (firstChild) {
		firstChild.nodeValue = text;
	} else {
		domNode.textContent = text;
	}
}