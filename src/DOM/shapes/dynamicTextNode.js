import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex } from '../../core/variables';

export default function createDynamicTextNode(templateNode, valueIndex) {
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create(item) {
			const domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) && isStringOrNumber( value ) ) {
				domNode.nodeValue = value;
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode = domNodeMap[lastItem.id];
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
