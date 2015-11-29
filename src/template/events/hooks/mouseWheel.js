import { registerEventHooks } from 'listenerSetup';

const wheel = ( 'onwheel' in document || document.documentMode >= 9 ) ? 'wheel' : 'mousewheel';

function wheelSetup(handler) {
	let free = true;
	return e => {

		handler(e);
	};
}

registerEventHooks(wheel, wheelSetup);