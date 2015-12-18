export default function recreateRootNode(lastDomNode, nextItem, node, treeLifecycle) {
	const domNode = node.create(nextItem, treeLifecycle);
	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
	// TODO recycle old node
}