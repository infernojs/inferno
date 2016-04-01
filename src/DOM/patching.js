import { isNullOrUndefined, isAttrAnEvent, isString, isNumber, addChildrenToProps, isStatefulComponent, isStringOrNumber, isArray, isInvalidNode, isObject } from '../core/utils';
import { diffNodes } from './diffing';
import { mountNode } from './mounting';
import { insertOrAppend, remove, createEmptyTextNode, detachNode, createVirtualFragment, isKeyed } from './utils';
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

export function updateTextNode(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

export function patchNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, staticCheck) {
	if (staticCheck !== null) {
		diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, staticCheck);
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
		diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, lastNode.tpl !== null && nextNode.tpl !== null);
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

export function patchAttribute(attrName, nextAttrValue, dom) {
	if (!isAttrAnEvent(attrName)) {
		if (booleanProps(attrName)) {
			dom[attrName] = nextAttrValue;
			return;
		}
		if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
			dom.removeAttribute(attrName);
		} else {
			if (attrName[5] === ':' && attrName.indexOf('xlink:') !== -1) {
				dom.setAttributeNS('http://www.w3.org/1999/xlink', attrName, nextAttrValue === true ? attrName : nextAttrValue);
			} else if (attrName[4] === ':' && attrName.indexOf('xml:') !== -1) {
				dom.setAttributeNS('http://www.w3.org/XML/1998/namespace', attrName, nextAttrValue === true ? attrName : nextAttrValue);
			} else {
				dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
			}
		}
	}
}

export function patchComponent(lastNode, Component, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
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
			diffNodes(lastNode, nextNode, parentDom, null, lifecycle, context, instance, true);
			lastNode.dom = nextNode.dom;
			instance._lastNode = nextNode;
		}
	} else {
		let shouldUpdate = true;
		const nextHooksDefined = !isNullOrUndefined(nextHooks);

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

			diffNodes(instance, nextNode, dom, null, lifecycle, context, null, true);
			lastNode.instance = nextNode;
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
				nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, namespace, lifecycle, context, instance, domChildrenIndex) {
	const isVirtualFragment = !isNullOrUndefined(dom.append);
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
				const domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);

				insertOrAppend(dom, domNode);
				if (!isVirtualFragment) {
					if (lastChildrenLength === 1) {
						domChildren.push(dom.firstChild);
					}
					!isVirtualFragment && domChildren.splice(lastChildrenLength + domChildrenIndex, 0, domNode);
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
								insertOrAppend(dom, textNode);
								!isVirtualFragment && domChildren.splice(index, 0, textNode);
							} else {
								dom.replaceChild(textNode, domChildren[index]);
								!isVirtualFragment && domChildren.splice(index, 1, textNode);
								detachNode(lastChild, recyclingEnabled && !isNullOrUndefined(lastChild.tpl));
							}
						}
					}
				}
			} else {
				if (isInvalidNode(lastChild)) {
					if (isStringOrNumber(nextChild)) {
						const textNode = document.createTextNode(nextChild);
						dom.replaceChild(textNode, domChildren[index]);
						!isVirtualFragment && domChildren.splice(index, 1, textNode);
					} else if (sameLength === true) {
						const domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);
						dom.replaceChild(domNode, domChildren[index]);
						!isVirtualFragment && domChildren.splice(index, 1, domNode);
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
							detachNode(lastChild, recyclingEnabled && !isNullOrUndefined(lastChild.tpl));
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
								!isVirtualFragment && domChildren.splice(index, 1, textNode);
								dom.replaceChild(textNode, child);
							} else { // If previous child is virtual fragment remove all its content and replace with textNode
								dom.insertBefore(textNode, child.firstChild);
								child.remove();
								domChildren.splice(0, domChildren.length, textNode);
							}
						}
						detachNode(lastChild, recyclingEnabled && !isNullOrUndefined(lastChild.tpl));
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
									!isVirtualFragment && domChildren.splice(index, 1, virtualFragment);
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
								insertOrAppend(dom, virtualFragment, dom.firstChild);
								!isVirtualFragment && domChildren.splice(index, 1, virtualFragment);
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

