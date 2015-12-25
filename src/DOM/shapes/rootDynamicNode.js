import isVoid from '../../util/isVoid';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootDynamicNode( valueIndex ) {
	const node = {
		pool: [],
		keyedPool: [],
		create( item, treeLifecycle, context ) {
			let domNode;

			if ( recyclingEnabled ) {
				domNode = recycle( node, item );
				if ( domNode ) {
					return domNode;
				}
			}
			let value = getValueWithIndex( item, valueIndex );
			const type = getTypeFromValue( value );

			switch ( type ) {
				case ValueTypes.TEXT:
					// TODO check if string is empty?
					if ( isVoid( value ) ) {
						value = '';
					}
					domNode = document.createTextNode( value );
					break;
				case ValueTypes.ARRAY:
					throw Error( 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.' );
				case ValueTypes.TREE:
					domNode = value.create( item, treeLifecycle, context );
					break;
				case ValueTypes.EMPTY_OBJECT:
					throw Error( 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.' );
				case ValueTypes.FUNCTION:
					throw Error( 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.' );
				default: break;
			}

			item.rootNode = domNode;
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			if ( node !== lastItem.domTree ) {
				recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;

			const nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue !== lastValue ) {
				const nextType = getTypeFromValue( nextValue );
				const lastType = getTypeFromValue( lastValue );

				if ( lastType !== nextType ) {
					recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
					return;
				}

				switch ( nextType ) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						domNode.nodeValue = nextValue;
						break;
					default: break;
				}
			}
		},
		remove( item, treeLifecycle ) {
			const value = getValueWithIndex( item, valueIndex );

			if ( getTypeFromValue( value ) === ValueTypes.TREE ) {
				value.remove( item, treeLifecycle );
			}
		}
	};

	return node;
}
