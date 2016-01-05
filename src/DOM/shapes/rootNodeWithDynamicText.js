import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicText( templateNode, valueIndex, dynamicAttrs ) {
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create( item ) {
			let domNode;

			const errorMsg = 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.';

			if ( recyclingEnabled ) {
				domNode = recycle( node, item );
				if ( domNode ) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				if ( !isStringOrNumber( value ) ) {
					throw Error( errorMsg );
				}
				domNode.textContent = value;
			}
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, node );
			}
			item.rootNode = domNode;
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle ) {
			if ( node !== lastItem.tree.dom ) {
				recreateRootNode( lastItem, nextItem, node, treeLifecycle );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.id = lastItem.id;
			nextItem.rootNode = domNode;
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
