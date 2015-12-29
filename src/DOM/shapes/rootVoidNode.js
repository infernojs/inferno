import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootVoidNode( templateNode, dynamicAttrs ) {
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
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, node );
			}
			return domNode;
		},
		update( lastItem, nextItem ) {
			if ( node !== lastItem.domTree ) {
				recreateRootNode( lastItem, nextItem, node );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			nextItem.rootNode = lastItem.rootNode;
			if ( dynamicAttrs ) {
				updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs );
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
