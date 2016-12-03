const delegatedEvents = new Map();

export function handleEvent(name, lastEvent, nextEvent, dom) {
	let delegatedRoots = delegatedEvents.get(name);

	if (!delegatedRoots) {
		delegatedRoots = new Map();
		delegatedEvents.set(name, delegatedRoots);
		attachEventToDocument(name, delegatedRoots);
	}	
	if (nextEvent) {
		delegatedRoots.set(dom, nextEvent);
	} else {
		delegatedRoots.remove(dom);
	}
}

function dispatchEvent(event, dom, delegatedRoots, eventData) {
	const eventsToTrigger = delegatedRoots.get(dom);
	const parentDom = dom.parentNode;

	if (eventsToTrigger) {
		eventsToTrigger(event);
		if (eventData.stopPropagation) {
			return;
		}
	}
	if (parentDom || parentDom === document.body) {
		dispatchEvent(event, parentDom, delegatedRoots, eventData);
	}
}

function normalizeEventName(name) {
	return name.substr(2).toLowerCase();
}

function attachEventToDocument(name, delegatedRoots) {
	document.addEventListener(normalizeEventName(name), (event: Event) => {
		const eventData = {
			stopPropagation: false
		};
		event.stopPropagation = () => {
			eventData.stopPropagation = true;
		};
		dispatchEvent(event, event.target, delegatedRoots, eventData);
	});
}