import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent, isInvalidNode, isString } from '../core/utils';
import { replaceNode, SVGNamespace, MathNamespace, isKeyed, selectValue, removeEvents } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent, patchStyle, updateTextNode, patchNode, patchEvents } from './patching';
import { mountChildren, mountNode, mountEvents } from './mounting';

function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, staticCheck) {
	const nextChildren = nextNode.children;
	const lastChildren = lastNode.children;

	if (lastChildren === nextChildren) {
		return;
	}

	let domChildren = null;

	if (lastNode.domChildren) {
		domChildren = nextNode.domChildren = lastNode.domChildren;
	}
	if (isInvalidNode(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			updateTextNode(dom, lastChildren, nextChildren);
		} else if (!isNullOrUndefined(nextChildren)) {
			if (typeof nextChildren === 'object') {
				if (isArray(nextChildren)) {
					mountChildren(nextNode, nextChildren, dom, namespace, lifecycle, context, instance);
				} else {
					mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
				}
			}
		}
	} else {
		if (isInvalidNode(nextChildren)) {
			dom.textContent = '';
		} else {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					if (domChildren === null && lastChildren.length > 1) {
						patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
					} else {
						if (isKeyed(lastChildren, nextChildren)) {
							patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
						} else {
							patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren || (nextNode.domChildren = []), namespace, lifecycle, context, instance, 0);
						}
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, domChildren || [], namespace, lifecycle, context, instance, 0);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, domChildren || (nextNode.domChildren = [dom.firstChild]), namespace, lifecycle, context, instance, 0);
				} else if (isStringOrNumber(nextChildren)) {
					updateTextNode(dom, lastChildren, nextChildren);
				} else if (isStringOrNumber(lastChildren)) {
					patchNode(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance, null);
				} else {
					patchNode(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance, staticCheck);
				}
			}
		}
	}
}


function diffRef(instance, lastValue, nextValue, dom) {
	if (instance) {
		if (isString(lastValue)) {
			delete instance.refs[lastValue];
		}
		if (isString(nextValue)) {
			instance.refs[nextValue] = dom;
		}
	}
}

export function diffEvents(lastNode, nextNode, dom) {
	const nextEvents = nextNode.events;
	const lastEvents = lastNode.events;
	const nextEventsDefined = !isNullOrUndefined(nextEvents);
	const lastEventsDefined = !isNullOrUndefined(lastEvents);

	if (nextEventsDefined) {
		if (lastEventsDefined) {
			patchEvents(lastEvents, nextEvents, dom);
		} else {
			mountEvents(nextEvents, dom);
		}
	} else if (lastEventsDefined) {
		removeEvents(lastEvents, dom);
	}
}

function diffAttributes(lastNode, nextNode, dom, instance) {
	if (lastNode.tag === 'select') {
		selectValue(nextNode);
	}
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
					patchAttribute(attr, nextAttrVal, dom);
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

export function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, staticCheck) {
	if (nextNode.then !== undefined) {
		nextNode.then(node => {
			diffNodes(lastNode, node, parentDom, namespace, lifecycle, context, staticCheck, instance);
		});
	} else {
		const nextHooks = nextNode.hooks;
		const nextHooksDefined = !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastNode.dom);
		}
		const nextTag = nextNode.tag || ((staticCheck && !isNullOrUndefined(nextNode.tpl)) ? nextNode.tpl.tag : null);
		const lastTag = lastNode.tag || ((staticCheck && !isNullOrUndefined(lastNode.tpl)) ? lastNode.tpl.tag : null);

		namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;

		if (lastTag !== nextTag) {
			const lastNodeInstance = lastNode.instance;

			if (isFunction(lastTag)) {
				if (isFunction(nextTag)) {
					replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
				} else if (isStatefulComponent(lastTag)) {
					diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, true);
				} else {
					diffNodes(lastNodeInstance, nextNode, parentDom, namespace, lifecycle, context, instance, true);
				}
			} else {
				replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
			}
		} else if (isNullOrUndefined(lastTag)) {
			nextNode.dom = lastNode.dom;
		} else {
			if (isFunction(lastTag)) {
				// Firefox doesn't like && too much
				if (isFunction(nextTag)) {
					nextNode.instance = lastNode.instance;
					nextNode.dom = lastNode.dom;
					patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
				}
			} else {
				const dom = lastNode.dom;
				const nextClassName = nextNode.className;
				const nextStyle = nextNode.style;

				nextNode.dom = dom;

				if (lastNode !== nextNode) {
					diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, staticCheck);
					diffAttributes(lastNode, nextNode, dom, instance);
					diffEvents(lastNode, nextNode, dom);
				}

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
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.didUpdate)) {
					nextHooks.didUpdate(dom);
				}
			}
		}
	}
}
