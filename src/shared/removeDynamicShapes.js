import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../core/variables';

export default function removeShapes( valueIndex ) {

	return ( item, treeLifecycle ) => {

		const value = getValueWithIndex( item, valueIndex );

		if ( getTypeFromValue( value ) === ValueTypes.TREE ) {
			value.remove( item, treeLifecycle );
		}
	}
}