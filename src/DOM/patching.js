import {
	isNullOrUndef,
	isString,
	addChildrenToProps,
	isStatefulComponent,
	isStringOrNumber,
	isInvalid,
	NO_RENDER,
	isNumber,
	isFunction,
	isArray,
	isUndefined,
	isObject
} from './../core/utils';
import {
	mount,
	mountVText,
	mountVPlaceholder,
	mountVFragment,
	mountArrayChildren,
	mountVComponent
} from './mounting';
import {
	insertOrAppend,
	remove,
	isKeyed,
	replaceNode,
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
	setTextContent,
	isPropertyOfElement
} from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	createVPlaceholder,
	createVText,
	isVElement,
	isVFragment,
	isVText,
	isVPlaceholder,
	isVComponent
} from '../core/shapes';
import { unmount, unmountVNode } from './unmounting';

export function patch(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG) {
	if (lastInput !== nextInput) {
		if (isInvalid(lastInput)) {
			mount(nextInput, parentDom, lifecycle, context, instance, isSVG);
		} else if (isInvalid(nextInput)) {
			remove(lastInput, parentDom);
		} else if (isStringOrNumber(lastInput)) {
			if (isStringOrNumber(nextInput)) {
				parentDom.firstChild.nodeValue = nextInput;
			} else {
				const dom = mount(nextInput, null, lifecycle, context, instance, isSVG);

				nextInput._dom = dom;
				replaceNode(parentDom, dom, parentDom.firstChild);
			}
		} else if (isStringOrNumber(nextInput)) {
			replaceNode(parentDom, document.createTextNode(nextInput), lastInput._dom);
		} else {
			if (isVComponent(nextInput)) {
				if (isVComponent(lastInput)) {
					patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG);
				} else {
					replaceNode(parentDom, mountVComponent(nextInput, null, lifecycle, context, instance, isSVG), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVComponent(lastInput)) {
				debugger;
			} else if (isVFragment(nextInput)) {
				if (isVFragment(lastInput)) {
					patchVList(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG);
				} else {
					replaceNode(parentDom, mountVFragment(nextInput, null), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVElement(nextInput)) {
				if (isVElement(lastInput)) {
					patchVElement(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG);
				} else {
					replaceNode(parentDom, mountVNode(nextInput, null, lifecycle, context, instance, isSVG), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVElement(lastInput)) {
				replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput._dom);
				unmount(lastInput, null);
			} else if (isVFragment(lastInput)) {
				replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, instance, isSVG));
			} else if (isVPlaceholder(nextInput)) {
				if (isVPlaceholder(lastInput)) {
					patchVFragment(lastInput, nextInput);
				} else {
					replaceNode(parentDom, mountVPlaceholder(nextInput, null), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVPlaceholder(lastInput)) {
				replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput._dom);
			} else if (isVText(nextInput)) {
				if (isVText(lastInput)) {
					patchVText(lastInput, nextInput);
				} else {
					replaceNode(parentDom, mountVText(nextInput, null), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVText(lastInput)) {
				replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput._dom);
			} else {
				throw Error('Bad Input!');
			}
		}
	}
}

function patchChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG) {
	if (isInvalid(nextChildren)) {
		removeAllChildren(dom, lastChildren);
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(dom, lastChildren, nextChildren);
		} else if (!isInvalid(nextChildren)) {
			if (isArray(nextChildren)) {
				mountArrayChildren(nextChildren, dom, lifecycle, context, instance, isSVG);
			} else {
				mount(nextChildren, dom, lifecycle, context, instance, isSVG);
			}
		}
	} else if (isArray(nextChildren)) {
		if (isArray(lastChildren)) {
			nextChildren.complex = lastChildren.complex;

			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, null);
			} else {
				patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, null);
			}
		} else {
			patchNonKeyedChildren([lastChildren], nextChildren, dom, lifecycle, context, instance, isSVG, null);	
		}
	} else if (isArray(lastChildren)) {
		patchNonKeyedChildren(lastChildren, [nextChildren], dom, lifecycle, context, instance, isSVG, null);
	} else {
		patch(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
	}
}

export function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, instance, isSVG) {
	const nextHooks = nextVElement._hooks;
	const nextHooksDefined = !isNullOrUndef(nextHooks);

	if (nextHooksDefined && !isNullOrUndef(nextHooks.onWillUpdate)) {
		nextHooks.onWillUpdate(lastVElement._dom);
	}
	const nextTag = nextVElement._tag;
	const lastTag = lastVElement._tag;

	if (nextTag === 'svg') {
		isSVG = true;
	}
	if (lastTag !== nextTag) {
		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, instance, isSVG);
	} else {
		const dom = lastVElement._dom;
		const lastProps = lastVElement._props;
		const nextProps = nextVElement._props;
		const lastChildren = lastVElement._children;
		const nextChildren = nextVElement._children;

		nextVElement._dom = dom;
		if (lastChildren !== nextChildren) {
			patchChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
		}
		if (lastProps !== nextProps) {
			patchProps(lastVElement, nextVElement, lastProps, nextProps, dom, instance);
		}
		if (nextHooksDefined && !isNullOrUndef(nextHooks.onDidUpdate)) {
			nextHooks.onDidUpdate(dom);
		}
		setFormElementProperties(nextTag, nextVElement);
	}
}

