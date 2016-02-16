import { diffNodes } from './diffing';

export const recyclingEnabled = true;

export function recycle(node, lifecycle, context) {
	const key = node.key;
	const staticNode = node.static;
	let recycledNode;

	if (staticNode) {
		if (key !== null) {
			const keyPool = staticNode.static.keyed[key];
			recycledNode = keyPool && keyPool.pop();
		} else {
			const keyPool = staticNode.static.nonKeyed;
			recycledNode = keyPool && keyPool.pop();
		}
		if (recycledNode) {
			diffNodes(recycledNode, node, null, lifecycle, context, null, true);
			return node.dom;
		}
	}
}

export function pool(node) {
	const key = node.key;
	const staticNode = node.static;

	if (staticNode) {
		const pools = staticNode.static;

		if (key === null) {
			const pool = pools.nonKeyed;
			pool && pool.push(item);
		} else {
			const pool = pools.keyed;
			(pool[key] || (pool[key] = [])).push(node);
		}
	}
}