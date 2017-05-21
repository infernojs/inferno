import { inject } from './inject';
import { Observer, observer, useStaticRendering } from './observer';
import { Provider } from './Provider';
import { EventEmitter } from './utils/EventEmitter';

export {
	observer,
	Observer,
	EventEmitter as renderReporter,
	useStaticRendering,
	Provider,
	inject
};

export default {
	observer,
	Observer,
	renderReporter: EventEmitter,
	useStaticRendering,
	Provider,
	inject
};
