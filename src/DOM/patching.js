import { isNullOrUndefined, isString, addChildrenToProps, isStatefulComponent, isStringOrNumber, isArray, isInvalidNode } from './../core/utils';
import { diffNodes, diffNodesWithTemplate } from './diffing';
import { mountNode } from './mounting';
import { insertOrAppendKeyed, insertOrAppendNonKeyed, remove, createEmptyTextNode, detachNode, createVirtualFragment, isKeyed } from './utils';

// Checks if property is boolean type
function booleanProps(prop) {
	switch (prop.length) {
		case 5: return prop === 'value';
		case 7: return prop === 'checked';
		case 8: return prop === 'disabled' || prop === 'selected';
		default: return false;
	}
}

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';

const namespaces = {
	'xlink:href': xlinkNS,
	'xlink:arcrole': xlinkNS,
	'xlink:actuate': xlinkNS,
	'xlink:role': xlinkNS,
	'xlink:row': xlinkNS,
	'xlink:titlef': xlinkNS,
	'xlink:type': xlinkNS,
	'xml:base': xmlNS,
	'xml:lang': xmlNS,
	'xml:space': xmlNS
};

export function updateTextNode(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

export function patchNode(lastNode, nextNode, parentDom, lifecycle, context, instance, deepCheck) {
	if (deepCheck !== null) {
		const lastBp = lastNode.bp;
		const nextBp = nextNode.bp;

		if (lastBp === undefined || nextBp === undefined) {
			diffNodes(lastNode, nextNode, parentDom, lifecycle, context, instance, true);
		} else {
			diffNodesWithTemplate(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, true);
		}
	} else if (isInvalidNode(lastNode)) {
		mountNode(nextNode, parentDom, lifecycle, context, instance);
	} else if (isInvalidNode(nextNode)) {
		remove(lastNode, parentDom);
	} else if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			const dom = mountNode(nextNode, null, lifecycle, context, instance);
			nextNode.dom = dom;
			parentDom.replaceChild(dom, parentDom.firstChild);
		}
	} else if (isStringOrNumber(nextNode)) {
		const textNode = document.createTextNode(nextNode);
		parentDom.replaceChild(textNode, lastNode.dom);
	} else {
		const lastBp = lastNode.bp;
		const nextBp = nextNode.bp;
		const deepCheck = lastBp !== nextBp;

		if (lastBp === undefined) {
			diffNodes(lastNode, nextNode, parentDom, lifecycle, context, instance, deepCheck);
		} else {
			diffNodesWithTemplate(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, deepCheck);
		}
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

				dom.style[style] = nextAttrValue[style];
			}
		}
	} else if (isNullOrUndefined(nextAttrValue)) {
		dom.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextAttrValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];

			dom.style[style] = nextAttrValue[style];
		}
		// TODO: possible optimization could be we remove all and add all from nextKeys then we can skip this obj loop
		// TODO: needs performance benchmark
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

export function patchAttribute(attrName, nextAttrValue, dom) {
	if (booleanProps(attrName)) {
		dom[attrName] = nextAttrValue;

	} else {
		if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
			dom.removeAttribute(attrName);
		} else {
			if (namespaces[attrName]) {
				dom.setAttributeNS(namespaces[attrName], attrName, nextAttrValue === true ? attrName : nextAttrValue);
			} else {
				dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
			}
		}
	}
}


