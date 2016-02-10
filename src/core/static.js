import { isAttrAnEvent, isNullOrUndefined } from './utils';

const isBrowser = typeof window !== 'undefined' && window.document;

export function createStaticElement(tag, attrs) {
	if (isBrowser) {
		const dom = document.createElement(tag);
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
	} else {
		if (isStringOrNumber(children)) {
			parentDom.textContent = children;
		}
	}
}