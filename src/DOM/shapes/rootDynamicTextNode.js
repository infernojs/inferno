import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

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

			if ( value != null ) {
				if ( typeof value !== 'string' && typeof value !== 'number' ) {
					throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
				}
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
				if ( typeof nextValue !== 'string' && typeof nextValue !== 'number' ) {
					throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
				}
				domNode.nodeValue = nextValue;
			}
		},
		remove( lastItem ) {

		}
	};
	return node;
}