export function patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance) {
	let nextChildrenLength = nextChildren.length;
	let lastChildrenLength = lastChildren.length;
	if (nextChildrenLength === 0 && lastChildrenLength >= 5) {
		if (recyclingEnabled) {
			for (let i = 0; i < lastChildrenLength; i++) {
				pool(lastChildren[i]);
			}
		}
		// TODO can we improve the removal all nodes vs textContent = ''?
		dom.textContent = '';
		return;
	}
	let oldItem;
	let stop = false;
	let startIndex = 0;
	let oldStartIndex = 0;
	let endIndex = nextChildrenLength - 1;
	let oldEndIndex = lastChildrenLength - 1;
	let oldStartItem = (lastChildrenLength > 0) ? lastChildren[oldStartIndex] : null;
	let startItem = (nextChildrenLength > 0) ? nextChildren[startIndex] : null;
	let endItem;
	let oldEndItem;
	let nextNode;

	// TODO don't read key too often
	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
		stop = true;
		while (startItem.key === oldStartItem.key) {
			diffNodes(oldStartItem, startItem, dom, namespace, lifecycle, context, instance, true);
			startIndex++;
			oldStartIndex++;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				startItem = nextChildren[startIndex];
				oldStartItem = lastChildren[oldStartIndex];
				stop = false;
			}
		}
		endItem = nextChildren[endIndex];
		oldEndItem = lastChildren[oldEndIndex];
		while (endItem.key === oldEndItem.key) {
			diffNodes(oldEndItem, endItem, dom, namespace, lifecycle, context, instance, true);
			endIndex--;
			oldEndIndex--;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				endItem = nextChildren[endIndex];
				oldEndItem = lastChildren[oldEndIndex];
				stop = false;
			}
		}
		while (endItem.key === oldStartItem.key) {
			nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1].dom : null;
			diffNodes(oldStartItem, endItem, dom, namespace, lifecycle, context, instance, true);
			insertOrAppend(dom, endItem.dom, nextNode);
			endIndex--;
			oldStartIndex++;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				endItem = nextChildren[endIndex];
				oldStartItem = lastChildren[oldStartIndex];
				stop = false;
			}
		}
		while (startItem.key === oldEndItem.key) {
			nextNode = lastChildren[oldStartIndex].dom;
			diffNodes(oldEndItem, startItem, dom, namespace, lifecycle, context, instance, true);
			insertOrAppend(dom, startItem.dom, nextNode);
			startIndex++;
			oldEndIndex--;
			if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
				break outer;
			} else {
				startItem = nextChildren[startIndex];
				oldEndItem = lastChildren[oldEndIndex];
				stop = false;
			}
		}
	}

	if (oldStartIndex > oldEndIndex) {
		if (startIndex <= endIndex) {
			nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1].dom : null;
			for (; startIndex <= endIndex; startIndex++) {
				insertOrAppend(dom, mountNode(nextChildren[startIndex], null, namespace, lifecycle, context, instance), nextNode);
			}
		}
	} else if (startIndex > endIndex) {
		for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
			oldItem = lastChildren[oldStartIndex];
			remove(oldItem, dom);
		}
	} else {
		const oldItemsMap = new Map();

		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			oldItemsMap.set(oldItem.key, oldItem);
		}
		nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1] : null;

		for (let i = endIndex; i >= startIndex; i--) {
			const item = nextChildren[i];
			const key = item.key;
			oldItem = oldItemsMap.get(key);
			nextNode = isNullOrUndefined(nextNode) ? undefined : nextNode.dom; // Default to undefined instead null, because nextSibling in DOM is null
			if (oldItem === undefined) {
				insertOrAppend(dom, mountNode(item, null, namespace, lifecycle, context, instance), nextNode);
			} else {
				oldItemsMap.delete(key);
				diffNodes(oldItem, item, dom, namespace, lifecycle, context, instance, true);

				if (item.dom.nextSibling !== nextNode) {
					insertOrAppend(dom, item.dom, nextNode);
				}
			}
			nextNode = item;
		}
		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			if (oldItemsMap.has(oldItem.key)) {
				remove(oldItem, dom);
			}
		}
	}
}