function patchProps(lastVElement, nextVElement, lastProps = {}, nextProps = {}, dom, instance) {
	const tag = nextVElement._tag;

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
				if (prop === 'style') {
					patchStyle(lastValue, nextValue, dom);
				} else if (isPropertyOfElement(tag, prop)) {
					dom[prop] = nextValue;
				} else {
					dom.setAttribute(prop, nextValue);
				}
			}
		}
	}
	for (let prop in lastProps) {
		if (isUndefined(lastProps[prop])) {
			removeProp(tag, prop, dom);
		}
	}
}

function removeProp(tag, prop, dom) {
	if (prop === 'className') {
		dom.removeAttribute('class');
	} else {
		if (isPropertyOfElement(tag, prop)) {
			dom[prop] = null;
		} else {
			dom.removeAttribute(prop);
		}
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

export function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	if (attrName === 'dangerouslySetInnerHTML') {
		const lastHtml = lastAttrValue && lastAttrValue.__html;
		const nextHtml = nextAttrValue && nextAttrValue.__html;

		if (isNullOrUndef(nextHtml)) {
			throw new Error('Inferno Error: dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content');
		}
		if (lastHtml !== nextHtml) {
			dom.innerHTML = nextHtml;
		}
	} else if (strictProps[attrName]) {
		dom[attrName] = nextAttrValue === null ? '' : nextAttrValue;
	} else {
		if (booleanProps[attrName]) {
			dom[attrName] = nextAttrValue ? true : false;
		} else {
			const ns = namespaces[attrName];

			if (nextAttrValue === false || isNullOrUndef(nextAttrValue)) {
				if (ns !== undefined) {
					dom.removeAttributeNS(ns, attrName);
				} else {
					dom.removeAttribute(attrName);
				}
			} else {
				if (ns !== undefined) {
					dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
				} else {
					dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
				}
			}
		}
	}
}

export function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, parentInstance, isSVG) {
	const lastComponent = lastVComponent._component;
	const nextComponent = nextVComponent._component;
	const nextProps = nextVComponent._props;

	if (lastComponent !== nextComponent) {
		replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, parentInstance, isSVG);
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

			if (nextInput === NO_RENDER) {
				nextInput = instance._lastInput;
			} else if (isNullOrUndef(nextInput)) {
				nextInput = createVPlaceholder();
			}
			patch(instance._lastInput, nextInput, parentDom, lifecycle, context, instance, null, false);
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

function patchVList(lastVList, nextVList, parentDom, lifecycle, context, instance, isSVG) {
	const lastItems = lastVList._items;
	const nextItems = nextVList._items;
	const pointer = lastVList._pointer;

	nextVList._dom = lastVList._dom;
	nextVList._pointer = pointer;
	if (!lastItems !== nextItems) {
		if (isKeyed(lastItems, nextItems)) {
			patchKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, instance, isSVG, nextVList);
		} else {
			patchNonKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, instance, isSVG, nextVList);
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	let i = 0;

	for (; i < commonLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = normaliseChild(nextChildren, i);

		patch(lastChild, nextChild, dom, lifecycle, context, instance, isSVG);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			const child = normaliseChild(nextChildren, i);

			insertOrAppend(dom, mount(child, null, lifecycle, context, instance, isSVG), parentVList && parentVList.pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			remove(lastChildren[i], dom);
		}
	}
}

export function patchVFragment(lastVFragment, nextVFragment) {
	nextVFragment._dom = lastVFragment._dom;
}

export function patchVText(lastVText, nextVText) {
	const nextText = nextVText._text;
	const dom = lastVText._dom;

	nextVText._dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
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
		patch(lastStartNode, nextStartNode, dom, lifecycle, context, instance, isSVG, false);
		nextStartIndex++;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextEndNode._key !== lastEndNode._key) {
			break;
		}
		patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
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
		patch(lastStartNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
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
		patch(lastEndNode, nextStartNode, dom, lifecycle, context, instance, isSVG, false);
		insertOrAppend(dom, nextStartNode._dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}

	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1]._dom : parentVList && parentVList.pointer;
			for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
				insertOrAppend(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, instance, isSVG), nextNode);
			}
		}
	} else if (nextStartIndex > nextEndIndex) {
		while (lastStartIndex <= lastEndIndex) {
			remove(lastChildren[lastStartIndex++], dom);
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
						patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
						removed = false;
						break;
					}
				}
				if (removed) {
					remove(lastEndNode, dom);
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
					remove(lastEndNode, dom);
					removeOffset++;
				} else {

					nextEndNode = nextChildren[index];

					sources[index - nextStartIndex] = i;
					if (lastTarget > index) {
						moved = true;
					} else {
						lastTarget = index;
					}
					patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
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
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList.pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
				} else {
					if (index < 0 || i !== seq[index]) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList.pointer;
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
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList.pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
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
