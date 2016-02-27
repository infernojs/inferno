import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent, isInvalidNode } from '../core/utils';
import { replaceNode, SVGNamespace, MathNamespace } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent, patchStyle } from './patching';
import { mountChildren, mountNode } from './mounting';

export function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, staticCheck) {
	if (nextNode === false || nextNode === null) {
		return;
	}
	if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context);
		}
		return;
	}
	const nextTag = nextNode.tag || (staticCheck && nextNode.tpl ? nextNode.tpl.tag : null);
	const lastTag = lastNode.tag || (staticCheck && lastNode.tpl ? lastNode.tpl.tag : null);
	const nextEvents = nextNode.events;

	if (nextEvents && nextEvents.willUpdate) {
		nextEvents.willUpdate(lastNode.dom);
	}
	namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;
	if (lastTag !== nextTag) {
		if (isFunction(lastTag) && !isFunction(nextTag)) {
			if (isStatefulComponent(lastTag)) {
				diffNodes(lastNode.instance._lastNode, nextNode, parentDom, namespace, lifecycle, context, true);
			} else {
				diffNodes(lastNode.instance, nextNode, parentDom, namespace, lifecycle, context, true);
			}
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context);
		}
		return;
	} else if (isNullOrUndefined(lastTag)) {
		nextNode.dom = lastNode.dom;
		return;
	}
	if (isFunction(lastTag) && isFunction(nextTag)) {
		nextNode.instance = lastNode.instance;
		nextNode.dom = lastNode.dom;
		patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.events, nextNode.children, parentDom, lifecycle, context);
		return;
	}
	const dom = lastNode.dom;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck);
	const nextClassName = nextNode.className;
	const nextStyle = nextNode.style;

	if (lastNode.className !== nextClassName) {
		if (isNullOrUndefined(nextClassName)) {
			dom.removeAttribute('class');
		} else {
			dom.className = nextClassName;
		}
	}
	if (lastNode.style !== nextStyle) {
		patchStyle(lastNode.style, nextStyle, dom);
	}
	diffAttributes(lastNode, nextNode, dom);
	diffEvents(lastNode, nextNode, dom);
	if (nextEvents && nextEvents.didUpdate) {
		nextEvents.didUpdate(dom);
	}
}

function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck) {
	const nextChildren = nextNode.children;
	const lastChildren = lastNode.children;

	if (lastChildren !== nextChildren) {
		if (!isInvalidNode(lastChildren)) {
			if (!isInvalidNode(nextChildren)) {
				if (isArray(lastChildren)) {
					if (isArray(nextChildren)) {
						const isKeyed = nextChildren.length && nextChildren[0] && !isNullOrUndefined(nextChildren[0].key)
							|| lastChildren.length && lastChildren[0] && !isNullOrUndefined(lastChildren[0].key);

						if (!isKeyed) {
							patchNonKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, null);
						} else {
							patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, null);
						}
					} else {
						patchNonKeyedChildren(lastChildren, [nextChildren], dom, namespace, lifecycle, context, null);
					}
				} else {
					if (isArray(nextChildren)) {
						patchNonKeyedChildren([lastChildren], nextChildren, dom, namespace, lifecycle, context, null);
					} else {
						diffNodes(lastChildren, nextChildren, dom, namespace, lifecycle, context, staticCheck);
					}
				}
			} else {
				dom.textContent = '';
			}
		} else {
			if (isStringOrNumber(nextChildren)) {
				dom.textContent = nextChildren;
			} else if (nextChildren && isArray(nextChildren)) {
				mountChildren(nextChildren, dom, namespace, lifecycle, context);
			} else if (nextChildren && typeof nextChildren === 'object') {
				mountNode(nextChildren, dom, namespace, lifecycle, context);
			}
		}
	}
}

function diffAttributes(lastNode, nextNode, dom) {
	const nextAttrs = nextNode.attrs;
	const lastAttrs = lastNode.attrs;

	if (nextAttrs) {
		const nextAttrsKeys = Object.keys(nextAttrs);

		if (nextAttrsKeys.length !== 0) {
			for (let i = 0; i < nextAttrsKeys.length; i++) {
				const attr = nextAttrsKeys[i];
				const lastAttrVal = lastAttrs && lastAttrs[attr];
				const nextAttrVal = nextAttrs[attr];

				if (lastAttrVal !== nextAttrVal) {
					patchAttribute(attr, lastAttrVal, nextAttrVal, dom, lastNode.tag === null);
				}
			}
		}
	}
	if (lastAttrs) {
		const lastAttrsKeys = Object.keys(lastAttrs);

		if (lastAttrsKeys.length !== 0) {
			for (let i = 0; i < lastAttrsKeys.length; i++) {
				const attr = lastAttrsKeys[i];

				if (!nextAttrs || isNullOrUndefined(nextAttrs[attr])) {
					dom.removeAttribute(attr);
				}
			}
		}
	}
}

function diffEvents(lastNode, nextNode, dom) {

}
