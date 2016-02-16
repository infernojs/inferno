import { isNullOrUndefined, isAttrAnEvent, isString, addChildrenToProps, isStatefulComponent, isStringOrNumber } from '../core/utils';
import { diffNodes } from './diffing';
import { mountNode } from './mounting';
import { insertOrAppend, remove } from './utils';
import { recyclingEnabled, pool } from './recycling';

export function patchNode(lastNode, nextNode, parentDom, namespace, lifecycle, context) {
	if (isNullOrUndefined(lastNode)) {
		mountNode(nextNode, parentDom, namespace, lifecycle);
		return;
	}
	if (isNullOrUndefined(nextNode)) {
		remove(lastNode, parentDom);
		return;
	}
	diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, lastNode.static !== null && nextNode.static !== null);
}

export function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	if (lastAttrValue !== nextAttrValue) {
		if (attrName === 'style') {
			if (isString(nextAttrValue)) {
				dom.style.cssText = nextAttrValue;
			} else {
				const styleKeys = Object.keys(nextAttrValue);

				for (let i = 0; i < styleKeys.length; i++) {
					const style = styleKeys[i];

					dom.style[style] = nextAttrValue[style];
				}
			}
		} else {
			if (!isAttrAnEvent(attrName)) {
				let ns = null;

				if (attrName[5] === ':' && attrName.indexOf('xlink:') !== -1) {
					ns = 'http://www.w3.org/1999/xlink';
				}
				if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
					dom.removeAttribute(attrName);
				} else {
					if (ns) {
						if (nextAttrValue === true) {
							dom.setAttributeNS(ns, attrName, attrName);
						} else {
							dom.setAttributeNS(ns, attrName, nextAttrValue);
						}
					} else {
						if (nextAttrValue === true) {
							dom.setAttribute(attrName, attrName);
						} else {
							dom.setAttribute(attrName, nextAttrValue);
						}
					}
				}
			}
		}
	}
}

export function patchComponent(lastNode, Component, instance, lastProps, nextProps, nextEvents, nextChildren, parentDom, lifecycle, context) {
	nextProps = addChildrenToProps(nextChildren, nextProps);

	if (isStatefulComponent(Component)) {
		const prevProps = instance.props;
		const prevState = instance.state;
		const nextState = instance.state;

		const childContext = instance.getChildContext();
		if (childContext) {
			context = { ...context, ...childContext };
		}
		instance.context = context;
		const nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

		if (nextNode) {
			diffNodes(lastNode, nextNode, parentDom, lifecycle, context, false);
			lastNode.dom = nextNode.dom;
			instance._lastNode = nextNode;
		}
	} else {
		let shouldUpdate = true;

		if (nextEvents && nextEvents.componentShouldUpdate) {
			shouldUpdate = nextEvents.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
		}
		if (shouldUpdate !== false) {
			if (nextEvents && nextEvents.componentWillUpdate) {
				nextEvents.componentWillUpdate(lastNode.dom, lastProps, nextProps);
			}
			const nextNode = Component(nextProps);
			const dom = lastNode.dom;
			nextNode.dom = dom;

			diffNodes(instance, nextNode, dom, lifecycle, context, false);
			lastNode.instance = nextNode;
			if (nextEvents && nextEvents.componentDidUpdate) {
				nextEvents.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, nextDom) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;

	if (lastChildrenLength > nextChildrenLength) {
		let lastDomNode;
		while (lastChildrenLength !== nextChildrenLength) {
			const lastChild = lastChildren[lastChildrenLength - 1];
				if(lastChild !== null) {
				dom.removeChild((lastDomNode = lastChild.dom)
					|| (lastDomNode && (lastDomNode = lastDomNode.previousSibling))
					|| (lastDomNode = dom.lastChild)
				);
			}

			lastChildrenLength--;
		}
	} else if (lastChildrenLength < nextChildrenLength) {
		let counter = 0;
		while (lastChildrenLength !== nextChildrenLength) {
			const nextChild = nextChildren[lastChildrenLength + counter];

			if(nextChild === null) {
				// TODO implement
			} else {
				const node = mountNode(nextChild, null, namespace, namespace, lifecycle, context);
				dom.appendChild(node);
			}
			nextChildrenLength--;
			counter++;
		}
	}
	for (let i = 0; i < nextChildrenLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = nextChildren[i];

		if (lastChild !== nextChild) {

			if(nextChild === null) {
				if(lastChild === null) {
					// TODO implement
				} else {
					// TODO implement remove child
				}
			} else {

				if(lastChild === null) {
					const node = mountNode(nextChild, null, namespace, namespace, lifecycle, context);
					dom.appendChild(node);
				} else {
					patchNode(lastChild, nextChild, dom, namespace, lifecycle, context);
				}
			}
		}
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, nextDom) {
	let stop = false;
	let startIndex = 0;
	let oldStartIndex = 0;
	let nextChildrenLength = nextChildren.length;
	let lastChildrenLength = lastChildren.length;
	let item;
	let oldItem;

	if (nextChildrenLength === 0 && lastChildrenLength >= 5) {
		if (recyclingEnabled) {
			for (let i = 0; i < lastChildrenLength; i++) {
				pool(lastChildren[i]);
			}
		}
		dom.textContent = '';
		return;
	}

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
			diffNodes(oldStartItem, startItem, dom, namespace, lifecycle, context, true);
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
			diffNodes(oldEndItem, endItem, dom, namespace, lifecycle, context, true);
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
			nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1].dom : nextDom;
			diffNodes(oldStartItem, endItem, dom, namespace, lifecycle, context, true);
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
			diffNodes(oldEndItem, startItem, dom, namespace, lifecycle, context, true);
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
			nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1].dom : nextDom;
			for (; startIndex <= endIndex; startIndex++) {
				item = nextChildren[startIndex];
				insertOrAppend(dom, mountNode(item, null, namespace, lifecycle, context), nextNode);
			}
		}
	} else if (startIndex > endIndex) {
		for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
			oldItem = lastChildren[oldStartIndex];
			remove(oldItem, dom);
		}
	} else {
		const oldItemsMap = {};

		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			oldItemsMap[oldItem.key] = oldItem;
		}
		let nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1] : null;

		for (let i = endIndex; i >= startIndex; i--) {
			item = nextChildren[i];
			const key = item.key;
			oldItem = oldItemsMap[key];
			if (oldItem !== undefined) {
				oldItemsMap[key] = null;
				diffNodes(oldItem, item, dom, namespace, lifecycle, true);

				if (item.dom.nextSibling !== nextNode) {
					nextNode = (nextNode && nextNode.dom) || nextDom;
					insertOrAppend(dom, item.dom, nextNode);
				}
				nextNode = item;
			} else {
				nextNode = (nextNode && nextNode.dom) || nextDom;
				insertOrAppend(dom, mountNode(item, null, namespace, lifecycle, context), nextNode);
			}
			nextNode = item;
		}
		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			if (oldItemsMap[oldItem.key] !== null) {
				remove(oldItem, dom);
			}
		}
	}
}