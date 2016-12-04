const delegatedEvents = new Map();

export function handleEvent(name, lastEvent, nextEvent, dom) {
	let delegatedRoots = delegatedEvents.get(name);

	if (nextEvent) {
		if (!delegatedRoots) {
			delegatedRoots = { items: new Map(), count: 0, docEvent: null };
			const docEvent = attachEventToDocument(name, delegatedRoots);
		
			delegatedRoots.docEvent = docEvent;
			delegatedEvents.set(name, delegatedRoots);
		}	
		if (!lastEvent) {
			delegatedRoots.count++;
		}
		delegatedRoots.items.set(dom, nextEvent);
	} else if (delegatedRoots) {
		delegatedRoots.count--;
		delegatedRoots.items.delete(dom);
		if (delegatedRoots.count === 0) {
			document.removeEventListener(name, delegatedRoots.docEvent);
			delegatedEvents.delete(name);
		}
	}
}

function dispatchEvent(event, dom, items, count, eventData) {
	const eventsToTrigger = items.get(dom);

	if (eventsToTrigger) {
		count--;
		// linkEvent object
		if (eventsToTrigger.event) {
			eventsToTrigger.event(eventsToTrigger.data, event);
		} else {
			eventsToTrigger(event);
		}
		if (eventData.stopPropagation) {
			return;
		}
	}
	const parentDom = dom.parentNode;

	if (count > 0 && (parentDom || parentDom === document.body)) {
		dispatchEvent(event, parentDom, items, count, eventData);
	}
}

function normalizeEventName(name) {
	return name.substr(2).toLowerCase();
}

function attachEventToDocument(name, delegatedRoots) {
	const docEvent = (event: Event) => {
		const eventData = {
			stopPropagation: false
		};
		event.stopPropagation = () => {
			eventData.stopPropagation = true;
		};
		const count = delegatedRoots.count;

		if (count > 0) {
			dispatchEvent(event, event.target, delegatedRoots.items, count, eventData);
		}
	};

	document.addEventListener(normalizeEventName(name), docEvent);
	return docEvent;
}