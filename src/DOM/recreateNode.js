export default function recreateNode(lastDomNode, lastItem, nextItem, node, treeLifecycle, context) {
	const domNode = node.create(nextItem, treeLifecycle, context);

	lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
	// TODO recycle old node
}