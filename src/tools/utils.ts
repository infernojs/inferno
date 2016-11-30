import {
	isArray,
	isNullOrUndef,
	isStringOrNumber,
} from '../shared';

import { VNodeFlags } from '../core/shapes';

const comparer = document.createElement('div');

export function innerHTML(HTML) {
	comparer.innerHTML = HTML;
	return comparer.innerHTML;
}

export function createStyler(CSS) {
	if (typeof CSS === 'undefined' || CSS === null) {
		return CSS;
	}
	comparer.style.cssText = CSS;
	return comparer.style.cssText;
}

export function style(CSS) {
	if (CSS instanceof Array) {
		return CSS.map(createStyler);
	} else {
		return createStyler(CSS);
	}
}

export function createContainerWithHTML(html) {
	const container = document.createElement('div');

	container.innerHTML = html;
	return container;
}

export function validateNodeTree(node) {
	if (!node) {
		return true;
	}
	if (isStringOrNumber(node)) {
		return true;
	}
	if (!node.dom) {
		return false;
	}
	const children = node.children;
	const flags = node.flags;

	if (flags & VNodeFlags.Element) {
		if (!isNullOrUndef(children)) {
			if (isArray(children)) {
				for (let val of children) {
					if (!val) {
						return false;
					}
				}
			} else {
				const val = validateNodeTree(children);

				if (!val) {
					return false;
				}
			}
		}
	}
	return true;
}

export function waits(timer, done) {
	setTimeout(done, timer);
}

export function triggerEvent(name, element) {
	let eventType;

	if (name === 'click' || name === 'dblclick' || name === 'mousedown' || name === 'mouseup') {
		eventType = 'MouseEvents';
	} else if (name === 'focus' || name === 'change' || name === 'blur' || name === 'select') {
		eventType = 'HTMLEvents';
	} else {
		throw new Error("Unsupported `'" + name + "'`event");

	}
	const event = document.createEvent(eventType);
	event.initEvent(name, name !== 'change', true);
	element.dispatchEvent(event, true);
}
