import { isNullOrUndefined, isString, addChildrenToProps, isStatefulComponent, isStringOrNumber, isArray, isInvalidNode, isObject } from './../core/utils';
import { diffNodes, diffNodesWithTemplate } from './diffing';
import { mountNode } from './mounting';
import { insertOrAppendKeyed, insertOrAppendNonKeyed, remove, createEmptyTextNode, detachNode, createVirtualFragment, isKeyed } from './utils';
import { recyclingEnabled, pool } from './recycling';

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

const SampoKivistö = {
	'xlink:href' : xlinkNS,
	'xlink:arcrole' : xlinkNS,
	'xlink:Actuate' : xlinkNS,
	'xlink:Role' : xlinkNS,
	'xlink:row' : xlinkNS,
	'xlink:titlef' : xlinkNS,
	'xlink:type' : xlinkNS,
	'xml:base' : xmlNS,
	'xml:lang' : xmlNS,
	'xml:space' : xmlNS
};


export function updateTextNode(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

export function patchNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, deepCheck) {
	if (deepCheck !== null) {
		const lastTpl = lastNode.tpl;
		const nextTpl = nextNode.tpl;

		if (lastTpl === undefined) {
			diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, true);
		} else {
			diffNodesWithTemplate(lastNode, nextNode, lastTpl, nextTpl, parentDom, namespace, lifecycle, context, instance, true);
		}
	} else if (isInvalidNode(lastNode)) {
		mountNode(nextNode, parentDom, namespace, lifecycle, context, instance);
	} else if (isInvalidNode(nextNode)) {
		remove(lastNode, parentDom);
	} else if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			const dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);
			nextNode.dom = dom;
			parentDom.replaceChild(dom, parentDom.firstChild);
		}
	} else if (isStringOrNumber(nextNode)) {
		const textNode = document.createTextNode(nextNode);
		parentDom.replaceChild(textNode, lastNode.dom);
	} else {
		const lastTpl = lastNode.tpl;
		const nextTpl = nextNode.tpl;
		const deepCheck = lastTpl !== nextTpl;

		if (lastTpl === undefined) {
			diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, deepCheck);
		} else {
			diffNodesWithTemplate(lastNode, nextNode, lastTpl, nextTpl, parentDom, namespace, lifecycle, context, instance, deepCheck);
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
				let value = nextAttrValue[style];

				dom.style[style] = value;
			}
		}
	} else if (isNullOrUndefined(nextAttrValue)) {
		dom.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextAttrValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];
			let value = nextAttrValue[style];

			dom.style[style] = value;
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

export function patchEvents(lastEvents, nextEvents, dom) {
	const nextEventKeys = Object.keys(nextEvents);

	for (let i = 0; i < nextEventKeys.length; i++) {
		const event = nextEventKeys[i];
		const lastEvent = lastEvents[event];
		const nextEvent = nextEvents[event];

		if (lastEvent !== nextEvent) {
			dom[event] = nextEvent;
		}
	}
	const lastEventKeys = Object.keys(lastEvents);

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
			const namespace = SampoKivistö[attrName];

			if (namespace) {
				dom.setAttributeNS(namespace, attrName, nextAttrValue === true ? attrName : nextAttrValue);
			} else {
				dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
			}
		}
	}
}


