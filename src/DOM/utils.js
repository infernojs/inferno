import { mount } from './mounting';
import { isArray, isNullOrUndef, isInvalid, isStringOrNumber, isUndefined } from './../core/utils';
import { unmountVFragment, unmount } from './unmounting';
import { createVText, createVPlaceholder, createVFragment } from '../core/shapes';

function constructDefaults(string, object, value) {
	/* eslint no-return-assign: 0 */
	string.split(',').forEach(i => object[i] = value);
}

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
export const strictProps = {};
export const booleanProps = {};
export const namespaces = {};
export const isUnitlessNumber = {};

constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,value', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

export function setTextContent(dom, text) {
	if (text !== '') {
		dom.textContent = text;
	} else {
		dom.appendChild(document.createTextNode(''));
	}
}

export function updateTextContent(dom, text) {
	dom.firstChild.nodeValue = text;
}

export function isPropertyOfElement(tag, prop) {
	let propsForElement = elementsPropMap.get(tag);

	if (isUndefined(propsForElement)) {
		propsForElement = getAllPropsForElement(tag);
	}
	return propsForElement[prop];
}

export function appendChild(parentDom, dom) {
	parentDom.appendChild(dom);
}

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndef(nextNode)) {
		appendChild(parentDom, newNode);
	} else {
		parentDom.insertBefore(newNode, nextNode);
	}
}

export function replaceVListWithNode(parentDom, vList, dom, lifecycle) {
	const pointer = vList._pointer;

	unmountVFragment(vList, parentDom, false, lifecycle);
	replaceChild(parentDom, dom, pointer);
}

export function documentCreateElement(tag, isSVG) {
	let dom;

	if (isSVG === true) {
		dom = document.createElementNS('http://www.w3.org/2000/svg', tag);
	} else {
		dom = document.createElement(tag);
	}
	return dom;
}

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG) {
	let lastInstance = null;
	const instanceLastNode = lastNode._lastInput;

	if (!isNullOrUndef(instanceLastNode)) {
		lastInstance = lastNode;
		lastNode = instanceLastNode;
	}
	unmount(lastNode, null, lifecycle);
	const dom = mount(nextNode, null, lifecycle, context, isSVG);

	nextNode._dom = dom;
	replaceChild(parentDom, dom, lastNode._dom);
	if (lastInstance !== null) {
		lastInstance._lasInput = nextNode;
	}
}

export function replaceChild(parentDom, nextDom, lastDom) {
	parentDom.replaceChild(nextDom, lastDom);
}

export function normalise(object) {
	if (isStringOrNumber(object)) {
		return createVText(object);
	} else if (isInvalid(object)) {
		return createVPlaceholder();
	} else if (isArray(object)) {
		return createVFragment(object);
	}
	return object;
}

export function normaliseChild(children, i) {
	const child = children[i];

	return children[i] = normalise(child);
}

export function removeChild(parentDom, dom) {
	parentDom.removeChild(dom);
}

export function removeEvents(events, lastEventKeys, dom) {
	const eventKeys = lastEventKeys || Object.keys(events);

	for (let i = 0; i < eventKeys.length; i++) {
		const event = eventKeys[i];

		dom[event] = null;
	}
}

// TODO: for node we need to check if document is valid
export function getActiveNode() {
	return document.activeElement;
}

export function removeAllChildren(dom, children, lifecycle) {
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (!isInvalid(child)) {
			unmount(child, null, lifecycle);
		}
	}
	dom.textContent = '';
}

export function resetActiveNode(activeNode) {
	if (activeNode !== null && activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
	}
}

export function isKeyed(lastChildren, nextChildren) {
	if (lastChildren.complex) {
		return false;
	}
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0]._key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0]._key);
}

function selectOptionValueIfNeeded(vdom, values) {
	if (vdom._tag !== 'option') {
		for (let i = 0, len = vdom._children.length; i < len; i++) {
			selectOptionValueIfNeeded(vdom._children[i], values);
		}
		// NOTE! Has to be a return here to catch optGroup elements
		return;
	}

	const value = vdom._props && vdom._props.value;

	if (values[value]) {
		vdom._props = vdom._props || {};
		vdom._props.selected = true;
		vdom._dom.selected = true;
	} else {
		vdom._dom.selected = false;
	}
}

export function selectValue(vdom) {
	const value = vdom._props && vdom._props.value;
	const values = {};

	if (isArray(value)) {
		for (let i = 0, len = value.length; i < len; i++) {
			values[value[i]] = value[i];
		}
	} else {
		values[value] = value;
	}
	for (let i = 0, len = vdom._children.length; i < len; i++) {
		selectOptionValueIfNeeded(vdom._children[i], values);
	}

	if (vdom._props && vdom._props[value]) {
		delete vdom._props.value; // TODO! Avoid deletion here. Set to null or undef. Not sure what you want to usev
	}
}

export function setValueProperty(node, dom) {
	const value = node.value;

	if (!isNullOrUndef(value)) {
		dom.value = value;
	}
}

export function resetStatefulDomProperties(dom) {
	const tagName = dom.tagName;

	if (tagName === 'INPUT') {
		if (dom.checked) {
			dom.checked = false;
		}
	}
}