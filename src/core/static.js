import { isAttrAnEvent } from './utils';

export function createStaticElement(tag, attrs) {
	//add in DOM is available check?
	var dom = document.createElement(tag);
	if (attrs) {
		createStaticAttributes(attrs, dom);
	}

	return dom;
}

function createStaticAttributes(attrs, dom) {
	var attrKeys = Object.keys(attrs);

	for (var i = 0; i < attrKeys.length; i++) {
		var attr = attrKeys[i];
		var value = attrs[attr];

		if (attr === 'className') {
			dom.className = value;
		} else {
			if (value != null && value !== false && value !== true && !isAttrAnEvent(attr)) {
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