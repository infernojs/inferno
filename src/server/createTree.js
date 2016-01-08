import createStaticNode from './shapes/staticNode';

export default function createHTMLTree(schema, isRoot, dynamicNodeMap) {
	const dynamicFlags = dynamicNodeMap.get(schema);
	let node;

	// static html
	if (!dynamicFlags) {
		return createStaticNode(schema);
	}

	return node;
}