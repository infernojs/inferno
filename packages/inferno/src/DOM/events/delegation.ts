import { isBrowser } from 'inferno-shared';

const isiOS = isBrowser && !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
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
			delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots);
			delegatedEvents.set(name, delegatedRoots);
		}
		if (!lastEvent) {
			delegatedRoots.count++;
			if (isiOS && name === 'onClick') {
				trapClickOnNonInteractiveElement(dom);
			}
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
	if (count > 0) {
		const parentDom = dom.parentNode;

		if (parentDom || parentDom === document.body) {
			dispatchEvent(event, parentDom, items, count, eventData);
		}
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

function emptyFn() {}

function trapClickOnNonInteractiveElement(dom) {
	// Mobile Safari does not fire properly bubble click events on
	// non-interactive elements, which means delegated click listeners do not
	// fire. The workaround for this bug involves attaching an empty click
	// listener on the target node.
	// http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
	// Just set it using the onclick property so that we don't have to manage any
	// bookkeeping for it. Not sure if we need to clear it when the listener is
	// removed.
	// TODO: Only do this for the relevant Safaris maybe?
	dom.onclick = emptyFn;
}
