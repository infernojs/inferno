import { isArray, isStringOrNumber, isFunction, isNullOrUndefined } from '../core/utils';
import { replaceNode } from './utils';
import { patchNonKeyedChildren, patchAttribute } from './patching';

export function diffNodes(lastNode, nextNode, parentDom, lifecycle, context, staticCheck) {
	if (nextNode === false || nextNode === null) {
		return;
	}
	if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		}
		return;
	}
	var nextTag = nextNode.tag || (staticCheck ? nextNode.static.tag : null);
	var lastTag = lastNode.tag || (staticCheck ? lastNode.static.tag : null);

	if (lastNode.events && lastNode.events.willUpdate) {
		lastNode.events.willUpdate(lastNode.dom);
	}

	if (lastTag !== nextTag) {
		if (isFunction(lastTag) && !isFunction(nextTag)) {
			if (isStatefulComponent(lastTag)) {
				diffNodes(lastNode.instance._lastNode, nextNode, parentDom, lifecycle, context, true);
			} else {
				diffNodes(lastNode.instance, nextNode, parentDom, lifecycle, context, true);
			}
		} else {
			replaceNode(lastNode, nextNode, parentDom, lifecycle, context);
		}
		return;
	}
	if (isFunction(lastTag) && isFunction(nextTag)) {
		nextNode.instance = lastNode.instance;
		nextNode.dom = lastNode.dom;
		updateComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs, nextNode.attrs, nextNode.events, nextNode.children, parentDom, lifecycle, context);
		return;
	}
	var dom = lastNode.dom;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck);
	diffAttributes(lastNode, nextNode, dom);
	diffEvents(lastNode, nextNode, dom);

	if (nextNode.events && nextNode.events.didUpdate) {
		nextNode.events.didUpdate(dom);
	}
}

function diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck) {
	var nextChildren = nextNode.children;
	var lastChildren = lastNode.children;

	if (lastChildren !== nextChildren) {
		if (!isNullOrUndefined(lastChildren) && !isNullOrUndefined(nextChildren)) {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					var isKeyed = nextChildren.length && !isNullOrUndefined(nextChildren[0].key)
						|| lastChildren.length && !isNullOrUndefined(lastChildren[0].key);

					if (!isKeyed) {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, null);
					} else {
						patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, null);
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, lifecycle, context, null);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, lifecycle, context, null);
				} else if (isStringOrNumber(lastChildren)) {
					if (isStringOrNumber(nextChildren)) {
						dom.firstChild.nodeValue = nextChildren;
					}
				} else {
					diffNodes(lastChildren, nextChildren, dom, lifecycle, context, true);
				}
			}
		}
	}
}

function diffAttributes(lastNode, nextNode, dom) {
	var nextAttrs = nextNode.attrs;
	var lastAttrs = lastNode.attrs;

	if (nextAttrs) {
		for (var i = 0; i < nextAttrs.length; i++) {
			var lastAttr = lastAttrs[i];
			var nextAttr = nextAttrs[i];
			var lastAttrName = lastAttr && lastAttr.name;
			var nextAttrName = nextAttr && nextAttr.name;
			var lastAttrVal = lastAttr && lastAttr.value;
			var nextAttrVal = nextAttr && nextAttr.value;

			if (lastAttrName && lastAttrName === nextAttrName) {
				patchAttribute(lastAttrName, lastAttrVal, nextAttrVal, dom);
			}
		}
	}
}

function diffEvents(lastNode, nextNode, dom) {

}