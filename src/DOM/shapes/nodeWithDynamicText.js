import isVoid from '../../util/isVoid';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithDynamicText( templateNode, valueIndex, dynamicAttrs ) {
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
						domNode.textContent = ' ';
						domNode.firstChild.nodeValue = '';
					} else {
						domNode.textContent = '';
					}
				} else {
					if ( typeof nextValue !== 'string' && typeof nextValue !== 'number' ) {
						throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
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
