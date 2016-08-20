import {
	isNullOrUndef,
	isUndefined,
	isNull,
	isString,
	isStatefulComponent,
	isStringOrNumber,
	isInvalid,
	NO_OP,
	isNumber,
	isArray,
	isAttrAnEvent,
	throwError
} from './../core/utils';
import {
	mount,
	mountVText,
	mountVPlaceholder,
	mountVFragment,
	mountArrayChildrenWithoutType,
	mountVComponent,
	mountVTemplate,
	mountVElement,
	mountArrayChildrenWithType
} from './mounting';
import {
	insertOrAppend,
	isKeyed,
	isUnitlessNumber,
	booleanProps,
	strictProps,
	namespaces,
	replaceVListWithNode,
	normaliseChild,
	resetStatefulDomProperties,
	removeAllChildren,
	replaceWithNewNode,
	selectVElementValue,
	updateTextContent,
	setTextContent,
	replaceChild,
	normalise
} from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	createVPlaceholder,
	isVElement,
	isVFragment,
	isVText,
	isVPlaceholder,
	isVComponent,
	isVTemplate,
	isVNode
} from '../core/shapes';
import { unmount } from './unmounting';
import {
	isKeyedListChildrenType,
	isTextChildrenType,
	isNodeChildrenType,
	isNonKeyedListChildrenType,
	isUnknownChildrenType
} from '../core/ChildrenTypes';

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
	unmount(lastInput, null, lifecycle);
}

