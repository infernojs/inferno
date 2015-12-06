import isArray from '../util/isArray';

function createChildren(children) {
	const childrenArray = [];
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const childItem = children[i];
			if (typeof childItem === 'string' || typeof childItem === 'number') {
				childrenArray.push(createElement(childItem));
			}
		}
	}
	return childrenArray;
}

function createElement(tag, attrs, ...children) {
	if (tag) {
		const vNode = {
			tag
		};
		if(attrs) {
			if(attrs.key !== undefined) {
				vNode.key = attrs.key;
				delete attrs.key;
			}
			vNode.attrs = attrs;
		}
		if(children) {
			if (children.length === 1) {
				vNode.children = createElement(children[0]);
			} else {
				vNode.children = createChildren(children);
			}
		}
		return vNode;
	} else {
		return {
			text: tag
		};
	}
}

export default {
	createElement
};