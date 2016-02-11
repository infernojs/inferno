import { diffNodes } from './diffing';

export const recyclingEnabled = true;

export function recycle(node, lifecycle, context) {
	const key = node.key;
	let recycledNode;

	if (key !== null) {
		const keyPool = node.static.static.keyed[key];
		recycledNode = keyPool && keyPool.pop();
	} else {
		const keyPool = node.static.static.nonKeyed;
		recycledNode = keyPool && keyPool.pop();
	}
	if (recycledNode) {
		diffNodes(recycledNode, node, null, lifecycle, context, null, true);
		return node.dom;
	}
}

export function pool(item) {
	const key = item.key;
	const staticNode = item.static.static;

	if (key === null) {
		const pool = staticNode.nonKeyed;
		pool && pool.push(item);
	} else {
		const pool = staticNode.keyed;
		(pool[key] || (pool[key] = [])).push(item);
	}
}