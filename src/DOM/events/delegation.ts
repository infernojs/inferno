const delegatedEvents = new Map();

interface IDelegate {
	docEvent: any;
	count: number;
	items: any;
}

export function handleEvent(name, lastEvent, nextEvent, dom) {
	let delegatedRoots = delegatedEvents.get(name) as IDelegate;

	if (nextEvent) {
		if (!delegatedRoots) {
			delegatedRoots = { items: new Map(), count: 0, docEvent: null };
			const docEvent: any = attachEventToDocument(name, delegatedRoots);

			delegatedRoots.docEvent = docEvent;
			delegatedEvents.set(name, delegatedRoots);
		}
		if (!lastEvent) {
			delegatedRoots.count++;
		}
		delegatedRoots.items.set(dom, nextEvent);
	} else if (delegatedRoots) {
		if (delegatedRoots.items.has(dom)) {
			delegatedRoots.count--;
			delegatedRoots.items.delete(dom);
			if (delegatedRoots.count === 0) {
				document.removeEventListener(normalizeEventName(name), delegatedRoots.docEvent);
				delegatedEvents.delete(name);
			}
		}
	}
}

function dispatchEvent(event, dom, items, count, eventData) {
	const eventsToTrigger = items.get(dom);

	if (eventsToTrigger) {
		count--;
		// linkEvent object
		eventData.dom = dom;
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
			stopPropagation: false,
			dom: document
		};
		// we have to do this as some browsers recycle the same Event between calls
		// so we need to make the property configurable
		Object.defineProperty(event, 'currentTarget', {
			configurable: true,
			get() {
				return eventData.dom;
			}
		});
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
