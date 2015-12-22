export default function recreateRootNode( lastItem, nextItem, node, treeLifecycle ) {
	const lastDomNode = lastItem.rootNode;
	const lastTree = lastItem.domTree;
	const domNode = node.create( nextItem, treeLifecycle );

	lastTree.remove( lastItem );
	lastDomNode.parentNode.replaceChild( domNode, lastDomNode );
	// TODO recycle old node
}
