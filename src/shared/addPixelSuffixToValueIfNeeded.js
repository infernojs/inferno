import unitlessProperties from './unitlessProperties';

/**
 * Normalize CSS properties for SSR
 *
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
export default function ( name, value ) {

  if (value == null || typeof value === 'boolean' || value === '') {
    return '';
  }

  const isNonNumeric = isNaN(value);

  if (value === 0 || isNonNumeric ||
    unitlessProperties[ name]) {
    return '' + value; // cast to string
  }

  if ( typeof value === 'string' ) {
		value = value.trim();
	}
	return value + 'px';
};
