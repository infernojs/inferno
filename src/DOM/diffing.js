import { isArray, isStringOrNumber, isFunction, isNullOrUndefined, isStatefulComponent, isInvalidNode, isString, isPromise } from './../core/utils';
import { replaceWithNewNode, isKeyed, selectValue, removeEvents, removeAllChildren, remove, detachNode, replaceNode } from './utils';
import { patchNonKeyedChildren, patchKeyedChildren, patchAttribute, patchComponent, patchStyle, updateTextNode, patch, patchEvents } from './patching';
import { mountArrayChildren, mount, mountEvents, mountComponent } from './mounting';
import { setClipNode } from './lifecycle';

function setValueProperty(nextNode) {
	const value = nextNode.attrs.value;
	if (!isNullOrUndefined(value)) {
		nextNode.dom.value = value;
	}
}

function setFormElementProperties(nextTag, nextNode) {
	if (nextTag === 'input') {
		const inputType = nextNode.attrs.type;
		if (inputType === 'text') {
			setValueProperty(nextNode);
		} else if (inputType === 'checkbox' || inputType === 'radio') {
			const checked = nextNode.attrs.checked;
			nextNode.dom.checked = !!checked;
		}
	} else if (nextTag === 'textarea') {
		setValueProperty(nextNode);
	}
}

function diffChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG) {
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

export function diffNodesWithTemplate(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck) {
	let nextHooks;

	if (nextNode.hasHooks === true) {
		/* eslint no-cond-assign:0 */
		if (nextHooks = nextNode.hooks && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastNode.dom);
		}
	}
	const nextTag = nextNode.tag || nextBp.tag;
	const lastTag = lastNode.tag || lastBp.tag;

	if (lastTag !== nextTag) {
		if (lastBp.isComponent === true) {
			const lastNodeInstance = lastNode.instance;

			if (nextBp.isComponent === true) {
				replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, false);
				detachNode(lastNode);
			} else if (isStatefulComponent(lastTag)) {
				diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
			} else {
				diffNodes(lastNodeInstance, nextNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
			}
		} else {
			replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
		}
	} else if (isNullOrUndefined(lastTag)) {
		nextNode.dom = lastNode.dom;
	} else {
		if (lastBp.isComponent === true) {
			if (nextBp.isComponent === true) {
				const instance = lastNode.instance;

				if (!isNullOrUndefined(instance) && instance._unmounted) {
					const newDom = mountComponent(nextNode, lastTag, nextNode.attrs || {}, nextNode.hooks, nextNode.children, instance, parentDom, lifecycle, context);
					if (parentDom !== null) {
						replaceNode(parentDom, newDom, lastNode.dom);
					}
				} else {
					nextNode.instance = instance;
					nextNode.dom = lastNode.dom;
					patchComponent(true, nextNode, nextNode.tag, lastBp, nextBp, instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
				}
			}
		} else {
			const dom = lastNode.dom;
			const lastChildrenType = lastBp.childrenType;
			const nextChildrenType = nextBp.childrenType;
			nextNode.dom = dom;

			if (nextBp.lazy === true && skipLazyCheck === false) {
				const clipData = lastNode.clipData;

				if (lifecycle.scrollY === null) {
					lifecycle.refresh();
				}

				nextNode.clipData = clipData;
				if (clipData.pending === true || clipData.top - lifecycle.scrollY > lifecycle.screenHeight) {
					if (setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle)) {
						return;
					}
				}
				if (clipData.bottom < lifecycle.scrollY) {
					if (setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle)) {
						return;
					}
				}
			}

			if (lastChildrenType > 0 || nextChildrenType > 0) {
				if (nextChildrenType === 5 || lastChildrenType === 5) {
					diffChildren(lastNode, nextNode, dom, lifecycle, context, instance);
				} else {
					const lastChildren = lastNode.children;
					const nextChildren = nextNode.children;

					if (lastChildrenType === 0 || isInvalidNode(lastChildren)) {
						if (nextChildrenType > 2) {
							mountArrayChildren(nextNode, nextChildren, dom, lifecycle, context, instance);
						} else {
							mount(nextChildren, dom, lifecycle, context, instance);
						}
					} else if (nextChildrenType === 0 || isInvalidNode(nextChildren)) {
						if (lastChildrenType > 2) {
							removeAllChildren(dom, lastChildren);
						} else {
							remove(lastChildren, dom);
						}
					} else {
						if (lastChildren !== nextChildren) {
							if (lastChildrenType === 4 && nextChildrenType === 4) {
								patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance);
							} else if (lastChildrenType === 2 && nextChildrenType === 2) {
								patch(lastChildren, nextChildren, dom, lifecycle, context, instance, true, false);
							} else if (lastChildrenType === 1 && nextChildrenType === 1) {
								updateTextNode(dom, lastChildren, nextChildren);
							} else {
								diffChildren(lastNode, nextNode, dom, lifecycle, context, instance);
							}
						}
					}
				}
			}
			if (lastBp.hasAttrs === true || nextBp.hasAttrs === true) {
				diffAttributes(lastNode, nextNode, lastBp.attrKeys, nextBp.attrKeys, dom, instance);
			}
			if (lastBp.hasEvents === true || nextBp.hasEvents === true) {
				diffEvents(lastNode, nextNode, lastBp.eventKeys, nextBp.eventKeys, dom);
			}
			if (lastBp.hasClassName === true || nextBp.hasClassName === true) {
				const nextClassName = nextNode.className;

				if (lastNode.className !== nextClassName) {
					if (isNullOrUndefined(nextClassName)) {
						dom.removeAttribute('class');
					} else {
						dom.className = nextClassName;
					}
				}
			}
			if (lastBp.hasStyle === true || nextBp.hasStyle === true) {
				const nextStyle = nextNode.style;

				if (lastNode.style !== nextStyle) {
					patchStyle(lastNode.style, nextStyle, dom);
				}
			}
			if (nextNode.hasHooks === true && !isNullOrUndefined(nextHooks.didUpdate)) {
				nextHooks.didUpdate(dom);
			}
			setFormElementProperties(nextTag, nextNode);
		}
	}
}


