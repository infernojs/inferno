const delegatedEventsRegistry = {};

// TODO This will give issues server side ( nodeJS). Need a fix
// TODO Rewrite - delegated events like this is no good for performance (jsperf?)
// Mercury also uses DOM delegator to handle events. is there perf comparison somewhere which way is better?

export function handleEvent(event, dom, callback) {
	if (delegatedEventsRegistry[event]) {
		const delegatedEvents = delegatedEventsRegistry[event];

		/* for (let i = 0; i < delegatedEvents.length; i++) {
		 const delegatedEvent = delegatedEvents[i];

		 if (delegatedEvent.target === dom) {
		 delegatedEvents.splice(i, 1);
		 break;
		 }
		 } */
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
		delegatedEventsRegistry[event] = [];
	}
}
