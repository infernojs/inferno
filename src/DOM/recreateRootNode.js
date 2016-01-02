export default function recreateRootNode( lastItem, nextItem, node, treeLifecycle, context ) {
	const lastDomNode = lastItem.rootNode;
	const lastTree = lastItem.tree;

	lastTree.dom.remove( lastItem );
	const domNode = node.create( nextItem, treeLifecycle, context );
	const parentNode = lastDomNode.parentNode;

	if ( parentNode ) {
		parentNode.replaceChild( domNode, lastDomNode );
	}
	nextItem.rootNode = domNode;
	return domNode;
}
