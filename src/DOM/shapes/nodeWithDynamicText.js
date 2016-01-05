import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithDynamicText( templateNode, valueIndex, dynamicAttrs ) {

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
				domNode.textContent = value;
			}
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, null );
			}
			return domNode;
		},
		update( lastItem, nextItem ) {
			const nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue !== lastValue ) {
				if ( isVoid( nextValue ) ) {
					if ( isVoid( lastValue ) ) {
						domNode.firstChild.nodeValue = '';
					} else {
						domNode.textContent = '';
					}
				} else {
					if ( !isStringOrNumber( nextValue ) ) {
						throw Error( errorMsg );
					}
					if ( isVoid( lastValue ) ) {
						domNode.textContent = nextValue;
					} else {
						domNode.firstChild.nodeValue = nextValue;
					}
				}
			}
			if ( dynamicAttrs ) {
				updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs );
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
