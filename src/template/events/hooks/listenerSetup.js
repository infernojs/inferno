import isArray from '../../../util/isArray';
import raf from '../../../util/raf';

const eventHooks = {};

/**
 * Register a wrapper around all events of a certain type
 * example: rafDebounce
 */
export function registerEventHooks(type, hook) {
	if (isArray(type)) {
		for (let i = 0; i < type.length; i++) {
			eventHooks[type[i]] = hook;
		}
	} else {
		eventHooks[type] = hook;
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

// 'wheel' is a special case, so let us fix it here
const wheel = ('onwheel' in document || document.documentMode >= 9) ? 'wheel' : 'mousewheel';

function wheelSetup(handler) {
    let free = true;
    return e => {

        handler(e);
    };
}

registerEventHooks(wheel, wheelSetup);

export default function listenerSetup(type, handler) {
	return event => {
		let wrapper = eventHooks[type];

		if (wrapper) {
			return wrapper(handler)(event);
		}

		return handler(event);
	};
}