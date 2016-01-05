const recyclingEnabled = true;

export function pool( item ) {

	const key = item.key;
	const tree = item.tree;

	if ( key === null ) {
		tree.dom.pool.push( item );
	} else {

		const keyedPool = tree.dom.keyedPool;

		( keyedPool[key] || ( keyedPool[key] = [] ) ).push( item );
	}
}

export function recycle( tree, item, treeLifecycle, context ) {

	const key = item.key;
	let recyclableItem;

	if ( tree.keyPool && ( key !== null ) ) {

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
