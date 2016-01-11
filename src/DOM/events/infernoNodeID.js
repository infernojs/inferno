const INFERNO_PROP = '__Inferno__id__';
let counter = 1;

export default function infernoNodeID(node, get) {
	return node[INFERNO_PROP] ||
		(get ? 0 : node[INFERNO_PROP] = counter++);
}