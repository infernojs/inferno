import { isNullOrUndefined, isString, addChildrenToProps, isStatefulComponent, isStringOrNumber, isArray, isInvalidNode } from './../core/utils';
import { diffNodes, diffNodesWithTemplate } from './diffing';
import { mount } from './mounting';
import { insertOrAppendKeyed, insertOrAppendNonKeyed, remove, detachNode, createVirtualFragment, isKeyed, replaceNode } from './utils';

function constructDefaults(string, object, value) {
	/* eslint no-return-assign: 0 */
	string.split(',').forEach(i => object[i] = value);
}

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const strictProps = {};
const booleanProps = {};
const namespaces = {};

constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,value', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);

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
		diffNodesWithTemplate(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck);
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
	if (strictProps[attrName]) {
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

		if (!isInvalidNode(nextNode)) {
			patch(instance._lastNode, nextNode, parentDom, lifecycle, context, instance, null, false);
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
				patch(instance, nextNode, parentDom, lifecycle, context, null, null, false);
				lastNode.instance = nextNode;
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
					nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
				}
			}
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, lifecycle, context, instance, domChildrenIndex, isSVG) {
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
					if (isNotVirtualFragment) {
						domChildren.splice(lastChildrenLength - 1 + domChildrenIndex, 1);
					}
					detachNode(lastChild);
					lastChildrenLength--;
					lastChildren.pop();
				}
			}
		} else {
			while (lastChildrenLength !== nextChildrenLength) {
				const nextChild = nextChildren[lastChildrenLength];
				let domNode;

				lastChildren.push(nextChild);
				if (isStringOrNumber(nextChild)) {
					domNode = document.createTextNode(nextChild);
				} else {
					domNode = mount(nextChild, null, context, instance, isSVG);
				}

				if (!isInvalidNode(domNode)) {
					insertOrAppendNonKeyed(dom, domNode);
				}
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
		let index = i + domChildrenIndex;

		if (lastChild !== nextChild) {
			if (isInvalidNode(nextChild)) {
				if (!isInvalidNode(lastChild)) {
					if (isArray(lastChild) && lastChild.length === 0) {
						for (let j = 0; j < lastChild.length; j++) {
							remove(lastChild[j], dom);
						}
					} else {
						const childNode = domChildren[index];

						if (isNullOrUndefined(childNode)) {
							index--;
						}
						dom.removeChild(domChildren[index]);
						if (isNotVirtualFragment) {
							domChildren.splice(index, 1);
							domChildrenIndex--;
						}
						detachNode(lastChild);
					}
				}
			} else {
				if (isInvalidNode(lastChild)) {
					if (isStringOrNumber(nextChild)) {
						const textNode = document.createTextNode(nextChild);
						const domChild = domChildren[index];

						if (isNullOrUndefined(domChild)) {
							// TODO move to next node if need be
							const nextChild = domChildren[index + 1];
							insertOrAppendNonKeyed(dom, textNode, nextChild);
							isNotVirtualFragment && domChildren.splice(index, 1, textNode);
						} else {
							insertOrAppendNonKeyed(dom, textNode, domChild);
							isNotVirtualFragment && domChildren.splice(index, 0, textNode);
						}
					} else {
						const domNode = mount(nextChild, null, lifecycle, context, instance, isSVG);
						const domChild = domChildren[index];

						if (isNullOrUndefined(domChild)) {
							// TODO move to next node if need be
							const nextChild = domChildren[index + 1];
							insertOrAppendNonKeyed(dom, domNode, nextChild);
							isNotVirtualFragment && domChildren.splice(index, 1, domNode);
						} else {
							insertOrAppendNonKeyed(dom, domNode, domChild);
							isNotVirtualFragment && domChildren.splice(index, 0, domNode);
						}
					}
				} else if (isStringOrNumber(nextChild)) {
					if (lastChildrenLength === 1) {
						if (isStringOrNumber(lastChild)) {
							if (dom.getElementsByTagName === undefined) {
								dom.nodeValue = nextChild;
							} else {
								dom.firstChild.nodeValue = nextChild;
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
									replaceNode(dom, textNode, child);
								} else { // If previous child is virtual fragment remove all its content and replace with textNode
									insertOrAppendNonKeyed(dom, textNode, child.firstChild);
									child.remove();
									domChildren.splice(0, domChildren.length, textNode);
								}
							}
						}
						detachNode(lastChild);
					}
				} else if (isArray(nextChild)) {
					if (isKeyed(nextChild)) {
						patchKeyedChildren(lastChild, nextChild, domChildren[index], lifecycle, context, instance, isSVG);
					} else {
						if (isArray(lastChild)) {
							const domChild = domChildren[index];

							if (domChild.append === undefined) {
								if (nextChild.length > 1 && lastChild.length === 1) {
									const virtualFragment = createVirtualFragment();

									virtualFragment.insert(dom, domChild);
									virtualFragment.appendChild(domChild);
									isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
									patchNonKeyedChildren(lastChild, nextChild, virtualFragment, virtualFragment.childNodes, lifecycle, context, instance, 0, isSVG);
								} else {
									patchNonKeyedChildren(lastChild, nextChild, dom, domChildren, lifecycle, context, instance, 0, isSVG);
								}
							} else {
								patchNonKeyedChildren(lastChild, nextChild, domChildren[index], domChildren[index].childNodes, lifecycle, context, instance, 0, isSVG);
							}
						} else {
							if (nextChild.length > 1) {
								const virtualFragment = createVirtualFragment();
								virtualFragment.appendChild(dom.firstChild);
								insertOrAppendNonKeyed(dom, virtualFragment, dom.firstChild);
								isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
								patchNonKeyedChildren([lastChild], nextChild, virtualFragment, virtualFragment.childNodes, lifecycle, context, instance, i, isSVG);
							} else {
								patchNonKeyedChildren([lastChild], nextChild, dom, domChildren, lifecycle, context, instance, i, isSVG);
							}
						}
					}
				} else {
					if (isArray(lastChild)) {
						patchNonKeyedChildren(lastChild, [nextChild], domChildren, domChildren[index].childNodes, lifecycle, context, instance, 0, isSVG);
					} else {
						patch(lastChild, nextChild, dom, lifecycle, context, instance, null, isSVG);
					}
				}
			}
		}
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG) {
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
		patch(lastEndNode, nextStartNode, dom, lifecycle, context, instance, true, isSVG);
		insertOrAppendKeyed(dom, nextStartNode.dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}

	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : null;
			for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
				insertOrAppendKeyed(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, instance, isSVG), nextNode);
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
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : null;
					insertOrAppendKeyed(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
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
					insertOrAppendKeyed(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
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