export function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	if (lastInput !== nextInput) {
		if (isVTemplate(nextInput)) {
			if (isVTemplate(lastInput)) {
				patchVTemplate(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVTemplate(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVTemplate(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVComponent(nextInput)) {
			if (isVComponent(lastInput)) {
				patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVComponent(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVFragment(nextInput)) {
			if (isVFragment(lastInput)) {
				patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVFragment(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVElement(nextInput)) {
			if (isVElement(lastInput)) {
				patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVElement(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVElement(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVFragment(lastInput)) {
			replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG), lifecycle);
		} else if (isVPlaceholder(nextInput)) {
			if (isVPlaceholder(lastInput)) {
				patchVPlaceholder(lastInput, nextInput);
			} else {
				replaceChild(parentDom, mountVPlaceholder(nextInput, null), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVPlaceholder(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
		} else if (isVText(nextInput)) {
			if (isVText(lastInput)) {
				patchVText(lastInput, nextInput);
			} else {
				replaceChild(parentDom, mountVText(nextInput, null), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVText(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('bad input argument called on patch(). Input argument may need normalising.');
			}
			throwError();
		}
	}
}

function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG) {
	if (isTextChildrenType(childrenType)) {
		updateTextContent(parentDom, nextChildren);
	} else if (isNodeChildrenType(childrenType)) {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	} else if (isKeyedListChildrenType(childrenType)) {
		patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
	} else if (isNonKeyedListChildrenType(childrenType)) {
		patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
	} else if (isUnknownChildrenType(childrenType)) {
		patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad childrenType value specified when attempting to patchChildren.');
		}
		throwError();
	}
}

export function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG) {
	if (isInvalid(nextChildren)) {
		removeAllChildren(parentDom, lastChildren, lifecycle);
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(parentDom, nextChildren);
		} else if (!isInvalid(nextChildren)) {
			if (isArray(nextChildren)) {
				mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG);
			} else {
				mount(nextChildren, parentDom, lifecycle, context, isSVG);
			}
		}
	} else if (isStringOrNumber(nextChildren)) {
		if (isStringOrNumber(lastChildren)) {
			updateTextContent(parentDom, nextChildren);
		} else {
			setTextContent(parentDom, nextChildren);
		}
	} else if (isStringOrNumber(lastChildren)) {
		const child = normalise(lastChildren);

		child._dom = parentDom.firstChild;
		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG);
	} else if (isArray(nextChildren)) {
		if (isArray(lastChildren)) {
			nextChildren.complex = lastChildren.complex;

			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			} else {
				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			}
		} else {
			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null);
		}
	} else if (isArray(lastChildren)) {
		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null);
	} else {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	}
}

export function patchVTemplate(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
	const dom = lastVTemplate._dom;
	const lastTemplateReducers = lastVTemplate._tr;
	const nextTemplateReducers = nextVTemplate._tr;

	if (lastTemplateReducers !== nextTemplateReducers) {
		const newDom = mountVTemplate(nextVTemplate, null, lifecycle, context, isSVG);

		replaceChild(parentDom, newDom, dom);
		unmount(lastVTemplate, null, lifecycle);
	} else {
		nextVTemplate._dom = dom;
		nextTemplateReducers.patch(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG);
	}
}

function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG) {
	const nextTag = nextVElement._tag;
	const lastTag = lastVElement._tag;

	if (nextTag === 'svg') {
		isSVG = true;
	}
	if (lastTag !== nextTag) {
		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG);
	} else {
		const dom = lastVElement._dom;
		const lastProps = lastVElement._props;
		const nextProps = nextVElement._props;
		const lastChildren = lastVElement._children;
		const nextChildren = nextVElement._children;

		nextVElement._dom = dom;
		if (lastChildren !== nextChildren) {
			const lastChildrenType = lastVElement._childrenType;
			const nextChildrenType = nextVElement._childrenType;

			if (lastChildrenType === nextChildrenType) {
				patchChildren(lastChildrenType, lastChildren, nextChildren, dom, lifecycle, context, isSVG);
			} else {
				patchChildrenWithUnknownType(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
			}
		}
		if (lastProps !== nextProps) {
			patchProps(lastVElement, nextVElement, lastProps, nextProps, dom);
		}
	}
}

function patchProps(lastVElement, nextVElement, lastProps, nextProps, dom) {
	lastProps = lastProps || {};
	nextProps = nextProps || {};

	if (lastVElement._tag === 'select') {
		selectVElementValue(nextVElement);
	}
	for (let prop in nextProps) {
		const nextValue = nextProps[prop];
		const lastValue = lastProps[prop];

		if (lastValue !== nextValue) {
			if (isNullOrUndef(nextValue)) {
				removeProp(prop, dom);
			} else {
				patchProp(prop, lastValue, nextValue, dom);
			}
		}
	}
	for (let prop in lastProps) {
		if (isNullOrUndef(nextProps[prop])) {
			removeProp(prop, dom);
		}
	}
}

// returns true if a property of the element has been mutated, otherwise false for an attribute
export function patchProp(prop, lastValue, nextValue, dom) {
	if (isNullOrUndef(nextValue)) {
		dom.removeAttribute(prop);
		return false;
	}
	if (prop === 'className') {
		dom.className = nextValue;
		return false;
	} else if (prop === 'style') {
		patchStyle(lastValue, nextValue, dom);
	} else if (prop === 'defaultChecked') {
		if (isNull(lastValue)) {
			dom.addAttribute('checked');
		}
		return false;
	} else if (prop === 'defaultValue') {
		if (isNull(lastValue)) {
			dom.setAttribute('value', nextValue);
		}
		return false;
	} else if (strictProps[prop]) {
		dom[prop] = nextValue === null ? '' : nextValue;
	} else if (booleanProps[prop]) {
		dom[prop] = nextValue ? true : false;
	} else if (isAttrAnEvent(prop)) {
		dom[prop.toLowerCase()] = nextValue;
	} else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
		const ns = namespaces[prop];

		if (ns) {
			dom.setAttributeNS(ns, prop, nextValue);
		} else {
			dom.setAttribute(prop, nextValue);
		}
		return false;
	}
	return true;
}

function removeProp(prop, dom) {
	if (prop === 'className') {
		dom.removeAttribute('class');
	} else if (prop === 'value') {
		dom.value = '';
	} else {
		dom.removeAttribute(prop);
	}
}

export function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndef(lastAttrValue)) {
		if (!isNullOrUndef(nextAttrValue)) {
			const styleKeys = Object.keys(nextAttrValue);

			for (let i = 0; i < styleKeys.length; i++) {
				const style = styleKeys[i];
				const value = nextAttrValue[style];

				if (isNumber(value) && !isUnitlessNumber[style]) {
					dom.style[style] = value + 'px';
				} else {
					dom.style[style] = value;
				}
			}
		}
	} else if (isNullOrUndef(nextAttrValue)) {
		dom.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextAttrValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];
			const value = nextAttrValue[style];

			if (isNumber(value) && !isUnitlessNumber[style]) {
				dom.style[style] = value + 'px';
			} else {
				dom.style[style] = value;
			}
		}
		const lastStyleKeys = Object.keys(lastAttrValue);

		for (let i = 0; i < lastStyleKeys.length; i++) {
			const style = lastStyleKeys[i];
			if (isNullOrUndef(nextAttrValue[style])) {
				dom.style[style] = '';
			}
		}
	}
}

