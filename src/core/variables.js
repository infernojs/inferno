import isArray from '../util/isArray';

export const ObjectTypes = {
	VARIABLE: 1
};

export const ValueTypes = {
	TEXT: 0,
	ARRAY: 1,
	TREE: 2,
	EMPTY_OBJECT: 3,
	FUNCTION: 4
};

export function createVariable( index ) {
	return {
		index,
		type: ObjectTypes.VARIABLE
	};
}

export function getValueWithIndex( item, index ) {
	return ( index < 2 ) ? ( ( index === 0 ) ? item.v0 : item.v1 ) : item.values[index - 2];
}

export function getCorrectItemForValues( node, item ) {
	if ( node && node !== item.domTree && item.parent ) {
		return getCorrectItemForValues( node, item.parent );
	}
	return item;
}

export function getTypeFromValue( value ) {
	if ( typeof value === 'string' || typeof value === 'number' || value == null ) {
		return ValueTypes.TEXT;
	} else if ( isArray( value ) ) {
		return ValueTypes.ARRAY;
	} else if ( typeof value === 'object' &&  value.create ) {
		return ValueTypes.TREE;
	} else if ( typeof value === 'object' && Object.keys( value ).length === 0 ) {
		return ValueTypes.EMPTY_OBJECT;
	} else if ( typeof value === 'function' ) {
		return ValueTypes.FUNCTION;
	}
}

export function getValueForProps( props, item ) {
	const newProps = {};

	if ( props.index ) {
		return getValueWithIndex( item, props.index );
	}
	for ( let name in props ) {
		const val = props[name];

		if ( val && val.index ) {
			newProps[name] = getValueWithIndex( item, val.index );
		} else {
			newProps[name] = val;
		}
	}
	return newProps;
}

export function removeValueTree( value, treeLifecycle ) {
	if ( value == null ) {
		return;
	}
  if ( isArray( value ) ) {
	for ( let i = 0; i < value.length; i++ ) {
	  const child = value[i];

	  removeValueTree( child, treeLifecycle )
	}
  } else if ( typeof value === 'object' ) {
	const tree = value.domTree;

	tree.remove( value, treeLifecycle );
  }
}
