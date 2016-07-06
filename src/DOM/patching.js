import {
	isNullOrUndefined,
	isString,
	addChildrenToProps,
	isStatefulComponent,
	isStringOrNumber,
	isInvalidNode,
	NO_RENDER,
	isNumber
} from './../core/utils';
import { diffNodes, diffNodesWithBlueprint } from './diffing';
import {
	mount,
	mountVText,
	mountVPlaceholder,
	mountVList
} from './mounting';
import {
	insertOrAppend,
	remove,
	detachNode,
	isKeyed,
	replaceNode,
	isUnitlessNumber,
	booleanProps,
	strictProps,
	namespaces,
	isVText,
	isVPlaceholder,
	removeChild,
	replaceVListWithNode,
	isVList,
	normaliseChild
} from './utils';
import { componentToDOMNodeMap } from './rendering';
import { createVPlaceholder } from '../core/shapes';

export function updateTextNode(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

export function patchNode(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG, skipLazyCheck) {
	const lastBp = lastNode.bp;
	const nextBp = nextNode.bp;

	if (lastBp === undefined || nextBp === undefined) {
		diffNodes(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
	} else {
		diffNodesWithBlueprint(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck);
	}
}

export function patch(lastInput, nextInput, parentDom, lifecycle, context, instance, isNode, isSVG) {
	if (isNode !== null) {
		patchNode(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG, false);
	} else if (isInvalidNode(lastInput)) {
		mount(nextInput, parentDom, lifecycle, context, instance, isSVG);
	} else if (isInvalidNode(nextInput)) {
		remove(lastInput, parentDom);
	} else if (isStringOrNumber(lastInput)) {
		if (isStringOrNumber(nextInput)) {
			parentDom.firstChild.nodeValue = nextInput;
		} else {
			const dom = mount(nextInput, null, lifecycle, context, instance, isSVG);
			nextInput.dom = dom;
			replaceNode(parentDom, dom, parentDom.firstChild);
		}
	} else if (isStringOrNumber(nextInput)) {
		const textNode = document.createTextNode(nextInput);
		replaceNode(parentDom, textNode, lastInput.dom);
	} else {
		patchNode(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG, false);
	}
}

export function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndefined(lastAttrValue)) {
		if (!isNullOrUndefined(nextAttrValue)) {
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
	} else if (isNullOrUndefined(nextAttrValue)) {
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
			if (isNullOrUndefined(nextAttrValue[style])) {
				dom.style[style] = '';
			}
		}
	}
}

export function patchEvents(lastEvents, nextEvents, _lastEventKeys, _nextEventKeys, dom) {
	const nextEventKeys = _nextEventKeys || Object.keys(nextEvents);

	for (let i = 0; i < nextEventKeys.length; i++) {
		const event = nextEventKeys[i];
		const lastEvent = lastEvents[event];
		const nextEvent = nextEvents[event];

		if (lastEvent !== nextEvent) {
			dom[event] = nextEvent;
		}
	}
	const lastEventKeys = _lastEventKeys || Object.keys(lastEvents);

	for (let i = 0; i < lastEventKeys.length; i++) {
		const event = lastEventKeys[i];

		if (isNullOrUndefined(nextEvents[event])) {
			dom[event] = null;
		}
	}
}

