import { isAttrAnEvent, isNullOrUndefined } from './utils';
import { createElement } from '../DOM/utils';

// TODO Fix! Performance killer
const isBrowser = typeof window !== 'undefined' && window.document;

export function createStaticElement(tag, attrs) {
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

		// TODO! What about SVG?
		if (attr === 'className') {
			dom.className = value;
		} else {
		// TODO! Better approach. Perf killer
				if (!isNullOrUndefined(value) && value !== false && value !== true && !isAttrAnEvent(attr)) {
				dom.setAttribute(attr, value);
			} else if (value === true) {
				dom.setAttribute(attr, attr);
			}
		}
	}
}

function createStaticChildren(children, parentDom) {
	if (isArray(children)) {
	} else if (isStringOrNumber(children)) {
			parentDom.textContent = children;
	}
}