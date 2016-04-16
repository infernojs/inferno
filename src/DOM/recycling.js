import { patchNode } from './patching';
import { isNullOrUndefined } from './../core/utils';

export const recyclingEnabled = true;

export function recycle(node, bp, lifecycle, context, instance) {
	if (bp !== undefined) {
		const key = node.key;
		const pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed[key];
		if (!isNullOrUndefined(pool)) {
			const recycledNode = pool.pop();
			if (!isNullOrUndefined(recycledNode)) {
				patchNode(recycledNode, node, null, null, lifecycle, context, instance, true);
				return node.dom;
			}
		}
	}
	return null;
}

export function pool(node) {
	const bp = node.bp;

	if (!isNullOrUndefined(bp)) {
		const key = node.key;
		const pools = bp.pools;

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

