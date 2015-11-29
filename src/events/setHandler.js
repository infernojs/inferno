import isArray from '../util/isArray';
import eventHooks from './shared/eventHooks';

export default function setHandler(type, handler) {
	let wrapper = eventHooks[type];
	if (wrapper && wrapper.setup) {
		return wrapper.setup(handler);
	}

	return handler;
}