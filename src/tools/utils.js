import { isStringOrNumber, isNullOrUndef, isArray } from '../core/utils';
import { isVNode } from '../core/shapes';

const comparer = document.createElement('div');

export function innerHTML(HTML) {
	comparer.innerHTML = HTML;
	return comparer.innerHTML;
}

function createStyler(CSS) {
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
	if (!node._dom) {
		return false;
	}
	const children = node._children;

	if (!isNullOrUndef(children)) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				const val = validateNodeTree(children[i]);

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
	const v0 = node._v0;

	if (!isNullOrUndef(v0)) {
		if (isVNode(v0)) {
			return validateNodeTree(v0);
		}
	}
	const v1 = node._v1;

	if (!isNullOrUndef(v1)) {
		debugger;
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