export function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG) {
	const lastComponent = lastVComponent._component;
	const nextComponent = nextVComponent._component;
	const nextProps = nextVComponent._props || {};

	if (lastComponent !== nextComponent) {
		replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG);
	} else {
		if (isStatefulComponent(nextVComponent)) {
			const instance = lastVComponent._instance;
			const lastProps = instance.props;
			const lastState = instance.state;
			const nextState = instance.state;
			const childContext = instance.getChildContext();

			nextVComponent._instance = instance;
			instance.context = context;
			if (!isNullOrUndef(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			const lastInput = instance._lastInput;
			let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps);

			if (nextInput === NO_OP) {
				nextInput = lastInput;
			} else if (isInvalid(nextInput)) {
				nextInput = createVPlaceholder();
			}
			instance._lastInput = nextInput;
			patch(lastInput, nextInput, parentDom, lifecycle, context, null, false);
			instance._vComponent = nextVComponent;
			instance._lastInput = nextInput;
			instance.componentDidUpdate(lastProps, lastState);
			nextVComponent._dom = nextInput._dom;
			componentToDOMNodeMap.set(instance, nextInput._dom);
		} else {
			let shouldUpdate = true;
			const lastProps = lastVComponent._props;
			const nextHooks = nextVComponent._hooks;
			const nextHooksDefined = !isNullOrUndef(nextHooks);
			const lastInput = lastVComponent._instance;

			nextVComponent._dom = lastVComponent._dom;
			nextVComponent._instance = lastInput;
			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
				shouldUpdate = nextHooks.onComponentShouldUpdate(lastVComponent._dom, lastProps, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
					nextHooks.onComponentWillUpdate(lastVComponent._dom, lastProps, nextProps);
				}
				let nextInput = nextComponent(nextProps, context);

				if (nextInput === NO_OP) {
					return;
				} else if (isInvalid(nextInput)) {
					nextInput = createVPlaceholder();
				}
				patch(lastInput, nextInput, parentDom, lifecycle, context, null, null, false);
				nextVComponent._instance = nextInput;
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
					nextHooks.onComponentDidUpdate(lastInput._dom, lastProps, nextProps);
				}
			}
		}
	}
}

function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG) {
	const lastChildren = lastVFragment._children;
	const nextChildren = nextVFragment._children;
	const pointer = lastVFragment._pointer;

	nextVFragment._dom = lastVFragment._dom;
	nextVFragment._pointer = pointer;
	if (!lastChildren !== nextChildren) {
		const lastChildrenType = lastVFragment._childrenType;
		const nextChildrenType = nextVFragment._childrenType;

		if (lastChildrenType === nextChildrenType) {
			if (isKeyedListChildrenType(nextChildrenType)) {
				return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
			} else if (isKeyedListChildrenType(nextChildrenType)) {
				return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
			}
		}
		if (isKeyed(lastChildren, nextChildren)) {
			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
		} else {
			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	let i = 0;

	for (; i < commonLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = normaliseChild(nextChildren, i);

		patch(lastChild, nextChild, dom, lifecycle, context, isSVG);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			const child = normaliseChild(nextChildren, i);

			insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG), parentVList && parentVList._pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[i], dom, lifecycle);
		}
	}
}

export function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
	nextVPlacholder._dom = lastVPlacholder._dom;
}

