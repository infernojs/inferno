import { isAttrAnEvent, isNullOrUndefined, isBrowser } from './utils';

// Copy of the util from dom/util, otherwise it makes massive bundles
function documentCreateElement(tag, isSVG) {
	let dom;

	if (isSVG === true) {
		dom = document.createElementNS('http://www.w3.org/2000/svg', tag);
	} else {
		dom = document.createElement(tag);
	}
	return dom;
}

export function createUniversalElement(tag, attrs, isSVG) {
	if (isBrowser) {
		const dom = documentCreateElement(tag, isSVG);
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
