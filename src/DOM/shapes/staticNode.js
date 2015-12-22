export default function createStaticNode( templateNode ) {
	let domNode;

	const node = {
		create() {
			domNode = templateNode.cloneNode( true );
			return domNode;
		},
		update() {},
		remove( /* lastItem */ ) {
			// todo
		}
	};

	return node;
}
