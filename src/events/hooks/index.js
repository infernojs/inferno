import registerFrameEvents from './frameEvents';
import registerWheelEvents from './wheel';

export default function register(registerEventHooks) {
	registerFrameEvents(registerEventHooks);
	registerWheelEvents(registerEventHooks);
}