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
		delegatedRoots.count--;
		delegatedRoots.items.delete(dom);
		if (delegatedRoots.count === 0) {
			document.removeEventListener(normalizeEventName(name), delegatedRoots.docEvent);
			delegatedEvents.delete(name);
		}
	}
}

function dispatchEvent(event, target, items, count: number, dom, isClick: boolean) {
	const eventsToTrigger = items.get(target);

	if (eventsToTrigger) {
		count--;
		// linkEvent object
		dom = target;
		if (eventsToTrigger.event) {
			eventsToTrigger.event(eventsToTrigger.data, event);
		} else {
			eventsToTrigger(event);
		}
		if (event.cancelBubble) {
			return;
		}
	}
	if (count > 0) {
		const parentDom = target.parentNode;

		// Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
		// because the event listener is on document.body
		// Don't process clicks on disabled elements
		if (parentDom === null || (isClick && parentDom.nodeType === 1 && parentDom.disabled)) {
			return;
		}

		dispatchEvent(event, parentDom, items, count, dom, isClick);
	}
}

function normalizeEventName(name) {
	return name.substr(2).toLowerCase();
}

function stopPropagation() {
	this.cancelBubble = true;
	this.stopImmediatePropagation();
}

function attachEventToDocument(name, delegatedRoots) {
	const docEvent = (event: Event) => {
		const count = delegatedRoots.count;

		if (count > 0) {
			event.stopPropagation = stopPropagation;
			dispatchEvent(event, event.target, delegatedRoots.items, count, document, event.type === 'click');
		}
	};
	document.addEventListener(normalizeEventName(name), docEvent);
	return docEvent;
}

function emptyFn() {
}

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
