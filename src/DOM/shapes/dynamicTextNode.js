import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex } from '../../core/variables';

export default function createDynamicTextNode( templateNode, valueIndex ) {
	let domNode;

	const errorMsg = 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.';

	const node = {
		overrideItem: null,
		create( item ) {
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				if ( !isStringOrNumber( value ) ) {
					throw Error( errorMsg );
				}
				domNode.nodeValue = value;
			}
			return domNode;
		},
		update( lastItem, nextItem ) {

			const nextValue = getValueWithIndex( nextItem, valueIndex );

			if ( nextValue !== getValueWithIndex( lastItem, valueIndex ) ) {
				if ( !isStringOrNumber( value ) ) {
					throw Error( errorMsg );
				}
				domNode.nodeValue = nextValue;
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
