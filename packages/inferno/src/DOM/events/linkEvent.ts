/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {isFunction} from 'inferno-shared';
/**
 * Links given data to event as first parameter
 * @param {*} data data to be linked, it will be available in function as first parameter
 * @param {Function} event Function to be called when event occurs
 * @returns {{data: *, event: Function}}
 */
export function linkEvent(data, event) {
	if (isFunction(event)) {
		return { data, event };
	}
	return null; // Return null when event is invalid, to avoid creating unnecessary event handlers
}
