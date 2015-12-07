export default function addListener(vNode, domNode, type, listener) {
	// TODO re-implement new-branch code
	domNode.addEventListener(type, listener);
}
