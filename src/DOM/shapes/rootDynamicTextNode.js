import isVoid from '../../util/isVoid';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';
import isVoid from '../../util/isVoid';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootDynamicTextNode( templateNode, valueIndex ) {
	const node = {
		pool: [],
		keyedPool: [],
		create( item ) {
			let domNode;

			if ( recyclingEnabled ) {
				domNode = recycle( node, item );
				if ( domNode ) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				domNode.nodeValue = value;
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
			const nextValue = getValueWithIndex( nextItem, valueIndex );

			if ( nextValue !== getValueWithIndex( lastItem, valueIndex ) ) {
				domNode.nodeValue = nextValue;
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
