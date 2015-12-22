import isVoid from '../../util/isVoid';
import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';

export default function createDynamicNode( valueIndex ) {
	let domNode;

	const node = {
		create( item, treeLifecycle ) {
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
					domNode = value.create( item, treeLifecycle );
					break;
				case ValueTypes.EMPTY_OBJECT:
					throw Error( 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.' );
				default: break;
			}

			return domNode;
		},
		update( lastItem, nextItem ) {
			let nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue !== lastValue ) {
				const nextType = getTypeFromValue( nextValue );
				const lastType = getTypeFromValue( lastValue );

				if ( lastType !== nextType ) {
					// TODO replace node and rebuild
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
