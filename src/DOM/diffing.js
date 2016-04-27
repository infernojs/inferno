import { isArray, isStringOrNumber, isNullOrUndefined, isInvalidNode, isString } from './../core/utils';
import { isKeyed, selectValue, removeEvents, removeAllChildren } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, updateTextNode, patch, patchEvents } from './patching';
import { mountArrayChildren, mount, mountEvents } from './mounting';

export function diffChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG) {
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
			if (isArray(nextChildren)) {
				mountArrayChildren(nextNode, nextChildren, dom, lifecycle, context, instance, isSVG);
			} else {
				mount(nextChildren, dom, lifecycle, context, instance, isSVG);
			}
		}
	} else {
		if (isInvalidNode(nextChildren)) {
			removeAllChildren(dom, lastChildren);
		} else {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					if (domChildren === null && lastChildren.length > 1) {
						patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
					} else {
						if (isKeyed(nextChildren)) {
							patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
						} else {
							patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren || (nextNode.domChildren = []), lifecycle, context, instance, 0, isSVG);
						}
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, domChildren || [], lifecycle, context, instance, 0);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, domChildren || (nextNode.domChildren = [dom.firstChild]), lifecycle, context, instance, 0, isSVG);
				} else if (isStringOrNumber(nextChildren)) {
					updateTextNode(dom, lastChildren, nextChildren);
				} else if (isStringOrNumber(lastChildren)) {
					patch(lastChildren, nextChildren, dom, lifecycle, context, instance, null, isSVG);
				} else {
					patch(lastChildren, nextChildren, dom, lifecycle, context, instance, true, isSVG);
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

export function diffEvents(lastNode, nextNode, lastEventKeys, nextEventKeys, dom) {
	const nextEvents = nextNode.events;
	const lastEvents = lastNode.events;
	const nextEventsDefined = !isNullOrUndefined(nextEvents);
	const lastEventsDefined = !isNullOrUndefined(lastEvents);

	if (nextEventsDefined) {
		if (lastEventsDefined) {
			patchEvents(lastEvents, nextEvents, lastEventKeys, nextEventKeys, dom);
		} else {
			mountEvents(nextEvents, nextEventKeys, dom);
		}
	} else if (lastEventsDefined) {
		removeEvents(lastEvents, lastEventKeys, dom);
	}
}

export function diffAttributes(lastNode, nextNode, lastAttrKeys, nextAttrKeys, dom, instance) {
	if (lastNode.tag === 'select') {
		selectValue(nextNode);
	}
	const nextAttrs = nextNode.attrs;
	const lastAttrs = lastNode.attrs;
	const nextAttrsIsUndef = isNullOrUndefined(nextAttrs);
	const lastAttrsIsNotUndef = !isNullOrUndefined(lastAttrs);

	if (!nextAttrsIsUndef) {
		const nextAttrsKeys = nextAttrKeys || Object.keys(nextAttrs);
		const attrKeysLength = nextAttrsKeys.length;

		for (let i = 0; i < attrKeysLength; i++) {
			const attr = nextAttrsKeys[i];
			const lastAttrVal = lastAttrsIsNotUndef && lastAttrs[attr];
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
	if (lastAttrsIsNotUndef) {
		const lastAttrsKeys = lastAttrKeys || Object.keys(lastAttrs);
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