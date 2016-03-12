const delegatedEventsRegistry = {};

export function handleEvent(event, dom, callback) {
	if (delegatedEventsRegistry[event]) {
		const delegatedEvents = delegatedEventsRegistry[event];

		delegatedEvents.push({
			callback: callback,
			target: dom
		});
	} else {
		document.addEventListener(event, callbackEvent => {
			const delegatedEvents = delegatedEventsRegistry[event];

			for (let i = delegatedEvents.length - 1; i > -1; i--) {
				const delegatedEvent = delegatedEvents[i];

				if (delegatedEvent.target === callbackEvent.target) {
					delegatedEvent.callback(callbackEvent);
				}
			}
		}, false);
		delegatedEventsRegistry[event] = [{
			callback: callback,
			target: dom
		}];
	}
}