export function diffNodes(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
	if (isPromise(nextNode)) {
		nextNode.then(node => {
			patch(lastNode, node, parentDom, lifecycle, context, instance, null, false);
		});
	} else {
		const nextHooks = nextNode.hooks;
		const nextHooksDefined = !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastNode.dom);
		}
		const nextTag = nextNode.tag || ((isNullOrUndefined(nextNode.bp)) ? null : nextNode.bp.tag);
		const lastTag = lastNode.tag || ((isNullOrUndefined(lastNode.bp)) ? null : lastNode.bp.tag);

		if (nextTag === 'svg') {
			isSVG = true;
		}

		if (lastTag !== nextTag) {
			const lastNodeInstance = lastNode.instance;

			if (isFunction(lastTag)) {
				if (isFunction(nextTag)) {
					replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
				} else if (isStatefulComponent(lastTag)) {
					diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
				} else {
					diffNodes(lastNodeInstance, nextNode, parentDom, lifecycle, context, instance, isSVG);
				}
			} else {
				replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
			}
		} else if (isNullOrUndefined(lastTag)) {
			nextNode.dom = lastNode.dom;
		} else {
			if (isFunction(lastTag)) {
				if (isFunction(nextTag)) {
					const instance = lastNode._instance;

					if (!isNullOrUndefined(instance) && instance._unmounted) {
						const newDom = mountComponent(nextNode, lastTag, nextNode.attrs || {}, nextNode.hooks, nextNode.children, instance, parentDom, lifecycle, context);
						if (parentDom !== null) {
							replaceNode(parentDom, newDom, lastNode.dom);
						}
					} else {
						nextNode.instance = lastNode.instance;
						nextNode.dom = lastNode.dom;
						patchComponent(false, nextNode, nextNode.tag, null, null, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
					}
				}
			} else {
				const dom = lastNode.dom;
				const nextClassName = nextNode.className;
				const nextStyle = nextNode.style;

				nextNode.dom = dom;

				diffChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG);
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
				setFormElementProperties(nextTag, nextNode);
			}
		}
	}
}
