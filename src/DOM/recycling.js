import { diffNodes } from './diffing';

export const recyclingEnabled = true;

export function recycle(node, lifecycle, context) {
	const key = node.key;
	const staticNode = node.tpl;
	let recycledNode;

	if (staticNode) {
		if (key !== null) {
			const keyPool = staticNode.pools.keyed[key];
			recycledNode = keyPool && keyPool.pop();
		} else {
			const keyPool = staticNode.pools.nonKeyed;
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
	const staticNode = node.tpl;

	if (staticNode) {
		const pools = staticNode.pools;

		if (key === null) {
			const pool = pools.nonKeyed;
			pool && pool.push(item);
		} else {
			const pool = pools.keyed;
			(pool[key] || (pool[key] = [])).push(node);
		}
	}
}