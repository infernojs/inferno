import { isNullOrUndefined, isArray } from './../core/utils';

// Exported only so its easier to verify registered events
export const delegatedEventsRegistry = {};
// The issue with this, is that we can't stop the bubbling as we're traversing down the node tree, rather than up it
// needs a rethink here
function scanNodeList(node, target, delegatedEvent, callbackEvent) {
	if (node.dom === target) {
		delegatedEvent.callback(callbackEvent);
		return true;
	}
	const children = node.children;

	if (children) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				const child = children[i];

				if (typeof child === 'object') {
					const result = scanNodeList(child, target, delegatedEvent, callbackEvent);

					if (result) {
						return true;
					}
				}
			}
		} else if (children.dom) {
			const result = scanNodeList(children, target, delegatedEvent, callbackEvent);

			if (result) {
				return true;
			}
		}
	}
}

const nonBubbleEvents = {
	focus: true,
	blur: true,
	mouseenter: true,
	mouseleave: true
};

export function doesNotBuuble(event) {
	return nonBubbleEvents[event] || false;
}

function createEventListener(callbackEvent) {
	const delegatedEvents = delegatedEventsRegistry[callbackEvent.type];

	for (let i = delegatedEvents.length - 1; i > -1; i--) {
		const delegatedEvent = delegatedEvents[i];
		const node = delegatedEvent.node;
		const target = callbackEvent.target;

		scanNodeList(node, target, delegatedEvent, callbackEvent);
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

export function addEventToNode(event, node, callback) {
	node.dom.addEventListener(event, callback, false);
}

export function removeEventFromNode(event, node, callback) {
	node.dom.removeEventListener(event, callback);
}

export function addEventToRegistry(event, node, callback) {
	const delegatedEvents = delegatedEventsRegistry[event];
	if (isNullOrUndefined(delegatedEvents)) {
		document.addEventListener(event, createEventListener, false);
		delegatedEventsRegistry[event] = [{
			callback: callback,
			node: node
		}];
	} else {
		delegatedEvents.push({
			callback: callback,
			node: node
		});
	}
}
