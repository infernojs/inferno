const recyclingEnabled = true;

export function pool( item ) {
	const key = item.key;
	const tree = item.domTree;

	if ( key === null ) {
		tree.pool.push( item );
	} else {
		const keyedPool = tree.keyedPool; // TODO rename

		( keyedPool[key] || ( keyedPool[key] = [] ) ).push( item );
	}
}

export function recycle( tree, item, treeLifecycle, context ) {
	// TODO use depth as key
	const key = item.key;
	let recyclableItem;

	// TODO faster to check pool size first?
	if ( key !== null ) {
		const keyPool = tree.keyedPool[key];

		recyclableItem = keyPool && keyPool.pop();
	} else {
		recyclableItem = tree.pool.pop();
	}
	if ( recyclableItem ) {
		tree.update( recyclableItem, item, treeLifecycle, context );
		return item.rootNode;
	}
}

export function isRecyclingEnabled() {
	return recyclingEnabled;
}
