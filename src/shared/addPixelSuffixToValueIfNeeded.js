import unitlessProperties from './unitlessProperties';

/**
 * Normalize CSS properties, and add pixel suffix if needed
 *
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
export default function ( name, value ) {
	if ( value == null || typeof value === 'boolean' || value === '' ) {
		return '';
	}
	const isNonNumeric = isNaN( value );

	if ( value == null || value === '' || typeof value === 'boolean' ) {
		return '';
	}
	if ( value === 0 || unitlessProperties[ name] ) {
		return '' + value; // cast to string
    }
	// isNaN is expensive, so we check for it at the very end
	if ( isNaN( value) ) {
		return '' + value; // cast to string
	}
	// Todo! Should we allow auto-trim, or is too expensive?
	if ( typeof value === 'string' ) {
		value = value.trim();
	}
	return value + 'px';
}
