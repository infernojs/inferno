export default function recreateRootNode(domNode, lastItem, nextItem, node, treeLifecycle, context) {
	const lastDomNode = lastItem.rootNode;
	const lastTree = lastItem.tree.dom;

	lastTree.remove(lastItem, treeLifecycle);

	domNode = node.create(nextItem, treeLifecycle, context);
	const parentNode = lastDomNode.parentNode;

	if (parentNode) {
		parentNode.replaceChild(domNode, lastDomNode);
	}
	nextItem.rootNode = domNode;
	return domNode;
}

export function recreateRootNodeFromHydration(hydrateNode, nextItem, node, treeLifecycle, context) {
	const lastDomNode = hydrateNode;

	const domNode = node.create(nextItem, treeLifecycle, context);
	const parentNode = lastDomNode.parentNode;

	if (parentNode) {
		parentNode.replaceChild(domNode, lastDomNode);
	}
	nextItem.rootNode = domNode;
	return domNode;
}
