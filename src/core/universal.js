import { isAttrAnEvent, isNullOrUndefined } from './utils';
import { createElement } from '../DOM/utils';

// Runs only once in applications lifetime
const isBrowser = typeof window !== 'undefined' && window.document;

export function createUniversalElement(tag, attrs) {
	if (isBrowser) {
		const dom = createElement(tag);
		if (attrs) {
			createStaticAttributes(attrs, dom);
		}
		return dom;
	}
	return null;
}

function createStaticAttributes(attrs, dom) {
	const attrKeys = Object.keys(attrs);

	for (let i = 0; i < attrKeys.length; i++) {
		const attr = attrKeys[i];
		const value = attrs[attr];

		if (attr === 'className') {
			dom.className = value;
		} else {
			if (value === true) {
				dom.setAttribute(attr, attr);
			} else if (!isNullOrUndefined(value) && value !== false && !isAttrAnEvent(attr)) {
				dom.setAttribute(attr, value);
			}
		}
	}
}