import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex } from '../../core/variables';

export default function createDynamicTextNode( templateNode, valueIndex ) {
	let domNode;

	const node = {
		overrideItem: null,
		create( item ) {
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				if ( isStringOrNumber( value ) ) {
					domNode.nodeValue = value;
				}
			}
			return domNode;
		},
		update( lastItem, nextItem ) {

			const nextValue = getValueWithIndex( nextItem, valueIndex );

			if ( nextValue !== getValueWithIndex( lastItem, valueIndex ) ) {
				if ( isStringOrNumber( nextValue ) ) {
					domNode.nodeValue = nextValue;
				}

			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