export function patchComponent(hasTemplate, lastNode, Component, lastBp, nextBp, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
	nextProps = addChildrenToProps(nextChildren, nextProps);

	if (isStatefulComponent(Component)) {
		const prevProps = instance.props;
		const prevState = instance.state;
		const nextState = instance.state;

		const childContext = instance.getChildContext();
		if (!isNullOrUndefined(childContext)) {
			context = { ...context, ...childContext };
		}
		instance.context = context;
		const nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

		if (!isNullOrUndefined(nextNode)) {
			patchNode(lastNode, nextNode, parentDom, lifecycle, context, instance, true);
			lastNode.dom = nextNode.dom;
			instance._lastNode = nextNode;
		}
	} else {
		let shouldUpdate = true;
		const nextHooksDefined = (hasTemplate && nextBp.hasHooks === true) || !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
			shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
		}
		if (shouldUpdate !== false) {
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
				nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
			}

			const nextNode = Component(nextProps);

			if (!isInvalidNode(nextNode)) {
				const dom = lastNode.dom;

				nextNode.dom = dom;
				patchNode(instance, nextNode, dom, lifecycle, context, null, true);
				lastNode.instance = nextNode;
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
					nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
				}
			}
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, lifecycle, context, instance, domChildrenIndex) {
	const isNotVirtualFragment = dom.append === undefined;
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	const sameLength = lastChildrenLength === nextChildrenLength;

	if (sameLength === false) {
		if (lastChildrenLength > nextChildrenLength) {
			while (lastChildrenLength !== nextChildrenLength) {
				const lastChild = lastChildren[lastChildrenLength - 1];

				if (!isInvalidNode(lastChild)) {
					dom.removeChild(domChildren[lastChildrenLength - 1 + domChildrenIndex]);
					detachNode(lastChild);
				}
				lastChildrenLength--;
			}
		} else {
			while (lastChildrenLength !== nextChildrenLength) {
				const nextChild = nextChildren[lastChildrenLength];
				let domNode;

				if (isStringOrNumber(nextChild)) {
					domNode = document.createTextNode(nextChild);
				} else {
					domNode = mountNode(nextChild, null, context, instance);
				}

				insertOrAppendNonKeyed(dom, domNode);
				if (isNotVirtualFragment) {
					if (lastChildrenLength === 1) {
						domChildren.push(dom.firstChild);
					}
					isNotVirtualFragment && domChildren.splice(lastChildrenLength + domChildrenIndex, 0, domNode);
				}
				lastChildrenLength++;
			}
		}
	}
	for (let i = 0; i < nextChildrenLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = nextChildren[i];
		const index = i + domChildrenIndex;

		if (lastChild !== nextChild) {
			if (isInvalidNode(nextChild)) {
				if (!isInvalidNode(lastChild)) {
					const childNode = domChildren[index];

					if (!isNullOrUndefined(childNode)) {
						if (isStringOrNumber(lastChild)) {
							childNode.nodeValue = '';
						} else if (sameLength === true) {
							const textNode = createEmptyTextNode();

							if (isArray(lastChild) && lastChild.length === 0) {
								insertOrAppendNonKeyed(dom, textNode);
								isNotVirtualFragment && domChildren.splice(index, 0, textNode);
							} else {
								dom.replaceChild(textNode, domChildren[index]);
								isNotVirtualFragment && domChildren.splice(index, 1, textNode);
								detachNode(lastChild);
							}
						}
					}
				}
			} else {
				if (isInvalidNode(lastChild)) {
					if (isStringOrNumber(nextChild)) {
						const textNode = document.createTextNode(nextChild);
						const domChild = domChildren[index];

						if (!isNullOrUndefined(domChild)) {
							dom.replaceChild(textNode, domChild);
						} else {
							insertOrAppendNonKeyed(dom, textNode, domChildren[index + 1]);
						}
						isNotVirtualFragment && domChildren.splice(index, 1, textNode);
					} else if (sameLength === true) {
						const domNode = mountNode(nextChild, null, lifecycle, context, instance);
						dom.replaceChild(domNode, domChildren[index]);
						isNotVirtualFragment && domChildren.splice(index, 1, domNode);
					}
				} else if (isStringOrNumber(nextChild)) {
					if (lastChildrenLength === 1) {
						if (isStringOrNumber(lastChild)) {
							if (dom.getElementsByTagName !== undefined) {
								dom.firstChild.nodeValue = nextChild;
							} else {
								dom.nodeValue = nextChild;
							}
						} else {
							detachNode(lastChild);
							dom.textContent = nextChild;
						}
					} else {
						const textNode = document.createTextNode(nextChild);
						const child = domChildren[index];

						if (isNullOrUndefined(child)) {
							dom.nodeValue = textNode.nodeValue;
						} else {
							if (isStringOrNumber(lastChild)) {
								child.nodeValue = nextChild;
							} else {
								// Next is single string so remove all children
								if (child.append === undefined) {
									isNotVirtualFragment && domChildren.splice(index, 1, textNode);
									dom.replaceChild(textNode, child);
								} else { // If previous child is virtual fragment remove all its content and replace with textNode
									dom.insertBefore(textNode, child.firstChild);
									child.remove();
									domChildren.splice(0, domChildren.length, textNode);
								}
							}
						}
						detachNode(lastChild);
					}
				} else if (isArray(nextChild)) {
					if (isKeyed(lastChild, nextChild)) {
						patchKeyedChildren(lastChild, nextChild, domChildren[index], lifecycle, context, instance);
					} else {
						if (isArray(lastChild)) {
							const domChild = domChildren[index];

							if (domChild.append === undefined) {
								if (nextChild.length > 1 && lastChild.length === 1) {
									const virtualFragment = createVirtualFragment();

									virtualFragment.insert(dom, domChild);
									virtualFragment.appendChild(domChild);
									isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
									patchNonKeyedChildren(lastChild, nextChild, virtualFragment, virtualFragment.childNodes, lifecycle, context, instance, 0);
								} else {
									patchNonKeyedChildren(lastChild, nextChild, dom, domChildren, lifecycle, context, instance, 0);
								}
							} else {
								patchNonKeyedChildren(lastChild, nextChild, domChildren[index], domChildren[index].childNodes, lifecycle, context, instance, 0);
							}
						} else {
							if (nextChild.length > 1) {
								const virtualFragment = createVirtualFragment();
								virtualFragment.appendChild(dom.firstChild);
								insertOrAppendNonKeyed(dom, virtualFragment, dom.firstChild);
								isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
								patchNonKeyedChildren([lastChild], nextChild, virtualFragment, virtualFragment.childNodes, lifecycle, context, instance, i);
							} else {
								patchNonKeyedChildren([lastChild], nextChild, dom, domChildren, lifecycle, context, instance, i);
							}
						}
					}
				} else {
					if (isArray(lastChild)) {
						patchNonKeyedChildren(lastChild, [nextChild], domChildren, domChildren[index].childNodes, lifecycle, context, instance, 0);
					} else {
						patchNode(lastChild, nextChild, dom, lifecycle, context, instance, null);
					}
				}
			}
		}
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance) {
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

		patchNode(lastStartNode, nextStartNode, dom, lifecycle, context, instance, true);
		nextStartIndex++;
		lastStartIndex++;
	}

	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextEndNode.key !== lastEndNode.key) {
			break;
		}

		patchNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true);
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
		patchNode(lastStartNode, nextEndNode, dom, lifecycle, context, instance, true);
		insertOrAppendKeyed(dom, nextEndNode.dom, nextNode);
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
		patchNode(lastEndNode, nextStartNode, dom, lifecycle, context, instance, true);
		insertOrAppendKeyed(dom, nextStartNode.dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}

	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : null;
			for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
				insertOrAppendKeyed(dom, mountNode(nextChildren[nextStartIndex], null, lifecycle, context, instance), nextNode);
			}
		}
	} else if (nextStartIndex > nextEndIndex) {
		while (lastStartIndex <= lastEndIndex) {
			remove(lastChildren[lastStartIndex++], dom);
		}
	} else {
		let aLength = lastEndIndex - lastStartIndex + 1;
		let bLength = nextEndIndex - nextStartIndex + 1;
		let sources = new Array(bLength);

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
						patchNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true);
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

			let prevItemsMap = new Map();

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
					patchNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true);
				}
			}
		}

		if (moved) {
			let seq = lis_algorithm(sources);
			index = seq.length - 1;
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : null;
					insertOrAppendKeyed(dom, mountNode(nextChildren[pos], null, lifecycle, context, instance), nextNode);
				} else {
					if (index < 0 || i !== seq[index]) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : null;
						insertOrAppendKeyed(dom, nextChildren[pos].dom, nextNode);
					} else {
						index--;
					}
				}
			}
		} else if (aLength - removeOffset !== bLength) {
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : null;
					insertOrAppendKeyed(dom, mountNode(nextChildren[pos], null, lifecycle, context, instance), nextNode);
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
