import eventHooks from './shared/eventHooks';

/**
 * Creates a wrapped handler that hooks into the Inferno
 * eventHooks system based on the type of event being
 * attached.
 *
 * @param {string} type
 * @param {function} handler
 * @return {function} wrapped handler
*/
export default function setHandler(type, handler) {
	let wrapper = eventHooks[type];
	if (wrapper) {
		return wrapper(handler);
	}

	return { handler };
}