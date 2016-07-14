import { patch } from './patching';
import { isNullOrUndef } from './../core/utils';

export const recyclingEnabled = true;

export function recycle(node, bp, lifecycle, context, instance) {
	// if (bp !== undefined) {
	// 	const key = node._key;
	// 	const pool = key === null ? bp.pools.nonKeyed : bp.pools._keyed[key];
	// 	if (!isNullOrUndef(pool)) {
	// 		const recycledNode = pool.pop();
	// 		if (!isNullOrUndef(recycledNode)) {
	// 			patch(recycledNode, node, null, lifecycle, context, instance, true, bp.isSVG);
	// 			return node._dom;
	// 		}
	// 	}
	// }
	return null;
}

export function pool(node) {
	// const bp = node.bp;

	// if (!isNullOrUndef(bp)) {
	// 	const key = node._key;
	// 	const pools = bp.pools;

	// 	if (key === null) {
	// 		const pool = pools.nonKeyed;
	// 		pool && pool.push(node);
	// 	} else {
	// 		const pool = pools._keyed;
	// 		(pool[key] || (pool[key] = [])).push(node);
	// 	}
	// 	return true;
	// }
	return false;
}

