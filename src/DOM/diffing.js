import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent, isInvalidNode } from '../core/utils';
import { replaceNode, SVGNamespace, MathNamespace } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent, patchStyle } from './patching';
import { mountChildren, mountNode } from './mounting';

function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck, instance) {
	const nextChildren = nextNode.children;
	const lastChildren = lastNode.children;

	if (lastChildren === nextChildren) {
		return;
	}

	if (!isInvalidNode(lastChildren)) {
		if (!isInvalidNode(nextChildren)) {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					const isKeyed = nextChildren.length && !isNullOrUndefined(nextChildren[0]) && !isNullOrUndefined(nextChildren[0].key)
						|| lastChildren.length && !isNullOrUndefined(lastChildren[0]) && !isNullOrUndefined(lastChildren[0].key);

					if (isKeyed) {
						patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
					} else {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, null, instance);
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, namespace, lifecycle, context, null, instance);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, namespace, lifecycle, context, null, instance);
				} else if (isStringOrNumber(nextChildren)) {
					dom.textContent = nextChildren;
				} else {
					diffNodes(lastChildren, nextChildren, dom, namespace, lifecycle, context, staticCheck, instance);
				}
			}
		} else {
			// Remove node, do not use textContent to set to empty node!! See jsPerf for this
			dom.textContent = '';
		}
	} else {
		if (isStringOrNumber(nextChildren)) {
			dom.textContent = nextChildren;
		} else if (!isNullOrUndefined(nextChildren)) {
			if (typeof nextChildren === 'object') {
				if (isArray(nextChildren)) {
					mountChildren(nextChildren, dom, namespace, lifecycle, context, instance);
				} else {
					mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
				}
			}
		}
	}
}

function diffRef(instance, lastValue, nextValue, dom) {
	if (!isNullOrUndefined(instance)) {
		if (isString(lastValue)) {
			delete instance.refs[lastValue];
		}
		if (isString(nextValue)) {
			instance.refs[nextValue] = dom;
		}
	}
}

function diffAttributes(lastNode, nextNode, dom, instance) {
	const nextAttrs = nextNode.attrs;
	const lastAttrs = lastNode.attrs;
	const nextAttrsIsUndef = isNullOrUndefined(nextAttrs);
	const lastAttrsIsUndef = isNullOrUndefined(lastAttrs);

	if (!nextAttrsIsUndef) {
		const nextAttrsKeys = Object.keys(nextAttrs);
		const attrKeysLength = nextAttrsKeys.length;

		for (let i = 0; i < attrKeysLength; i++) {
			const attr = nextAttrsKeys[i];
			const lastAttrVal = !lastAttrsIsUndef && lastAttrs[attr];
			const nextAttrVal = nextAttrs[attr];

			if (lastAttrVal !== nextAttrVal) {
				if (attr === 'ref') {
					diffRef(instance, lastAttrVal, nextAttrVal, dom);
				} else {
					patchAttribute(attr, nextAttrVal, dom, lastNode.tag === null);
				}
			}
		}
	}
	if (!lastAttrsIsUndef) {
		const lastAttrsKeys = Object.keys(lastAttrs);
		const attrKeysLength = lastAttrsKeys.length;

		for (let i = 0; i < attrKeysLength; i++) {
			const attr = lastAttrsKeys[i];

			if (nextAttrsIsUndef || isNullOrUndefined(nextAttrs[attr])) {
				if (attr === 'ref') {
					diffRef(instance, lastAttrs[attr], null, dom);
				} else {
					dom.removeAttribute(attr);
				}
			}
		}
	}
}

function diffEvents(lastNode, nextNode, dom) {
	const lastEvents = lastNode.events;

	if (!isNullOrUndefined(lastEvents)) {
		const nextEvents = nextNode.events;
		if (!isNullOrUndefined(nextEvents)) {
			const lastEventsKeys = Object.keys(lastEvents);
			const nextEventsKeys = Object.keys(nextEvents);

			for (let i = 0; i < lastEventsKeys.length; i++) {
				const event = lastEventsKeys[i];

				if (!nextEvents[event]) {
					// remove event
				}
			}
		}
	}
}

export function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, staticCheck, instance) {
	if (nextNode === false || nextNode === null) {
		return;
	}
	if (!isNullOrUndefined(nextNode.then)) {
		nextNode.then(node => {
			diffNodes(lastNode, node, parentDom, namespace, lifecycle, context, staticCheck, instance);
		});
		return;
	}
	if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
		}
		return;
	}
	const nextHooks = nextNode.hooks;
	if (!isNullOrUndefined(nextHooks) && !isNullOrUndefined(nextHooks.willUpdate)) {
		nextHooks.willUpdate(lastNode.dom);
	}
	const nextTag = nextNode.tag || (staticCheck && !isNullOrUndefined(nextNode.tpl) ? nextNode.tpl.tag : null);
	const lastTag = lastNode.tag || (staticCheck && !isNullOrUndefined(lastNode.tpl) ? lastNode.tpl.tag : null);

	namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;
	if (lastTag !== nextTag) {
		if (isFunction(lastTag) && !isFunction(nextTag)) {
			if (isStatefulComponent(lastTag)) {
				diffNodes(lastNode.instance._lastNode, nextNode, parentDom, namespace, lifecycle, context, true, instance);
			} else {
				diffNodes(lastNode.instance, nextNode, parentDom, namespace, lifecycle, context, true, instance);
			}
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
		}
		return;
	} else if (isNullOrUndefined(lastTag)) {
		nextNode.dom = lastNode.dom;
		return;
	}
	if (isFunction(lastTag) && isFunction(nextTag)) {
		nextNode.instance = lastNode.instance;
		nextNode.dom = lastNode.dom;
		patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
		return;
	}
	const dom = lastNode.dom;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck, instance);
	const nextClassName = nextNode.className;
	const nextStyle = nextNode.style;

	if (lastNode.className !== nextClassName) {
		if (isNullOrUndefined(nextClassName)) {
			dom.removeAttribute('class');
		} else {
			dom.className = nextClassName;
		}
	}
	// TODO Should check for null & undefined BEFORE calling this function?
	if (lastNode.style !== nextStyle) {
		patchStyle(lastNode.style, nextStyle, dom);
	}
	diffAttributes(lastNode, nextNode, dom, instance);
	diffEvents(lastNode, nextNode, dom);
	if (!isNullOrUndefined(nextHooks) && !isNullOrUndefined(nextHooks.didUpdate)) {
		nextHooks.didUpdate(dom);
	}
}
