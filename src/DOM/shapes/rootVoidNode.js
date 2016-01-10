import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

export default function createRootVoidNode( templateNode, dynamicAttrs, recyclingEnabled ) {
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
			if ( node !== lastItem.tree.dom ) {
				recreateRootNode( lastItem, nextItem, node );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.rootNode = lastItem.rootNode;
			if ( dynamicAttrs ) {
				updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs );
			}
		},
		remove(item) {
			if (dynamicAttrs) {
				clearListeners(item, item.rootNode, dynamicAttrs);
			}
		}
	};

	return node;
}
