import {
	isNullOrUndef,
	isString,
	addChildrenToProps,
	isStatefulComponent,
	isStringOrNumber,
	isInvalid,
	NO_OP,
	isNumber,
	isFunction,
	isArray,
	isUndefined,
	isObject,
	isAttrAnEvent
} from './../core/utils';
import {
	mount,
	mountVText,
	mountVPlaceholder,
	mountVFragment,
	mountArrayChildrenWithoutType,
	mountVComponent,
	mountVTemplate,
	mountVElement
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
	setFormElementProperties,
	removeAllChildren,
	replaceWithNewNode,
	removeEvents,
	selectValue,
	updateTextContent,
	setTextContent,
	isPropertyOfElement,
	replaceChild,
	normalise
} from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	createVPlaceholder,
	createVText,
	isVElement,
	isVFragment,
	isVText,
	isVPlaceholder,
	isVComponent,
	isVTemplate,
	isVNode
} from '../core/shapes';
import { unmount, unmountVNode } from './unmounting';
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
				replaceChild(parentDom, mountVFragment(nextInput, null), lastInput._dom);
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
			throw Error('Inferno Error: Bad input argument called on patch(). Input argument may need normalising.');
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
		throw new Error('Inferno Error: Bad childrenType value specified when attempting to patchChildren');
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
		nextTemplateReducers.patch(lastVTemplate, nextVTemplate, lifecycle, context, isSVG);
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
		setFormElementProperties(nextTag, nextVElement);
	}
}

function patchProps(lastVElement, nextVElement, lastProps, nextProps, dom) {
	const tag = nextVElement._tag;

	lastProps = lastProps || {};
	nextProps = nextProps || {};
	if (lastVElement._tag === 'select') {
		selectValue(nextVElement);
	}
	for (let prop in nextProps) {
		const nextValue = nextProps[prop];
		const lastValue = lastProps[prop];

		if (lastValue !== nextValue) {
			if (isNullOrUndef(nextValue)) {
				removeProp(tag, prop, dom);
			} else {
				patchProp(prop, lastValue, nextValue, dom);
			}
		}
	}
	for (let prop in lastProps) {
		if (isNullOrUndef(nextProps[prop])) {
			removeProp(tag, prop, dom);
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

function removeProp(tag, prop, dom) {
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
			const dom = lastVComponent._dom;
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
			let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps);

			if (nextInput === NO_OP) {
				nextInput = instance._lastInput;
			} else if (isNullOrUndef(nextInput)) {
				nextInput = createVPlaceholder();
			}
			patch(instance._lastInput, nextInput, parentDom, lifecycle, context, null, false);
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

			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
				shouldUpdate = nextHooks.onComponentShouldUpdate(lastVComponent._dom, lastProps, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
					nextHooks.onComponentWillUpdate(lastVComponent._dom, lastProps, nextProps);
				}
				let nextInput = nextComponent(nextProps, context);
				const lastInput = lastVComponent._instance;

				if (isInvalid(nextInput)) {
					nextInput = createVPlaceholder();
				}
				nextVComponent._dom = lastVComponent._dom;
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

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let lastEndIndex = lastChildrenLength - 1;
	let nextEndIndex = nextChildrenLength - 1;
	let lastStartIndex = 0;
	let nextStartIndex = 0;
	let lastStartNode = null;
	let nextStartNode = null;
	let nextEndNode = null;
	let lastEndNode = null;
	let nextNode;

	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextChildren[nextStartIndex];
		lastStartNode = lastChildren[lastStartIndex];

		if (nextStartNode._key !== lastStartNode._key) {
			break;
		}
		patch(lastStartNode, nextStartNode, dom, lifecycle, context, isSVG, false);
		nextStartIndex++;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextEndNode._key !== lastEndNode._key) {
			break;
		}
		patch(lastEndNode, nextEndNode, dom, lifecycle, context, isSVG, false);
		nextEndIndex--;
		lastEndIndex--;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastStartNode = lastChildren[lastStartIndex];

		if (nextEndNode._key !== lastStartNode._key) {
			break;
		}
		nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1]._dom : null;
		patch(lastStartNode, nextEndNode, dom, lifecycle, context, isSVG, false);
		insertOrAppend(dom, nextEndNode._dom, nextNode);
		nextEndIndex--;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextChildren[nextStartIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextStartNode._key !== lastEndNode._key) {
			break;
		}
		nextNode = lastChildren[lastStartIndex]._dom;
		patch(lastEndNode, nextStartNode, dom, lifecycle, context, isSVG, false);
		insertOrAppend(dom, nextStartNode._dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}

	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1]._dom : parentVList && parentVList._pointer;
			for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
				insertOrAppend(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, isSVG), nextNode);
			}
		}
	} else if (nextStartIndex > nextEndIndex) {
		while (lastStartIndex <= lastEndIndex) {
			unmount(lastChildren[lastStartIndex++], dom, lifecycle);
		}
	} else {
		let aLength = lastEndIndex - lastStartIndex + 1;
		let bLength = nextEndIndex - nextStartIndex + 1;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		let i;
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		let moved = false;
		let removeOffset = 0;
		let lastTarget = 0;
		let index;

		if (aLength * bLength <= 16) {
			for (i = lastStartIndex; i <= lastEndIndex; i++) {
				let removed = true;
				lastEndNode = lastChildren[i];
				for (index = nextStartIndex; index <= nextEndIndex; index++) {
					nextEndNode = nextChildren[index];
					if (lastEndNode._key === nextEndNode._key) {
						sources[index - nextStartIndex] = i;

						if (lastTarget > index) {
							moved = true;
						} else {
							lastTarget = index;
						}
						patch(lastEndNode, nextEndNode, dom, lifecycle, context, isSVG, false);
						removed = false;
						break;
					}
				}
				if (removed) {
					unmount(lastEndNode, dom);
					removeOffset++;
				}
			}
		} else {
			const prevItemsMap = new Map();

			for (i = nextStartIndex; i <= nextEndIndex; i++) {
				prevItemsMap.set(nextChildren[i]._key, i);
			}
			for (i = lastEndIndex; i >= lastStartIndex; i--) {
				lastEndNode = lastChildren[i];
				index = prevItemsMap.get(lastEndNode._key);

				if (index === undefined) {
					unmount(lastEndNode, dom, lifecycle);
					removeOffset++;
				} else {

					nextEndNode = nextChildren[index];

					sources[index - nextStartIndex] = i;
					if (lastTarget > index) {
						moved = true;
					} else {
						lastTarget = index;
					}
					patch(lastEndNode, nextEndNode, dom, lifecycle, context, isSVG, false);
				}
			}
		}

		let pos;
		if (moved) {
			let seq = lis_algorithm(sources);
			index = seq.length - 1;
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList._pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, isSVG), nextNode);
				} else {
					if (index < 0 || i !== seq[index]) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList._pointer;
						insertOrAppend(dom, nextChildren[pos]._dom, nextNode);
					} else {
						index--;
					}
				}
			}
		} else if (aLength - removeOffset !== bLength) {
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList._pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, isSVG), nextNode);
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