export function patchVText(lastVText, nextVText) {
	const nextText = nextVText._text;
	const dom = lastVText._dom;

	nextVText._dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, parentVList) {
	let aLength = a.length;
	let bLength = b.length;
	let aEnd = aLength - 1;
	let bEnd = bLength - 1;
	let aStart = 0;
	let bStart = 0;
	let i;
	let j;
	let aStartNode = a[aStart];
	let bStartNode = b[bStart];
	let aEndNode = a[aEnd];
	let bEndNode = b[bEnd];
	let aNode = null;
	let bNode = null;
	let nextNode;
	let nextPos;
	let node;

	if (aLength === 0) {
		if (bLength !== 0) {
			mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG);
		}
		return;
	} else if (bLength === 0) {
		if (aLength !== 0) {
			removeAllChildren(dom, a, lifecycle);
		}
		return;
	}
	// Step 1
	/* eslint no-constant-condition: 0 */
	outer: while (true) {
		// Sync nodes with the same key at the beginning.
		while (aStartNode._key === bStartNode._key) {
			patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG);
			aStart++;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aStartNode = a[aStart];
			bStartNode = b[bStart];
		}

		// Sync nodes with the same key at the end.
		while (aEndNode._key === bEndNode._key) {
			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG);
			aEnd--;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aEndNode = a[aEnd];
			bEndNode = b[bEnd];
		}

		// Move and sync nodes from right to left.
		if (aEndNode._key === bStartNode._key) {
			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG);
			insertOrAppend(dom, bStartNode._dom, aStartNode._dom);
			aEnd--;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break;
			}
			aEndNode = a[aEnd];
			bStartNode = b[bStart];
			// In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
			// immediately jump to the start of this prefix/suffix algo.
			continue;
		}

		// Move and sync nodes from left to right.
		if (aStartNode._key === bEndNode._key) {
			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG);
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos]._dom : parentVList && parentVList._pointer;
			insertOrAppend(dom, bEndNode._dom, nextNode);
			aStart++;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break;
			}
			aStartNode = a[aStart];
			bEndNode = b[bEnd];
			continue;
		}
		break;
	}

	if (aStart > aEnd) {
		if (bStart <= bEnd) {
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos]._dom : parentVList && parentVList._pointer;
			while (bStart <= bEnd) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), nextNode);
			}
		}
	} else if (bStart > bEnd) {
		while (aStart <= aEnd) {
			unmount(a[aStart++], dom, lifecycle);
		}
	} else {
		aLength = aEnd - aStart + 1;
		bLength = bEnd - bStart + 1;
		const aNullable = a;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		let moved = false;
		let pos = 0;
		let patched = 0;

		if ((bLength <= 4) || (aLength * bLength <= 16)) {
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];
				if (patched < bLength) {
					for (j = bStart; j <= bEnd; j++) {
						bNode = b[j];
						if (aNode._key === bNode._key) {
							sources[j - bStart] = i;

							if (pos > j) {
								moved = true;
							} else {
								pos = j;
							}
							patch(aNode, bNode, dom, lifecycle, context, isSVG, false);
							patched++;
							aNullable[i] = null;
							break;
						}
					}
				}
			}
		} else {
			const keyIndex = new Map();

			for (i = bStart; i <= bEnd; i++) {
				node = b[i];
				keyIndex.set(node._key, i);
			}
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];

				if (patched < bLength) {
					j = keyIndex.get(aNode._key);

					if (!isUndefined(j)) {
						bNode = b[j];
						sources[j - bStart] = i;
						if (pos > j) {
							moved = true;
						} else {
							pos = j;
						}
						patch(aNode, bNode, dom, lifecycle, context, isSVG, false);
						patched++;
						aNullable[i] = null;
					}
				}
			}
		}
		if (aLength === a.length && patched === 0) {
			removeAllChildren(dom, a, lifecycle);
			while (bStart < bLength) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), null);
			}
		} else {
			i = aLength - patched;
			while (i > 0) {
				aNode = aNullable[aStart++];
				if (!isNull(aNode)) {
					unmount(aNode, dom, lifecycle);
					i--;
				}
			}
			if (moved) {
				let seq = lis_algorithm(sources);
				j = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos]._dom : parentVList && parentVList._pointer;
						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
					} else {
						if (j < 0 || i !== seq[j]) {
							pos = i + bStart;
							node = b[pos];
							nextPos = pos + 1;
							nextNode = nextPos < b.length ? b[nextPos]._dom : parentVList && parentVList._pointer;
							insertOrAppend(dom, node._dom, nextNode);
						} else {
							j--;
						}
					}
				}
			} else if (patched !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos]._dom : parentVList && parentVList._pointer;
						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
					}
				}
			}
		}
	}
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
	let p = a.slice(0);
	let result = [];
	result.push(0);
	let i;
	let j;
	let u;
	let v;
	let c;

	for (i = 0; i < a.length; i++) {
		if (a[i] === -1) {
			continue;
		}

		j = result[result.length - 1];
		if (a[j] < a[i]) {
			p[i] = j;
			result.push(i);
			continue;
		}

		u = 0;
		v = result.length - 1;

		while (u < v) {
			c = ((u + v) / 2) | 0;
			if (a[result[c]] < a[i]) {
				u = c + 1;
			} else {
				v = c;
			}
		}

		if (a[i] < a[result[u]]) {
			if (u > 0) {
				p[i] = result[u - 1];
			}
			result[u] = i;
		}
	}

	u = result.length;
	v = result[u - 1];

	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}

	return result;
}

