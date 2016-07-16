import { mount } from './mounting';
import {
	isArray,
	isNullOrUndef,
	isInvalid,
	isStringOrNumber,
	isUndefined
} from './../core/utils';
import { recyclingEnabled, pool } from './recycling';
import { unmountVFragment } from './unmounting';
import {
	createVText,
	createVPlaceholder,
	createVFragment
} from '../core/shapes';
import { unmount } from './unmounting';

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

const elementsPropMap = new Map();

// pre-populate with common tags
getAllPropsForElement('div');
getAllPropsForElement('span');
getAllPropsForElement('table');
getAllPropsForElement('tr');
getAllPropsForElement('td');
getAllPropsForElement('a');
getAllPropsForElement('p');

function getAllPropsForElement(tag) {
	const elem = document.createElement(tag);
	const props = {};

	for (let prop in elem) {
		props[prop] = true;
	}
	elementsPropMap.set(tag, props);
	return props;
}

export function setTextContent(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

export function isPropertyOfElement(tag, prop) {
	let propsForElement = elementsPropMap.get(tag);

	if (isUndefined(propsForElement)) {
		propsForElement = getAllPropsForElement(tag);
	}
	return propsForElement[prop];
}

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndef(nextNode)) {
		parentDom.appendChild(newNode);
	} else {
		parentDom.insertBefore(newNode, nextNode);
	}
}

export function replaceVListWithNode(parentDom, vList, dom) {
	const pointer = vList._pointer;

	unmountVFragment(vList, parentDom, false);
	replaceNode(parentDom, dom, pointer);
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

export function appendText(text, parentDom, singleChild) {
	if (parentDom === null) {
		return document.createTextNode(text);
	} else {
		if (singleChild) {
			if (text !== '') {
				parentDom.textContent = text;
				return parentDom.firstChild;
			} else {
				const textNode = document.createTextNode('');

				parentDom.appendChild(textNode);
				return textNode;
			}
		} else {
			const textNode = document.createTextNode(text);

			parentDom.appendChild(textNode);
			return textNode;
		}
	}
}

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
	let lastInstance = null;
	const instanceLastNode = lastNode._lastInput;

	if (!isNullOrUndef(instanceLastNode)) {
		lastInstance = lastNode;
		lastNode = instanceLastNode;
	}
	unmount(lastNode, false);
	const dom = mount(nextNode, null, lifecycle, context, instance, isSVG);

	nextNode._dom = dom;
	replaceNode(parentDom, dom, lastNode._dom);
	if (lastInstance !== null) {
		lastInstance._lasInput = nextNode;
	}
}

export function replaceNode(parentDom, nextDom, lastDom) {
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

export function remove(node, parentDom) {
	const dom = node._dom;
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		removeChild(parentDom, dom);
		if (recyclingEnabled) {
			pool(node);
		}
	}
	unmount(node, false);
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

export function removeAllChildren(dom, children) {
	if (recyclingEnabled) {
		const childrenLength = children.length;

		if (childrenLength > 5) {
			for (let i = 0; i < childrenLength; i++) {
				const child = children[i];

				if (!isInvalid(child)) {
					pool(child);
				}
			}
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
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}

function selectOptionValueIfNeeded(vdom, values) {
	if (vdom.tag !== 'option') {
		for (let i = 0, len = vdom.children.length; i < len; i++) {
			selectOptionValueIfNeeded(vdom.children[i], values);
		}
		// NOTE! Has to be a return here to catch optGroup elements
		return;
	}

	const value = vdom.attrs && vdom.attrs.value;

	if (values[value]) {
		vdom.attrs = vdom.attrs || {};
		vdom.attrs.selected = 'selected';
		vdom._dom.selected = true;
	} else {
		vdom._dom.selected = false;
	}
}

export function selectValue(vdom) {
	let value = vdom.attrs && vdom.attrs.value;

	let values = {};
	if (isArray(value)) {
		for (let i = 0, len = value.length; i < len; i++) {
			values[value[i]] = value[i];
		}
	} else {
		values[value] = value;
	}
	for (let i = 0, len = vdom.children.length; i < len; i++) {
		selectOptionValueIfNeeded(vdom.children[i], values);
	}

	if (vdom.attrs && vdom.attrs[value]) {
		delete vdom.attrs.value; // TODO! Avoid deletion here. Set to null or undef. Not sure what you want to usev
	}
}

export function handleAttachedHooks(hooks, lifecycle, dom) {
	if (!isNullOrUndef(hooks.onCreated)) {
		hooks.onCreated(dom);
	}
	if (!isNullOrUndef(hooks.onAttached)) {
		lifecycle.addListener(() => {
			hooks.onAttached(dom);
		});
	}
}

export function setValueProperty(nextNode) {
	const value = nextNode.attrs.value;
	if (!isNullOrUndef(value)) {
		nextNode._dom.value = value;
	}
}

export function setFormElementProperties(nextTag, nextNode) {
	if (nextTag === 'input') {
		const inputType = nextNode.attrs.type;
		if (inputType === 'text') {
			setValueProperty(nextNode);
		} else if (inputType === 'checkbox' || inputType === 'radio') {
			const checked = nextNode.attrs.checked;
			nextNode._dom.checked = !!checked;
		}
	} else if (nextTag === 'textarea') {
		setValueProperty(nextNode);
	}
}