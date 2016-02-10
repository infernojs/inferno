import { isNullOrUndefined, isAttrAnEvent } from '../core/utils';
import { diffNodes } from './diffing';

export function patchNode(lastNode, nextNode, parentDom, lifecycle, context) {
	if (isNullOrUndefined(lastNode)) {
		mountNode(nextNode, parentDom, lifecycle);
		return;
	}
	if (isNullOrUndefined(nextNode)) {
		remove(lastNode, parentDom);
		return;
	}
	if (lastNode.static !== nextNode.static) {
		diffNodes(lastNode, nextNode, parentDom, lifecycle, context, true);
		return;
	}
	diffNodes(lastNode, nextNode, parentDom, lifecycle, context, false);
}

export function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	if (lastAttrValue !== nextAttrValue) {
		if (attrName === 'className') {
			dom.className = nextAttrValue;
		} else if (attrName === 'style') {
			if(typeof nextAttrValue === 'string') {
				dom.style.cssText = nextAttrValue;
			} else {
				for (var style in nextAttrValue) {
					var styleVal = nextAttrValue[style];
					dom.style[style] = styleVal;
				}
			}
		} else {
			if (!isAttrAnEvent(attrName)) {
				if (nextAttrValue === false || nextAttrValue == null) {
					dom.removeAttribute(attrName);
				} else if (nextAttrValue === true) {
					dom.setAttribute(attrName, attrName);
				} else {
					dom.setAttribute(attrName, nextAttrValue);
				}
			}
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, nextDom) {
	var lastChildrenLength = lastChildren.length;
	var nextChildrenLength = nextChildren.length;
	var counter = 0;
	var lastDomNode;

	if (lastChildrenLength > nextChildrenLength) {
		while (lastChildrenLength !== nextChildrenLength) {
			var lastChild = lastChildren[lastChildrenLength - 1];
			dom.removeChild((lastDomNode = lastChild.dom)
				|| (lastDomNode && (lastDomNode = lastDomNode.previousSibling))
				|| (lastDomNode = dom.lastChild)
			);
			lastChildrenLength--;
		}
	} else if (lastChildrenLength < nextChildrenLength) {
		while (lastChildrenLength !== nextChildrenLength) {
			var nextChild = nextChildren[lastChildrenLength + counter];
			var node = mountNode(nextChild, null, lifecycle, context);
			dom.appendChild(node);
			nextChildrenLength--;
			counter++;
		}
	}
	for (var i = 0; i < nextChildrenLength; i++) {
		var lastChild = lastChildren[i];
		var nextChild = nextChildren[i];

		if (lastChild !== nextChild) {
			patchNode(lastChild, nextChild, dom, lifecycle, context);
		}
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, nextDom) {
	var stop = false;
	var startIndex = 0;
	var oldStartIndex = 0;
	var nextChildrenLength = nextChildren.length;
	var lastChildrenLength = lastChildren.length;
	var item;
	var oldItem;

	if (nextChildrenLength === 0 && lastChildrenLength >= 5) {
		if (recyclingEnabled) {
			for (var i = 0; i < lastChildrenLength; i++) {
				pool(lastChildren[i]);
			}
		}
		dom.textContent = '';
		return;
	}

	var endIndex = nextChildrenLength - 1;
	var oldEndIndex = lastChildrenLength - 1;
	var oldStartItem = (lastChildrenLength > 0) ? lastChildren[oldStartIndex] : null;
	var startItem = (nextChildrenLength > 0) ? nextChildren[startIndex] : null;
	var endItem;
	var oldEndItem;
	var nextNode;

	// TODO don't read key too often
	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
		stop = true;
		while (startItem.key === oldStartItem.key) {
			diffNodes(oldStartItem, startItem, dom, lifecycle, context, true);
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
			diffNodes(oldEndItem, endItem, dom, lifecycle, context, true);
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
			diffNodes(oldStartItem, endItem, dom, lifecycle, context, true);
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
			diffNodes(oldEndItem, startItem, dom, lifecycle, context, true);
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
				insertOrAppend(dom, mountNode(item, null, lifecycle, context), nextNode);
			}
		}
	} else if (startIndex > endIndex) {
		for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
			oldItem = lastChildren[oldStartIndex];
			remove(oldItem, dom);
		}
	} else {
		var oldItemsMap = {};

		for (var i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			oldItemsMap[oldItem.key] = oldItem;
		}
		var nextNode = (endIndex + 1 < nextChildrenLength) ? nextChildren[endIndex + 1] : null;

		for (var i = endIndex; i >= startIndex; i--) {
			item = nextChildren[i];
			var key = item.key;
			oldItem = oldItemsMap[key];
			if (oldItem !== undefined) {
				oldItemsMap[key] = null;
				diffNodes(oldItem, item, dom, lifecycle, true);

				if (item.dom.nextSibling !== nextNode) {
					nextNode = (nextNode && nextNode.dom) || nextDom;
					insertOrAppend(dom, item.dom, nextNode);
				}
				nextNode = item;
			} else {
				nextNode = (nextNode && nextNode.dom) || nextDom;
				insertOrAppend(dom, mountNode(item, null, lifecycle, context), nextNode);
			}
			nextNode = item;
		}
		for (var i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			if (oldItemsMap[oldItem.key] !== null) {
				remove(oldItem, dom);
			}
		}
	}
}