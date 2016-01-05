function appendText( domNode, value ) {
	const firstChild = domNode.firstChild;
	if ( firstChild ) {
		domNode.firstChild.nodeValue = value;
	} else {
		domNode.textContent = value;
	}
}
export default appendText;