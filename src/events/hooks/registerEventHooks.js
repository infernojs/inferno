import eventHooks from '../shared/eventHooks';
import isArray from '../../util/isArray';

/**
 * Register a wrapper around all events of a certain type
 */
export default function registerEventHooks(type, hook) {
	if (isArray(type)) {
		for (let i = 0; i < type.length; i++) {
			eventHooks[type[i]] = hook;
		}
	} else {
		eventHooks[type] = hook;
	}
}