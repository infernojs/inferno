export default function getFormElementType(node) {
	const name = node.nodeName.toLowerCase();

	if (name !== 'input') {
		if (name === 'select' && node.multiple) {
			return 'select-multiple';
		}
		return name;
	}

	const type = node.getAttribute('type');

	if (!type) {
		return 'text';
	}

	return type.toLowerCase();
}
