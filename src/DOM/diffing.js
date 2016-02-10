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
	const nextTag = nextNode.tag || (staticCheck ? nextNode.static.tag : null);
	const lastTag = lastNode.tag || (staticCheck ? lastNode.static.tag : null);

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
	const dom = lastNode.dom;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck);
	diffAttributes(lastNode, nextNode, dom);
	diffEvents(lastNode, nextNode, dom);

	if (nextNode.events && nextNode.events.didUpdate) {
		nextNode.events.didUpdate(dom);
	}
}

function diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck) {
	const nextChildren = nextNode.children;
	const lastChildren = lastNode.children;

	if (lastChildren !== nextChildren) {
		if (!isNullOrUndefined(lastChildren) && !isNullOrUndefined(nextChildren)) {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					const isKeyed = nextChildren.length && !isNullOrUndefined(nextChildren[0].key)
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
	const nextAttrs = nextNode.attrs;
	const lastAttrs = lastNode.attrs;

	if (nextAttrs) {
		for (let i = 0; i < nextAttrs.length; i++) {
			const lastAttr = lastAttrs[i];
			const nextAttr = nextAttrs[i];
			const lastAttrName = lastAttr && lastAttr.name;
			const nextAttrName = nextAttr && nextAttr.name;
			const lastAttrVal = lastAttr && lastAttr.value;
			const nextAttrVal = nextAttr && nextAttr.value;

			if (lastAttrName && lastAttrName === nextAttrName) {
				patchAttribute(lastAttrName, lastAttrVal, nextAttrVal, dom);
			}
		}
	}
}

function diffEvents(lastNode, nextNode, dom) {

}