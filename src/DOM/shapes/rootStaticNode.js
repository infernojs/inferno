import { isRecyclingEnabled, recycle } from '../recycling';
import recreateRootNode from '../recreateRootNode';

export default function createRootStaticNode( templateNode, recyclingEnabled ) {
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create( item ) {
			let domNode;

			if ( recyclingEnabled ) {
				domNode = recycle( node, item );
				if ( domNode ) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode( true );
			item.rootNode = domNode;
			return domNode;
		},
		update( lastItem, nextItem ) {
			// wrong tree and it toggle
			if ( node !== lastItem.domTree ) {
				recreateRootNode( lastItem, nextItem, node );
				return;
			}
			nextItem.rootNode = lastItem.rootNode;
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
