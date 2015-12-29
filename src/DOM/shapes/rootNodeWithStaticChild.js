import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithStaticChild( templateNode, dynamicAttrs ) {
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
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, node );
			}
			item.rootNode = domNode;
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle ) {
			if ( node !== lastItem.domTree ) {
				recreateRootNode( lastItem, nextItem, node, treeLifecycle );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			if ( dynamicAttrs ) {
				updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs );
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
