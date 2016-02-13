import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent } from '../core/utils';
import { replaceNode } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent } from './patching';
import { mountChildren } from './mounting';

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
		patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs, nextNode.attrs, nextNode.events, nextNode.children, parentDom, lifecycle, context);
		return;
	}
	const dom = lastNode.dom;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck);
	if (lastNode.className !== nextNode.className) {
		dom.className = nextNode.className;
	}
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
		if (!isNullOrUndefined(lastChildren)) {
			if (!isNullOrUndefined(nextChildren)) {
				if (isArray(lastChildren)) {
					if (isArray(nextChildren)) {
						const isKeyed = nextChildren.length && nextChildren[0] && !isNullOrUndefined(nextChildren[0].key)
							&& lastChildren.length && lastChildren[0] && !isNullOrUndefined(lastChildren[0].key);

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
						diffNodes(lastChildren, nextChildren, dom, lifecycle, context, staticCheck);
					}
				}
			} else {
				dom.textContent = '';
			}
		} else {
			if (isStringOrNumber(nextChildren)) {
				dom.textContent = nextChildren;
			} else if (nextChildren && isArray(nextChildren)) {
				mountChildren(nextChildren, dom, lifecycle, context);
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