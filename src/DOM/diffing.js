import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent, isInvalidNode, isString, isPromise } from './../core/utils';
import { replaceNode, SVGNamespace, MathNamespace, isKeyed, selectValue, removeEvents, removeAllChildren, remove } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent, patchStyle, updateTextNode, patchNode, patchEvents } from './patching';
import { mountArrayChildren, mountNode, mountEvents } from './mounting';


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
			if (isArray(nextChildren)) {
				mountArrayChildren(nextNode, nextChildren, dom, namespace, lifecycle, context, instance);
			} else {
				mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
			}
		}
	} else {
		if (isInvalidNode(nextChildren)) {
			removeAllChildren(dom, lastChildren);
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

function diffAttributes(lastNode, nextNode, lastAttrKeys, nextAttrKeys, dom, instance) {
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

export function diffNodesWithTemplate(lastNode, nextNode, lastTpl, nextTpl, parentDom, namespace, lifecycle, context, instance, deepCheck) {
	let nextHooks;

	if (nextNode.hasHooks === true) {
		/* eslint no-cond-assign:0 */
		if (nextHooks = nextNode.hooks && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastNode.dom);
		}
	}
	const nextTag = nextNode.tag || (deepCheck && lastTpl.tag);
	const lastTag = lastNode.tag || (deepCheck && nextTpl.tag);

	if (lastTag !== nextTag) {
		if (lastNode.tpl.isComponent === true) {
			const lastNodeInstance = lastNode.instance;

			if (nextTpl.isComponent === true) {
				replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
			} else if (isStatefulComponent(lastTag)) {
				diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, true);
			} else {
				diffNodes(lastNodeInstance, nextNode, parentDom, namespace, lifecycle, context, instance, true);
			}
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
		}
	} else if (isNullOrUndefined(lastTag)) {
		nextNode.dom = lastNode.dom;
	} else {
		if (lastTpl.isComponent === true) {
			if (nextTpl.isComponent === true) {
				nextNode.instance = lastNode.instance;
				nextNode.dom = lastNode.dom;
				patchComponent(true, nextNode, nextNode.tag, lastTpl, nextTpl, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
			}
		} else {
			const dom = lastNode.dom;
			const lastChildrenType = lastTpl.childrenType;
			nextNode.dom = dom;

			if (lastChildrenType > 0) {
				const nextChildrenType = nextTpl.childrenType;
				const lastChildren = lastNode.children;
				const nextChildren = nextNode.children;

				if (isInvalidNode(lastChildren)) {
					if (nextChildrenType > 2) {
						mountArrayChildren(nextNode, nextChildren, dom, namespace, lifecycle, context, instance);
					} else {
						mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
					}
				} else if (isInvalidNode(nextChildren)) {
					if (lastChildrenType > 2) {
						removeAllChildren(dom, lastChildren);
					} else {
						remove(lastChildren, dom);
					}
				} else {
					if (lastChildren !== nextChildren) {
						if (lastChildrenType === 4 && nextChildrenType === 4) {
							patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
						} else if (lastChildrenType === 2 && nextChildrenType === 2) {
							patchNode(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance, deepCheck);
						} else if (lastChildrenType === 1 && nextChildrenType === 1) {
							updateTextNode(dom, lastChildren, nextChildren);
						} else {
							diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, deepCheck);
						}
					}
				}
			}
			if (lastTpl.hasAttrs === true) {
				diffAttributes(lastNode, nextNode, lastTpl.attrKeys, nextTpl.attrKeys, dom, instance);
			}
			if (lastTpl.hasEvents === true) {
				diffEvents(lastNode, nextNode, lastTpl.eventKeys, nextTpl.eventKeys, dom);
			}
			if (lastTpl.hasClassName === true) {
				const nextClassName = nextNode.className;

				if (lastNode.className !== nextClassName) {
					if (isNullOrUndefined(nextClassName)) {
						dom.removeAttribute('class');
					} else {
						dom.className = nextClassName;
					}
				}
			}
			if (lastTpl.hasStyle === true) {
				const nextStyle = nextNode.style;

				if (lastNode.style !== nextStyle) {
					patchStyle(lastNode.style, nextStyle, dom);
				}
			}
			if (nextNode.hasHooks === true && !isNullOrUndefined(nextHooks.didUpdate)) {
				nextHooks.didUpdate(dom);
			}
		}
	}
}


export function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, deepCheck) {
	if (isPromise(nextNode)) {
		nextNode.then(node => {
			diffNodes(lastNode, node, parentDom, namespace, lifecycle, context, deepCheck, instance);
		});
	} else {
		const nextHooks = nextNode.hooks;
		const nextHooksDefined = !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastNode.dom);
		}
		const nextTag = nextNode.tag || ((deepCheck && !isNullOrUndefined(nextNode.tpl)) ? nextNode.tpl.tag : null);
		const lastTag = lastNode.tag || ((deepCheck && !isNullOrUndefined(lastNode.tpl)) ? lastNode.tpl.tag : null);

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
				if (isFunction(nextTag)) {
					nextNode.instance = lastNode.instance;
					nextNode.dom = lastNode.dom;
					patchComponent(false, nextNode, nextNode.tag, null, null, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
				}
			} else {
				const dom = lastNode.dom;
				const nextClassName = nextNode.className;
				const nextStyle = nextNode.style;

				nextNode.dom = dom;

				diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, deepCheck);
				diffAttributes(lastNode, nextNode, null, null, dom, instance);
				diffEvents(lastNode, nextNode, null, null, dom);

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
