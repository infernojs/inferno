import isVoid from '../../util/isVoid';
import { getValueWithIndex } from '../../core/variables';

export default function createDynamicTextNode( templateNode, valueIndex ) {
	let domNode;

	const node = {
		create( item ) {
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				domNode.nodeValue = value;
			}
			return domNode;
		},
		update( lastItem, nextItem ) {
			const nextValue = getValueWithIndex( nextItem, valueIndex );

			if ( nextValue !== getValueWithIndex( lastItem, valueIndex ) ) {
				domNode.nodeValue = nextValue;
			}
		},
		remove( /* lastItem */ ) {
			// todo
		}
	};

	return node;
}
