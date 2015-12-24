import isVoid from '../../util/isVoid';
import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';
import recreateNode from '../recreateNode';
import isVoid from '../../util/isVoid';

export default function createDynamicNode( valueIndex ) {
	let domNode;

	const node = {
		create( item, treeLifecycle, context ) {
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

			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			let nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue !== lastValue ) {
				const nextType = getTypeFromValue( nextValue );
				const lastType = getTypeFromValue( lastValue );

				if ( lastType !== nextType ) {
					recreateNode( domNode, nextItem, node, treeLifecycle, context );
					return;
				}

				switch ( nextType ) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						if ( isVoid( nextValue ) ) {
							nextValue = '';
						}
						domNode.nodeValue = nextValue;
						break;
					case ValueTypes.ARRAY:
						throw Error( 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.' );
					case ValueTypes.TREE:
						// debugger;
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
