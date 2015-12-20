import unitlessProperties from './unitlessProperties';

/**
 * Normalize CSS properties for SSR
 *
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
export default (name, value) => {
	if (value === null || (value === '')) {
		return '';
	}

	if (value === 0 || (unitlessProperties(name))) {
		return '' + value; // cast to string
	}

	if (isNaN(value)) {
		return '' + value; // cast to string
	}

	if (typeof value === 'string') {
		value = value.trim();
	}
	return value + 'px';
};