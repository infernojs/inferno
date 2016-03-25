import { diffNodes } from './diffing';
import { isNullOrUndefined } from './../core/utils';

export const recyclingEnabled = true;

export function recycle(node, lifecycle, context, instance) {
	const tpl = node.tpl;

	if (!isNullOrUndefined(tpl)) {
		const key = node.key;
		let recycledNode;

		if (key !== null) {
			const keyPool = tpl.pools.keyed[key];
			recycledNode = keyPool && keyPool.pop();
		} else {
			const keyPool = tpl.pools.nonKeyed;
			recycledNode = keyPool && keyPool.pop();
		}
		if (!isNullOrUndefined(recycledNode)) {
			diffNodes(recycledNode, node, null, null, lifecycle, context, instance, true);
			return node.dom;
		}
	}
}

export function pool(node) {
	const tpl = node.tpl;

	if (!isNullOrUndefined(tpl)) {
		const key = node.key;
		const pools = tpl.pools;

		if (key === null) {
			const pool = pools.nonKeyed;
			pool && pool.push(node);
		} else {
			const pool = pools.keyed;
			(pool[key] || (pool[key] = [])).push(node);
		}
		return true;
	}
	return false;
}