export function patchVariableAsExpression(pointer, templateIsSVG) {
	return function patchVariableAsExpression(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		const lastInput = lastVTemplate.read(pointer);
		let nextInput = nextVTemplate.read(pointer);

		if (lastInput !== nextInput) {
			if (isNullOrUndef(nextInput) || !isVNode(nextInput)) {
				nextInput = normalise(nextInput);
				nextVTemplate.write(pointer, nextInput);
			}
			patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG || templateIsSVG);
		}
	};
}

export function patchVariableAsChildren(pointer, templateIsSVG, childrenType) {
	return function patchVariableAsChildren(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		const lastInput = lastVTemplate.read(pointer);
		const nextInput = nextVTemplate.read(pointer);

		if (lastInput !== nextInput) {
			patchChildren(childrenType, lastInput, nextInput, parentDom, lifecycle, context, isSVG || templateIsSVG);
		}
	};
}

export function patchVariableAsText(pointer) {
	return function patchVariableAsText(lastVTemplate, nextVTemplate, textNode) {
		const nextInput = nextVTemplate.read(pointer);

		if (lastVTemplate.read(pointer) !== nextInput) {
			textNode.nodeValue = nextInput;
		}
	};
}

export function patchTemplateClassName(pointer) {
	return function patchTemplateClassName(lastVTemplate, nextVTemplate, dom) {
		const nextClassName = nextVTemplate.read(pointer);

		if (lastVTemplate.read(pointer) !== nextClassName) {
			if (isNullOrUndef(nextClassName)) {
				dom.removeAttribute('class');
			} else {
				dom.className = nextClassName;
			}
		}
	};
}

export function patchTemplateStyle(pointer) {
	return function patchTemplateClassName(lastVTemplate, nextVTemplate, dom) {
		const lastStyle = lastVTemplate.read(pointer);
		const nextStyle = nextVTemplate.read(pointer);

		if (lastStyle !== nextStyle) {
			patchStyle(lastStyle, nextStyle, dom);
		}
	};
}

export function patchTemplateProps(propsToPatch) {
	return function patchTemplateProps(lastVTemplate, nextVTemplate, dom) {
		resetStatefulDomProperties(dom);

		for (let i = 0; i < propsToPatch.length; i += 2) {
			const prop = propsToPatch[i];
			const pointer = propsToPatch[i + 1];
			const lastValue = lastVTemplate.read(pointer);
			const nextValue = nextVTemplate.read(pointer);

			if (lastValue !== nextValue) {
				patchProp(prop, lastValue, nextValue, dom);
			}
		}
	};
}
