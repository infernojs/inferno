const delegatedEventsRegistry = {};

export function handleEvent(event, dom, callback) {
	if (!delegatedEventsRegistry[event]) {
		document.addEventListener(event, callbackEvent => {
			const callback = delegatedEventsRegistry[event].get(callbackEvent.target);

			if (callback) {
				callback(callbackEvent);
			}

			//for (let i = 0; i < 1; i++) {
			//	const delegatedEvent = delegatedEvents[i];
			//
			//	if (delegatedEvent.target === callbackEvent.target) {
			//		delegatedEvent.callback(callbackEvent);
			//	}
			//}
		}, false);
		delegatedEventsRegistry[event] = new Map();
	} else {
		const delegatedEvents = delegatedEventsRegistry[event];

		//for (let i = 0; i < delegatedEvents.length; i++) {
		//	const delegatedEvent = delegatedEvents[i];
		//
		//	if (delegatedEvent.target === dom) {
		//		delegatedEvents.splice(i, 1);
		//		break;
		//	}
		//}
		//delegatedEvents.push({
		//	callback: callback,
		//	target: dom
		//});
		delegatedEvents.set(dom, callback);
	}
}