export function patchComponent(hasTemplate, lastNode, Component, lastTpl, nextTpl, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
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
			patchNode(lastNode, nextNode, parentDom, null, lifecycle, context, instance, true);
			lastNode.dom = nextNode.dom;
			instance._lastNode = nextNode;
		}
	} else {
		let shouldUpdate = true;
		const nextHooksDefined = (hasTemplate && nextTpl.hasHooks === true) || !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
			shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
		}
		if (shouldUpdate !== false) {
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
				nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
			}
			const nextNode = Component(nextProps);
			const dom = lastNode.dom;
			nextNode.dom = dom;
			patchNode(instance, nextNode, dom, null, lifecycle, context, null, true);
			lastNode.instance = nextNode;
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
				nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, namespace, lifecycle, context, instance, domChildrenIndex) {
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
					domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);
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
						dom.replaceChild(textNode, domChildren[index]);
						isNotVirtualFragment && domChildren.splice(index, 1, textNode);
					} else if (sameLength === true) {
						const domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);
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
						detachNode(lastChild);
					}
				} else if (isArray(nextChild)) {
					if (isKeyed(lastChild, nextChild)) {
						patchKeyedChildren(lastChild, nextChild, domChildren[index], namespace, lifecycle, context, instance);
					} else {
						if (isArray(lastChild)) {
							const domChild = domChildren[index];

							if (domChild.append === undefined) {
								if (nextChild.length > 1 && lastChild.length === 1) {
									const virtualFragment = createVirtualFragment();

									virtualFragment.insert(dom, domChild);
									virtualFragment.appendChild(domChild);
									isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
									patchNonKeyedChildren(lastChild, nextChild, virtualFragment, virtualFragment.childNodes, namespace, lifecycle, context, instance, 0);
								} else {
									patchNonKeyedChildren(lastChild, nextChild, dom, domChildren, namespace, lifecycle, context, instance, 0);
								}
							} else {
								patchNonKeyedChildren(lastChild, nextChild, domChildren[index], domChildren[index].childNodes, namespace, lifecycle, context, instance, 0);
							}
						} else {
							if (nextChild.length > 1) {
								const virtualFragment = createVirtualFragment();
								virtualFragment.appendChild(dom.firstChild);
								insertOrAppendNonKeyed(dom, virtualFragment, dom.firstChild);
								isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
								patchNonKeyedChildren([lastChild], nextChild, virtualFragment, virtualFragment.childNodes, namespace, lifecycle, context, instance, i);
							} else {
								patchNonKeyedChildren([lastChild], nextChild, dom, domChildren, namespace, lifecycle, context, instance, i);
							}
						}
					}
				} else {
					if (isArray(lastChild)) {
						patchNonKeyedChildren(lastChild, [nextChild], domChildren, domChildren[index].childNodes, namespace, lifecycle, context, instance, 0);
					} else {
						patchNode(lastChild, nextChild, dom, namespace, lifecycle, context, instance, null);
					}
				}
			}
		}
	}
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
	const p = a.slice(0);
	const result = [];
	result.push(0);
	let u;
	let v;
	let c;

	for (let i = 0, il = a.length; i < il; i++) {
		if (a[i] === -1) {
			continue;
		}

		let j = result[result.length - 1];
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

export function patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance) {
	let lastEndIndex = lastChildren.length - 1;
	let nextEndIndex = nextChildren.length - 1;

	if (lastEndIndex === -1) {
		for (let i = 0; i <= nextEndIndex; i++) {
			mountNode(nextChildren[i], dom, namespace, lifecycle, context, instance);
		}
		return;
	} else if (nextEndIndex === -1) {
		for (let i = 0; i <= lastEndIndex; i++) {
			remove(lastChildren[i], dom);
		}
		return;
	}

	let lastStartIndex = 0;
	let nextStartIndex = 0;
	let lastStartNode = lastChildren[lastStartIndex];
	let nextStartNode = nextChildren[nextStartIndex];
	let lastEndNode = lastChildren[lastEndIndex];
	let nextEndNode = nextChildren[nextEndIndex];
	let stop = false;
	let nextPos;
	let nextNode;
	let lastTarget = 0;
	let pos;
	let node;

	outer: do {
		stop = true;
		while (lastStartNode.key === nextStartNode.key) {
			patchNode(lastStartNode, nextStartNode, dom, namespace, lifecycle, context, instance, true);
			lastStartIndex++;
			nextStartIndex++;
			if (lastStartIndex > lastEndIndex || nextStartIndex > nextEndIndex) {
				break outer;
			}
			lastStartNode = lastChildren[lastStartIndex];
			nextStartNode = nextChildren[nextStartIndex];
			stop = false;
		}
		while (lastEndNode.key === nextEndNode.key) {
			patchNode(lastEndNode, nextEndNode, dom, namespace, lifecycle, context, instance, true);
			lastEndIndex--;
			nextEndIndex--;
			if (lastStartIndex > lastEndIndex || nextStartIndex > nextEndIndex) {
				break outer;
			}
			lastEndNode = lastChildren[lastEndIndex];
			nextEndNode = nextChildren[nextEndIndex];
			stop = false;
		}
		while (lastStartNode.key === nextEndNode.key) {
			patchNode(lastStartNode, nextEndNode, dom, namespace, lifecycle, context, instance, true);
			nextPos = nextEndIndex + 1;
			nextNode = nextPos < nextChildren.length ? nextChildren[nextPos].dom : null;
			insertOrAppendKeyed(dom, nextEndNode.dom, nextNode);
			lastStartIndex++;
			nextEndIndex--;
			if (lastStartIndex > lastEndIndex || nextStartIndex > nextEndIndex) {
				break outer;
			}
			lastStartNode = lastChildren[lastStartIndex];
			nextEndNode = nextChildren[nextEndIndex];
			stop = false;
			continue outer;
		}
		while (lastEndNode.key === nextStartNode.key) {
			patchNode(lastEndNode, nextStartNode, dom, namespace, lifecycle, context, instance, true);
			insertOrAppendKeyed(dom, nextStartNode.dom, lastStartNode.dom);
			lastEndIndex--;
			nextStartIndex++;
			if (lastStartIndex > lastEndIndex || nextStartIndex > nextEndIndex) {
				break outer;
			}
			lastEndNode = lastChildren[lastEndIndex];
			nextStartNode = nextChildren[nextStartIndex];
			stop = false;
		}
	} while (!stop && lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex);

	if (lastStartIndex > lastEndIndex) {
		nextPos = nextEndIndex + 1;
		nextNode = nextPos < nextChildren.length ? nextChildren[nextPos].dom : null;
		while (nextStartIndex <= nextEndIndex) {
			insertOrAppendKeyed(dom, mountNode(nextChildren[nextStartIndex++], null, namespace, lifecycle, context, instance), nextNode);
		}
	} else if (nextStartIndex > nextEndIndex) {
		while (lastStartIndex <= lastEndIndex) {
			remove(lastChildren[lastStartIndex++], dom);
		}
	} else {
		// Perform more complex sync algorithm on the remaining nodes.
		//
		// We start by marking all nodes from b as inserted, then we try to find all removed nodes and
		// simultaneously perform syncs on the nodes that exists in both lists and replacing "inserted"
		// marks with the position of the node from the list b in list a. Then we just need to perform
		// slightly modified LIS algorithm, that ignores "inserted" marks and find common subsequence and
		// move all nodes that doesn't belong to this subsequence, or insert if they have "inserted" mark.
		const aLength = lastEndIndex - lastStartIndex + 1;
		const bLength = nextEndIndex - nextStartIndex + 1;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		for (let i = 0; i < bLength; i++) {
			sources[i] = -1;
		}

		let moved = false;
		let removeOffset = 0;

		// When lists a and b are small, we are using naive O(M*N) algorithm to find removed children.
		if (aLength * bLength <= 16) {
			for (let i = lastStartIndex; i <= lastEndIndex; i++) {
				let removed = true;
				let aNode = lastChildren[i];
				for (let j = nextStartIndex; j <= nextEndIndex; j++) {
					let bNode = nextChildren[j];
					if (aNode.key === bNode.key) {
						sources[j - nextStartIndex] = i;

						if (lastTarget > j) {
							moved = true;
						} else {
							lastTarget = j;
						}
						patchNode(aNode, bNode, dom, namespace, lifecycle, context, instance, true);
						removed = false;
						break;
					}
				}
				if (removed) {
					remove(aNode, dom);
					removeOffset++;
				}
			}
		} else {
			const keyIndex = new Map();

			for (let i = nextStartIndex; i <= nextEndIndex; i++) {
				node = nextChildren[i];
				keyIndex.set(node.key, i);
			}
			for (let i = lastStartIndex; i <= lastEndIndex; i++) {
				let aNode = lastChildren[i];
				let j = keyIndex.get(aNode.key);
				if (j !== void 0) {
					let bNode = nextChildren[j];
					sources[j - nextStartIndex] = i;
					if (lastTarget > j) {
						moved = true;
					} else {
						lastTarget = j;
					}
					patchNode(aNode, bNode, dom, namespace, lifecycle, context, instance, true);
				} else {
					remove(aNode, dom);
					removeOffset++;
				}
			}
		}
		if (moved) {
			const seq = lis_algorithm(sources);
			let j = seq.length - 1;
			for (let i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					node = nextChildren[pos];
					nextPos = pos + 1;
					nextNode = nextPos < bLength ? nextChildren[nextPos].dom : null;
					insertOrAppendKeyed(dom, mountNode(node, null, namespace, lifecycle, context, instance), nextNode);
				} else {
					if (j < 0 || i !== seq[j]) {
						pos = i + nextStartIndex;
						node = nextChildren[pos];
						nextPos = pos + 1;
						nextNode = nextPos < bLength ? nextChildren[nextPos].dom : null;
						insertOrAppendKeyed(dom, node.dom, nextNode);
					} else {
						j--;
					}
				}
			}
		} else if (aLength - removeOffset !== bLength) {
			for (let i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					node = nextChildren[pos];
					nextPos = pos + 1;
					nextNode = nextPos < bLength ? nextChildren[nextPos].dom : null;
					insertOrAppendKeyed(dom, mountNode(node, null, namespace, lifecycle, context, instance), nextNode);
				}
			}
		}
	}
}
