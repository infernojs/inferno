export default function recreateRootNode(lastItem, nextItem, node, treeLifecycle) {
	const lastDomNode = lastItem.rootNode;
	const lastTree = lastItem.domTree;
	lastTree.remove(lastItem);
	const domNode = node.create(nextItem, treeLifecycle);
	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
	nextItem.rootNode = domNode;
	return domNode;
}
