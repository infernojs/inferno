import { bindActionCreators } from 'redux';

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
export function warning(message) {
	/* eslint-disable no-console */
	if (typeof console !== 'undefined' && typeof console.error === 'function') {
		console.error(message);
	}

	/* eslint-enable no-console */
	try {
		// This error was thrown as a convenience so that if you enable
		// "break on all exceptions" in your console,
		// it would pause the execution at this line.
		throw new Error(message);

		/* eslint-disable no-empty */
	} catch (e) {}

	/* eslint-enable no-empty */
}

export function shallowEqual(objA, objB) {
	if (objA === objB) {
		return true;
	}
	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}
	// Test for A's keys different from B.
	const hasOwn = Object.prototype.hasOwnProperty;
	for (let i = 0; i < keysA.length; i++) {
		const key = keysA[i];

		if (!hasOwn.call(objB, key) ||
			objA[key] !== objB[key]) {
			return false;
		}
	}
	return true;
}

export function wrapActionCreators(actionCreators) {
	return (dispatch) => bindActionCreators(actionCreators, dispatch);
}
