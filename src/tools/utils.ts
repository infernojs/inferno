import {
	isArray,
	isNullOrUndef,
	isStringOrNumber,
} from '../shared';

import { VNodeFlags } from '../types';

const comparer = document.createElement('div');

export function sortAttributes(html: string): string {
	return html.replace(/<([a-z0-9-]+)((?:\s[a-z0-9:_.-]+=".*?")+)((?:\s*\/)?>)/gi, (s, pre, attrs, after) => {
		const attrName = (attribute: string): string => attribute.split('=')[0];
		const list: string[] = attrs.match(/\s[a-z0-9:_.-]+=".*?"/gi).sort( (a, b) => attrName(a) > attrName(b) ? 1 : -1 );
		if (~after.indexOf('/')) {
      after = '></' + pre + '>';
    }
		return '<' + pre + list.join('') + after;
	});
}

export function innerHTML(HTML: string): string {
	comparer.innerHTML = HTML;
	return sortAttributes(comparer.innerHTML);
}

export function createStyler(CSS: string): string {
	if (typeof CSS === 'undefined' || CSS === null) {
		return CSS;
	}
	comparer.style.cssText = CSS;
	return comparer.style.cssText;
}

export function style(CSS: string[] | string): string[] | string {
	if (CSS instanceof Array) {
		return CSS.map(createStyler);
	} else {
		return createStyler(CSS);
	}
}

export function createContainerWithHTML(html: string): HTMLDivElement {
	const container = document.createElement('div');

	container.innerHTML = html;
	return container;
}

export function validateNodeTree(node: any): boolean {
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
				for (let child of children) {
					const val = validateNodeTree(child);

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

export function waits(timer: number, done: Function) {
	setTimeout(done, timer);
}

export function triggerEvent(name: string, element: any) {
	let eventType;

	if (name === 'click' || name === 'dblclick' || name === 'mousedown' || name === 'mouseup') {
		eventType = 'MouseEvents';
	} else if (name === 'focus' || name === 'change' || name === 'blur' || name === 'select') {
		eventType = 'HTMLEvents';
	} else {
		throw new Error('Unsupported `"' + name + '"`event');

	}
	const event = document.createEvent(eventType);
	event.initEvent(name, name !== 'change', true);
	element.dispatchEvent(event, true);
}
