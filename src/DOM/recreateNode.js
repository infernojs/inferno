export default function recreateNode(lastDomNode, nextItem, node, treeLifecycle, context) {
	const domNode = node.create(nextItem, treeLifecycle, context);

	if (lastDomNode.parentNode) {
		lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
	} else {
		const newNode = lastDomNode.tree.dom.create(nextItem, treeLifecycle, context);

		// TODO! Add missing code

	}

	// TODO recycle old node
}
