import hasNumericValue from './vars/hasNumericValue';
import hasPositiveNumericValue from './vars/hasPositiveNumericValue';
import hasOverloadedBooleanValue from './vars/hasOverloadedBooleanValue';
import hasBooleanValue from './vars/hasBooleanValue';

/**
 * Should skip false boolean attributes.
 * @param {String} name
 * @param {String} value
 * @return {Boolean}
 */
export default function(name, value) {
	return value === null ||
		(hasBooleanValue[name] && !value) ||
		(hasNumericValue[name] && isNaN(value)) ||
		(hasPositiveNumericValue[name] && (value < 1)) ||
		(hasOverloadedBooleanValue[name] && value === false);
}
