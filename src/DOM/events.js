import { isNullOrUndefined } from './../core/utils';

const delegatedEventsRegistry = {};

function createEventListener(callbackEvent) {
	const delegatedEvents = delegatedEventsRegistry[callbackEvent.type];

	for (let i = delegatedEvents.length - 1; i > -1; i--) {
		const delegatedEvent = delegatedEvents[i];

		if (delegatedEvent.target === callbackEvent.target) {
			delegatedEvent.callback(callbackEvent);
		}
	}
}

export function removeEventFromRegistry(event, callback) {
	if (isNullOrUndefined(callback)) {
		return;
	}
	const delegatedEvents = delegatedEventsRegistry[event];
	if (!isNullOrUndefined(delegatedEvents)) {
		for (let i = 0; i < delegatedEvents.length; i++) {
			const delegatedEvent = delegatedEvents[i];
			if (delegatedEvent.callback === callback) {
				delegatedEvents.splice(i, 1);
				return;
			}
		}
	}
}

export function addEventToRegistry(event, dom, callback) {
	const delegatedEvents = delegatedEventsRegistry[event];
	if (isNullOrUndefined(delegatedEvents)) {
		document.addEventListener(event, createEventListener, false);
		delegatedEventsRegistry[event] = [{
			callback: callback,
			target: dom
		}];
	} else {
		delegatedEvents.push({
			callback: callback,
			target: dom
		});
	}
}
