export default function removeChild( domNode ) {
	const firstChild = domNode.firstChild;
	if ( firstChild ) {
		domNode.removeChild( firstChild );
	}
}