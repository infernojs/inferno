import unitlessCfg from "./cfg/unitlessCfg";

/**
 * Normalize CSS properties for SSR
 *
 * @param {String} name The boolean attribute name to set.
 * @param {String} value The boolean attribute value to set.
 */
function normalizeCSS(name, value) {
	if (value === null || (value === '')) {
		return '';
	}
	if (value === 0 || (unitlessCfg[name] || (isNaN(value)))) {
		return '' + value; // cast to string
	}
	if (typeof value === 'string') {
		value = value.trim();
	}
	return value + 'px';
};

export default normalizeCSS;