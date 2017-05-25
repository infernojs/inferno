import { inject } from './inject';
import { Observer, observer, useStaticRendering } from './observer';
import { Provider } from './Provider';
import { EventEmitter } from './utils/EventEmitter';

export {
	EventEmitter,
	Observer,
	Provider,
	inject,
	observer,
	EventEmitter as renderReporter,
	useStaticRendering
};

export default {
	EventEmitter,
	Observer,
	Provider,
	inject,
	observer,
	renderReporter: EventEmitter,
	useStaticRendering
};
