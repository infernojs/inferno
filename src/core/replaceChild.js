export default function replaceChild( domNode, childNode ) {

	const replaceNode = domNode.firstChild;

	if ( replaceNode ) {
		domNode.replaceChild( childNode, domNode.firstChild );
	} else {
		domNode.appendChild( childNode );
	}
}