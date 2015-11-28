import isArray from '../../util/isArray';
import raf from '../../util/raf';

const plugins = {};

/**
 * Register a wrapper around all events of a certain type
 * example: rafDebounce
 */
export function registerEventHooks(type, hook) {
	if (isArray(type)) {
		for (let i = 0; i < type.length; i++) {
			plugins[type[i]] = hook;
		}
	} else {
		plugins[type] = hook;
	}
}

function rafDebounce(handler) {
	let free = true;
	return e => {
		if (free) {
			free = false;
			raf(() => {
				handler(e);
				free = true;
			});
		}
	};
}

registerEventHooks(['scroll', 'mousemove', 'drag', 'touchmove'], rafDebounce);

export default function listenerSetup(type, handler) {
	return event => {
		let wrapper = plugins[type];

		if (wrapper) {
			return wrapper(handler)(event);
		}

		return handler(event);
	};
}