import isVoid from '../../util/isVoid';
import { getValueWithIndex } from '../../core/variables';

export default function createDynamicTextNode( templateNode, valueIndex ) {
	let domNode;

	const node = {
		overrideItem: null,
		create( item ) {
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				if ( typeof value !== 'string' && typeof value !== 'number' ) {
					throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
				}
				domNode.nodeValue = value;
			}
			return domNode;
		},
		update( lastItem, nextItem ) {
			const nextValue = getValueWithIndex( nextItem, valueIndex );

			if ( nextValue !== getValueWithIndex( lastItem, valueIndex ) ) {
				if ( typeof nextValue !== 'string' && typeof nextValue !== 'number' ) {
					throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
				}
				domNode.nodeValue = nextValue;
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
