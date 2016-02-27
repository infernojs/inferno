import { diffNodes } from './diffing';

export const recyclingEnabled = true;

export function recycle(node, lifecycle, context) {
	const key = node.key;
	const tpl = node.tpl;
	let recycledNode;

	if (tpl) {
		if (key !== null) {
			const keyPool = tpl.pools.keyed[key];
			recycledNode = keyPool && keyPool.pop();
		} else {
			const keyPool = tpl.pools.nonKeyed;
			recycledNode = keyPool && keyPool.pop();
		}
		if (recycledNode) {
			diffNodes(recycledNode, node, null, null, lifecycle, context, true);
			return node.dom;
		}
	}
}

export function pool(node) {
	const key = node.key;
	const tpl = node.tpl;

	if (tpl) {
		const pools = tpl.pools;

		if (key === null) {
			const pool = pools.nonKeyed;
			pool && pool.push(node);
		} else {
			const pool = pools.keyed;
			(pool[key] || (pool[key] = [])).push(node);
		}
	}
}