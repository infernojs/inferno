function appendText( domNode, value ) {
	const firstChild = domNode.firstChild;
	if ( firstChild ) {
		firstChild.nodeValue = value;
	} else {
		domNode.textContent = value;
	}
}
export default appendText;