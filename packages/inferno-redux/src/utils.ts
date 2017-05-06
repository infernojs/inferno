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
		// tslint:disable-next-line:no-console
		console.error(message);
	}

	try {
		// This error was thrown as a convenience so that if you enable
		// "break on all exceptions" in your console,
		// it would pause the execution at this line.
		throw new Error(message);

		// tslint:disable-next-line:no-empty
	} catch (e) {}
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
	for (let i = 0, len = keysA.length; i < len; i++) {
		const key = keysA[i];

		if (!hasOwn.call(objB, key) || objA[key] !== objB[key]) {
			return false;
		}
	}
	return true;
}

export function wrapActionCreators(actionCreators) {
	return dispatch => bindActionCreators(actionCreators, dispatch);
}