export function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	if (attrName === 'dangerouslySetInnerHTML') {
		const lastHtml = lastAttrValue && lastAttrValue.__html;
		const nextHtml = nextAttrValue && nextAttrValue.__html;

		if (isNullOrUndefined(nextHtml)) {
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

			if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
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


export function patchComponent(hasBlueprint, lastNode, Component, lastBp, nextBp, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
	nextProps = addChildrenToProps(nextChildren, nextProps);

	if (isStatefulComponent(Component)) {
		const prevProps = instance.props;
		const prevState = instance.state;
		const nextState = instance.state;

		const childContext = instance.getChildContext();
		if (!isNullOrUndefined(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;
		let nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

		if (nextNode === NO_RENDER) {
			nextNode = instance._lastNode;
		} else if (isNullOrUndefined(nextNode)) {
			nextNode = createVPlaceholder();
		}
		patch(instance._lastNode, nextNode, parentDom, lifecycle, context, instance, null, false);
		lastNode.dom = nextNode.dom;
		instance._lastNode = nextNode;
		componentToDOMNodeMap.set(instance, nextNode.dom);
	} else {
		let shouldUpdate = true;
		const nextHooksDefined = (hasBlueprint && nextBp.hasHooks === true) || !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
			shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
		}
		if (shouldUpdate !== false) {
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
				nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
			}
			let nextNode = Component(nextProps, context);

			if (isInvalidNode(nextNode)) {
				nextNode = createVPlaceholder();
			}
			nextNode.dom = lastNode.dom;
			patch(instance, nextNode, parentDom, lifecycle, context, null, null, false);
			lastNode.instance = nextNode;
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
				nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

function patchVList(lastVList, nextVList, parentDom, lifecycle, context, instance, isSVG) {
	const lastItems = lastVList.items;
	const nextItems = nextVList.items;
	const pointer = lastVList.pointer;

	nextVList.dom = lastVList.dom;
	nextVList.pointer = pointer;
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

		if (lastChild !== nextChild) {
			if (isVList(nextChild)) {
				if (isVList(lastChild)) {
					patchVList(lastChild, nextChild, dom, lifecycle, context, instance, isSVG);
				} else {
					replaceNode(dom, mountVList(nextChild, null), lastChild.dom);
					detachNode(lastChild);
				}
			} else if (isVList(lastChild)) {
				replaceVListWithNode(dom, lastChild, mount(nextChild, null, lifecycle, context, instance, isSVG));
			} else if (isVPlaceholder(nextChild)) {
				if (isVPlaceholder(lastChild)) {
					patchVFragment(lastChild, nextChild);
				} else {
					replaceNode(dom, mountVPlaceholder(nextChild, null), lastChild.dom);
					detachNode(lastChild);
				}
			} else if (isVPlaceholder(lastChild)) {
				replaceNode(dom, mount(nextChild, null, lifecycle, context, instance, isSVG), lastChild.dom);
			} else if (isVText(nextChild)) {
				if (isVText(lastChild)) {
					patchVText(lastChild, nextChild);
				} else {
					replaceNode(dom, mountVText(nextChild, null), lastChild.dom);
					detachNode(lastChild);
				}
			} else if (isVText(lastChild)) {
				replaceNode(dom, mount(nextChild, null, lifecycle, context, instance, isSVG), lastChild.dom);
			} else {
				patch(lastChild, nextChild, dom, lifecycle, context, instance, false, isSVG);
			}
		}
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			const child = normaliseChild(nextChildren, i);
			let domNode;

			if (isVText(child)) {
				domNode = mountVText(child, null);
			} else {
				domNode = mount(child, null, lifecycle, context, instance, isSVG);
			}
			if (!isInvalidNode(domNode)) {
				insertOrAppend(dom, domNode, parentVList && parentVList.pointer);
			}
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			const child = lastChildren[i];

			removeChild(dom, child.dom);
			detachNode(child);
		}
	}
}

export function patchVFragment(lastVFragment, nextVFragment) {
	nextVFragment.dom = lastVFragment.dom;
}

export function patchVText(lastVText, nextVText) {
	const nextText = nextVText.text;
	const dom = lastVText.dom;

	nextVText.dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let i;
	let lastEndIndex = lastChildrenLength - 1;
	let nextEndIndex = nextChildrenLength - 1;
	let lastStartIndex = 0;
	let nextStartIndex = 0;
	let lastStartNode = null;
	let nextStartNode = null;
	let nextEndNode = null;
	let lastEndNode = null;
	let index;
	let nextNode;
	let lastTarget = 0;
	let pos;
	let prevItem;

	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextChildren[nextStartIndex];
		lastStartNode = lastChildren[lastStartIndex];

		if (nextStartNode.key !== lastStartNode.key) {
			break;
		}
		patch(lastStartNode, nextStartNode, dom, lifecycle, context, instance, true, isSVG);
		nextStartIndex++;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextEndNode.key !== lastEndNode.key) {
			break;
		}
		patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
		nextEndIndex--;
		lastEndIndex--;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastStartNode = lastChildren[lastStartIndex];

		if (nextEndNode.key !== lastStartNode.key) {
			break;
		}
		nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : null;
		patch(lastStartNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
		insertOrAppend(dom, nextEndNode.dom, nextNode);
		nextEndIndex--;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextChildren[nextStartIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextStartNode.key !== lastEndNode.key) {
			break;
		}
		nextNode = lastChildren[lastStartIndex].dom;
		patch(lastEndNode, nextStartNode, dom, lifecycle, context, instance, true, isSVG);
		insertOrAppend(dom, nextStartNode.dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}

	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : parentVList && parentVList.pointer;
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
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		let moved = false;
		let removeOffset = 0;

		if (aLength * bLength <= 16) {
			for (i = lastStartIndex; i <= lastEndIndex; i++) {
				let removed = true;
				lastEndNode = lastChildren[i];
				for (index = nextStartIndex; index <= nextEndIndex; index++) {
					nextEndNode = nextChildren[index];
					if (lastEndNode.key === nextEndNode.key) {
						sources[index - nextStartIndex] = i;

						if (lastTarget > index) {
							moved = true;
						} else {
							lastTarget = index;
						}
						patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
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
				prevItem = nextChildren[i];
				prevItemsMap.set(prevItem.key, i);
			}
			for (i = lastEndIndex; i >= lastStartIndex; i--) {
				lastEndNode = lastChildren[i];
				index = prevItemsMap.get(lastEndNode.key);

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
					patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
				}
			}
		}

		if (moved) {
			let seq = lis_algorithm(sources);
			index = seq.length - 1;
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
				} else {
					if (index < 0 || i !== seq[index]) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, nextChildren[pos].dom, nextNode);
					} else {
						index--;
					}
				}
			}
		} else if (aLength - removeOffset !== bLength) {
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
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
