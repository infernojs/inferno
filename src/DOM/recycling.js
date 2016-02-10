export const recyclingEnabled = false;

export function recycle(node, lifecycle, context) {
	var key = node.key;
	var recycledNode;

	if (key !== null) {
		var keyPool = node.static.static.keyed[key];
		recycledNode = keyPool && keyPool.pop();
	} else {
		var keyPool = node.static.static.nonKeyed;
		recycledNode = keyPool && keyPool.pop();
	}
	if (recycledNode) {
		diffNodes(recycledNode, node, null, lifecycle, context, null, true);
		return node.dom;
	}
}

export function pool(item) {
	var key = item.key;
	var pool = item.static.static;
	if (key === null) {
		var pool = pool.nonKeyed;
		pool && pool.push(item);
	} else {
		var pool = pool.keyed;
		(pool[key] || (pool[key] = [])).push(item);
	}
}