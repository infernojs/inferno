import { patch } from './patching';
import { isNullOrUndefined } from './../core/utils';

export const recyclingEnabled = true;

export function recycle(node, bp, lifecycle, context, instance) {
	if (bp !== undefined) {
		const pool = bp.pool;
		const recycledNode = pool.pop();

		if (!isNullOrUndefined(recycledNode)) {
			patch(recycledNode, node, null, lifecycle, context, instance, bp.isSVG);
			return node.dom;
		}
	}
	return null;
}

export function pool(node) {
	const bp = node.bp;

	if (!isNullOrUndefined(bp)) {
		bp.pool.push(node);
		return true;
	}
	return false;
}

