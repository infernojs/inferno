import { diffNodes } from './diffing';
import { isNullOrUndefined } from './../core/utils';

export const recyclingEnabled = false;

export function recycle(node, lifecycle, context, instance) {
	const tpl = node.tpl;
	if (!isNullOrUndefined(tpl)) {
		const key = node.key;
		const pool = key === null ? tpl.pools.nonKeyed : tpl.pools.keyed[key];
		if (!isNullOrUndefined(pool)) {
			const recycledNode = pool.pop();
			if (!isNullOrUndefined(recycledNode)) {
				diffNodes(recycledNode, node, null, null, lifecycle, context, instance, true);
				return node.dom;
			}
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

