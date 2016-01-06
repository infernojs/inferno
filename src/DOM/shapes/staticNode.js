
export default function createStaticNode( templateNode ) {
	let domNode;
	const node = {
		overrideItem: null,
		create() {
			domNode = templateNode.cloneNode( true );
			return domNode;
		},
		update() {},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
