export default function replaceChild(domNode, childNode) {
	const replaceNode = domNode.firstChild;

	if (replaceNode) {
		domNode.replaceChild(childNode, replaceNode);
	} else {
		domNode.appendChild(childNode);
	}
}