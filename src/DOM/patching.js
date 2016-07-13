import {
	isNullOrUndefined,
	isString,
	addChildrenToProps,
	isStatefulComponent,
	isStringOrNumber,
	isInvalidNode,
	NO_RENDER,
	isNumber,
	isFunction,
	isArray
} from './../core/utils';
import {
	mount,
	mountVText,
	mountVPlaceholder,
	mountVList,
	mountArrayChildren,
	mountComponent
} from './mounting';
import {
	insertOrAppend,
	remove,
	isKeyed,
	replaceNode,
	isUnitlessNumber,
	booleanProps,
	strictProps,
	namespaces,
	isVText,
	isVPlaceholder,
	replaceVListWithNode,
	isVList,
	normaliseChild,
	setFormElementProperties,
	removeAllChildren,
	replaceWithNewNode,
	removeEvents,
	selectValue,
	isVNode
} from './utils';
import { componentToDOMNodeMap } from './rendering';
import { createVPlaceholder, createVText } from '../core/shapes';
import { unmount, unmountVNode } from './unmounting';

export function patch(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG) {
	if (lastInput !== nextInput) {
		if (isInvalidNode(lastInput)) {
			mount(nextInput, parentDom, lifecycle, context, instance, isSVG);
		} else if (isInvalidNode(nextInput)) {
			remove(lastInput, parentDom);
		} else if (isStringOrNumber(lastInput)) {
			if (isStringOrNumber(nextInput)) {
				parentDom.firstChild.nodeValue = nextInput;
			} else {
				const dom = mount(nextInput, null, lifecycle, context, instance, isSVG);

				nextInput.dom = dom;
				replaceNode(parentDom, dom, parentDom.firstChild);
			}
		} else if (isStringOrNumber(nextInput)) {
			replaceNode(parentDom, document.createTextNode(nextInput), lastInput.dom);
		} else {
			if (isVList(nextInput)) {
				if (isVList(lastInput)) {
					patchVList(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG);
				} else {
					replaceNode(parentDom, mountVList(nextInput, null), lastInput.dom);
					unmount(lastInput, null);
				}
			} else if (isVList(lastInput)) {
				replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, instance, isSVG));
			} else if (isVPlaceholder(nextInput)) {
				if (isVPlaceholder(lastInput)) {
					patchVFragment(lastInput, nextInput);
				} else {
					replaceNode(parentDom, mountVPlaceholder(nextInput, null), lastInput.dom);
					unmount(lastInput, null);
				}
			} else if (isVPlaceholder(lastInput)) {
				replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
			} else if (isVText(nextInput)) {
				if (isVText(lastInput)) {
					patchVText(lastInput, nextInput);
				} else {
					replaceNode(parentDom, mountVText(nextInput, null), lastInput.dom);
					unmount(lastInput, null);
				}
			} else if (isVText(lastInput)) {
				replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
			} else if (isVNode(nextInput)) {
				if (isVNode(lastInput)) {
					patchVNode(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG, false);
				} else {
					replaceNode(parentDom, mountVNode(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
					unmount(lastInput, null);
				}
			} else if (isVNode(lastInput)) {
				replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
				unmount(lastInput, null);
			} else {
				throw Error('Bad Input!');
			}
		}
	}
}

export function patchTextNode(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

function patchRef(instance, lastValue, nextValue, dom) {
	if (instance) {
		if (isString(lastValue)) {
			delete instance.refs[lastValue];
		}
		if (isString(nextValue)) {
			instance.refs[nextValue] = dom;
		}
	}
}

function patchChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG) {
	const nextChildren = nextNode.children;
	const lastChildren = lastNode.children;

	if (lastChildren === nextChildren) {
		return;
	}
	if (isInvalidNode(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			patchTextNode(dom, lastChildren, nextChildren);
		} else if (!isInvalidNode(nextChildren)) {
			if (isArray(nextChildren)) {
				mountArrayChildren(nextChildren, dom, lifecycle, context, instance, isSVG);
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
					nextChildren.complex = lastChildren.complex;
					if (isKeyed(lastChildren, nextChildren)) {
						patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, null);
					} else {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, null);
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, lifecycle, context, instance, isSVG, null);
				}
			} else {
				if (isArray(nextChildren)) {
					let lastChild = lastChildren;

					if (isStringOrNumber(lastChildren)) {
						lastChild = createVText(lastChild);
						lastChild.dom = dom.firstChild;
					}
					patchNonKeyedChildren([lastChild], nextChildren, dom, lifecycle, context, instance, isSVG, null);
				} else if (isStringOrNumber(nextChildren)) {
					patchTextNode(dom, lastChildren, nextChildren);
				} else if (isStringOrNumber(lastChildren)) {
					patch(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
				} else {
					patchVNode(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, false);
				}
			}
		}
	}
}

export function patchVNode(lastVNode, nextVNode, parentDom, lifecycle, context, instance, isSVG, skipLazyCheck) {
	const lastBp = lastVNode.bp;
	const nextBp = nextVNode.bp;

	if (lastBp === undefined || nextBp === undefined) {
		patchVNodeWithoutBlueprint(lastVNode, nextVNode, parentDom, lifecycle, context, instance, isSVG);
	} else {
		patchVNodeWithBlueprint(lastVNode, nextVNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck);
	}
}

export function patchVNodeWithBlueprint(lastVNode, nextVNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck) {
	let nextHooks;

	if (nextBp.hasHooks === true) {
		nextHooks = nextVNode.hooks;
		if (nextHooks && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastVNode.dom);
		}
	}
	const nextTag = nextVNode.tag || nextBp.tag;
	const lastTag = lastVNode.tag || lastBp.tag;

	if (lastTag !== nextTag) {
		if (lastBp.isComponent === true) {
			const lastNodeInstance = lastVNode.instance;

			if (nextBp.isComponent === true) {
				replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, instance, false);
			} else if (isStatefulComponent(lastTag)) {
				unmountVNode(lastVNode, null, true);
				const lastNode = lastNodeInstance._lastNode;
				patchVNodeWithBlueprint(lastNode, nextVNode, lastNode.bp, nextBp, parentDom, lifecycle, context, instance, nextBp.isSVG);
			} else {
				unmountVNode(lastVNode, null, true);
				patchVNodeWithBlueprint(lastNodeInstance, nextVNode, lastNodeInstance.bp, nextBp, parentDom, lifecycle, context, instance, nextBp.isSVG);
			}
		} else {
			replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
		}
	} else if (isNullOrUndefined(lastTag)) {
		nextVNode.dom = lastVNode.dom;
	} else {
		if (lastBp.isComponent === true) {
			if (nextBp.isComponent === true) {
				const instance = lastVNode.instance;

				if (!isNullOrUndefined(instance) && instance._unmounted) {
					const newDom = mountComponent(nextVNode, lastTag, nextVNode.attrs || {}, nextVNode.hooks, nextVNode.children, instance, parentDom, lifecycle, context);
					if (parentDom !== null) {
						replaceNode(parentDom, newDom, lastVNode.dom);
					}
				} else {
					nextVNode.instance = instance;
					nextVNode.dom = lastVNode.dom;
					patchComponent(true, nextVNode, nextVNode.tag, lastBp, nextBp, instance, lastVNode.attrs || {}, nextVNode.attrs || {}, nextVNode.hooks, nextVNode.children, parentDom, lifecycle, context);
				}
			}
		} else {
			const dom = lastVNode.dom;
			const lastChildrenType = lastBp.childrenType;
			const nextChildrenType = nextBp.childrenType;
			nextVNode.dom = dom;

			if (nextBp.lazy === true && skipLazyCheck === false) {
				const clipData = lastVNode.clipData;

				if (lifecycle.scrollY === null) {
					lifecycle.refresh();
				}

				nextVNode.clipData = clipData;
				if (clipData.pending === true || clipData.top - lifecycle.scrollY > lifecycle.screenHeight) {
					if (setClipNode(clipData, dom, lastVNode, nextVNode, parentDom, lifecycle, context, instance, lastBp.isSVG)) {
						return;
					}
				}
				if (clipData.bottom < lifecycle.scrollY) {
					if (setClipNode(clipData, dom, lastVNode, nextVNode, parentDom, lifecycle, context, instance, lastBp.isSVG)) {
						return;
					}
				}
			}

			if (lastChildrenType > 0 || nextChildrenType > 0) {
				if (nextChildrenType === 5 || lastChildrenType === 5) {
					patchChildren(lastVNode, nextVNode, dom, lifecycle, context, instance);
				} else {
					const lastChildren = lastVNode.children;
					const nextChildren = nextVNode.children;

					if (lastChildrenType === 0 || isInvalidNode(lastChildren)) {
						if (nextChildrenType > 2) {
							mountArrayChildren(nextChildren, dom, lifecycle, context, instance);
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
								patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, nextBp.isSVG, null);
							} else if (lastChildrenType === 2 && nextChildrenType === 2) {
								patch(lastChildren, nextChildren, dom, lifecycle, context, instance, true, nextBp.isSVG);
							} else if (lastChildrenType === 1 && nextChildrenType === 1) {
								patchTextNode(dom, lastChildren, nextChildren);
							} else {
								patchChildren(lastVNode, nextVNode, dom, lifecycle, context, instance, nextBp.isSVG);
							}
						}
					}
				}
			}
			if (lastBp.hasAttrs === true || nextBp.hasAttrs === true) {
				patchAttributes(lastVNode, nextVNode, lastBp.attrKeys, nextBp.attrKeys, dom, instance);
			}
			if (lastBp.hasEvents === true || nextBp.hasEvents === true) {
				patchEvents(lastVNode.events, nextVNode.events, lastBp.eventKeys, nextBp.eventKeys, dom);
			}
			if (lastBp.hasClassName === true || nextBp.hasClassName === true) {
				const nextClassName = nextVNode.className;

				if (lastVNode.className !== nextClassName) {
					if (isNullOrUndefined(nextClassName)) {
						dom.removeAttribute('class');
					} else {
						dom.className = nextClassName;
					}
				}
			}
			if (lastBp.hasStyle === true || nextBp.hasStyle === true) {
				const nextStyle = nextVNode.style;
				const lastStyle = lastVNode.style;

				if (lastStyle !== nextStyle) {
					patchStyle(lastStyle, nextStyle, dom);
				}
			}
			if (nextBp.hasHooks === true && !isNullOrUndefined(nextHooks.didUpdate)) {
				nextHooks.didUpdate(dom);
			}
			setFormElementProperties(nextTag, nextVNode);
		}
	}
}

export function patchVNodeWithoutBlueprint(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
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
				replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
			} else if (isStatefulComponent(lastTag)) {
				unmountVNode(lastNode, null, true);
				patchVNodeWithoutBlueprint(lastNodeInstance._lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
			} else {
				unmountVNode(lastNode, null, true);
				patchVNodeWithoutBlueprint(lastNodeInstance, nextNode, parentDom, lifecycle, context, instance, isSVG);
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

			patchChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG);
			patchAttributes(lastNode, nextNode, null, null, dom, instance);
			patchEvents(lastNode.events, nextNode.events, null, null, dom);

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

function patchAttributes(lastNode, nextNode, lastAttrKeys, nextAttrKeys, dom, instance) {
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
					patchRef(instance, lastAttrVal, nextAttrVal, dom);
				} else {
					patchAttribute(attr, lastAttrVal, nextAttrVal, dom);
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
					patchRef(getRefInstance(node, instance), lastAttrs[attr], null, dom);
				} else {
					dom.removeAttribute(attr);
				}
			}
		}
	}
}


export function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndefined(lastAttrValue)) {
		if (!isNullOrUndefined(nextAttrValue)) {
			const styleKeys = Object.keys(nextAttrValue);

			for (let i = 0; i < styleKeys.length; i++) {
				const style = styleKeys[i];
				const value = nextAttrValue[style];

				if (isNumber(value) && !isUnitlessNumber[style]) {
					dom.style[style] = value + 'px';
				} else {
					dom.style[style] = value;
				}
			}
		}
	} else if (isNullOrUndefined(nextAttrValue)) {
		dom.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextAttrValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];
			const value = nextAttrValue[style];

			if (isNumber(value) && !isUnitlessNumber[style]) {
				dom.style[style] = value + 'px';
			} else {
				dom.style[style] = value;
			}
		}
		const lastStyleKeys = Object.keys(lastAttrValue);

		for (let i = 0; i < lastStyleKeys.length; i++) {
			const style = lastStyleKeys[i];
			if (isNullOrUndefined(nextAttrValue[style])) {
				dom.style[style] = '';
			}
		}
	}
}

export function patchEvents(lastEvents, nextEvents, _lastEventKeys, _nextEventKeys, dom) {
	const nextEventsDefined = !isNullOrUndefined(nextEvents);
	const lastEventsDefined = !isNullOrUndefined(lastEvents);

	if (nextEventsDefined) {
		if (lastEventsDefined) {
			const nextEventKeys = _nextEventKeys || Object.keys(nextEvents);

			for (let i = 0; i < nextEventKeys.length; i++) {
				const event = nextEventKeys[i];
				const lastEvent = lastEvents[event];
				const nextEvent = nextEvents[event];

				if (lastEvent !== nextEvent) {
					dom[event] = nextEvent;
				}
			}
			const lastEventKeys = _lastEventKeys || Object.keys(lastEvents);

			for (let i = 0; i < lastEventKeys.length; i++) {
				const event = lastEventKeys[i];

				if (isNullOrUndefined(nextEvents[event])) {
					dom[event] = null;
				}
			}
		} else {
			mountEvents(nextEvents, _nextEventKeys, dom);
		}
	} else if (lastEventsDefined) {
		removeEvents(lastEvents, _nextEventKeys, dom);
	}
}

export function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	if (attrName === 'dangerouslySetInnerHTML') {
		const lastHtml = lastAttrValue && lastAttrValue.__html;
		const nextHtml = nextAttrValue && nextAttrValue.__html;

		if (isNullOrUndefined(nextHtml)) {
			throw new Error('Inferno Error: dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content');
		}
		if (lastHtml !== nextHtml) {
			dom.innerHTML = nextHtml;
		}
	} else if (strictProps[attrName]) {
		dom[attrName] = nextAttrValue === null ? '' : nextAttrValue;
	} else {
		if (booleanProps[attrName]) {
			dom[attrName] = nextAttrValue ? true : false;
		} else {
			const ns = namespaces[attrName];

			if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
				if (ns !== undefined) {
					dom.removeAttributeNS(ns, attrName);
				} else {
					dom.removeAttribute(attrName);
				}
			} else {
				if (ns !== undefined) {
					dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
				} else {
					dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
				}
			}
		}
	}
}

export function patchComponent(hasBlueprint, lastNode, Component, lastBp, nextBp, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
	nextProps = addChildrenToProps(nextChildren, nextProps);

	if (isStatefulComponent(Component)) {
		const prevProps = instance.props;
		const prevState = instance.state;
		const nextState = instance.state;

		const childContext = instance.getChildContext();
		if (!isNullOrUndefined(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;
		let nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

		if (nextNode === NO_RENDER) {
			nextNode = instance._lastNode;
		} else if (isNullOrUndefined(nextNode)) {
			nextNode = createVPlaceholder();
		}
		patch(instance._lastNode, nextNode, parentDom, lifecycle, context, instance, null, false);
		lastNode.dom = nextNode.dom;
		instance._lastNode = nextNode;
		instance.componentDidUpdate(prevProps, prevState);
		componentToDOMNodeMap.set(instance, nextNode.dom);
	} else {
		let shouldUpdate = true;
		const nextHooksDefined = (hasBlueprint && nextBp.hasHooks === true) || !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
			shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
		}
		if (shouldUpdate !== false) {
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
				nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
			}
			let nextNode = Component(nextProps, context);

			if (isInvalidNode(nextNode)) {
				nextNode = createVPlaceholder();
			}
			nextNode.dom = lastNode.dom;
			patch(instance, nextNode, parentDom, lifecycle, context, null, null, false);
			lastNode.instance = nextNode;
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
				nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

function patchVList(lastVList, nextVList, parentDom, lifecycle, context, instance, isSVG) {
	const lastItems = lastVList.items;
	const nextItems = nextVList.items;
	const pointer = lastVList.pointer;

	nextVList.dom = lastVList.dom;
	nextVList.pointer = pointer;
	if (!lastItems !== nextItems) {
		if (isKeyed(lastItems, nextItems)) {
			patchKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, instance, isSVG, nextVList);
		} else {
			patchNonKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, instance, isSVG, nextVList);
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	let i = 0;

	for (; i < commonLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = normaliseChild(nextChildren, i);

		patch(lastChild, nextChild, dom, lifecycle, context, instance, isSVG);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			const child = normaliseChild(nextChildren, i);

			insertOrAppend(dom, mount(child, null, lifecycle, context, instance, isSVG), parentVList && parentVList.pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			remove(lastChildren[i], dom);
		}
	}
}

export function patchVFragment(lastVFragment, nextVFragment) {
	nextVFragment.dom = lastVFragment.dom;
}

export function patchVText(lastVText, nextVText) {
	const nextText = nextVText.text;
	const dom = lastVText.dom;

	nextVText.dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let lastEndIndex = lastChildrenLength - 1;
	let nextEndIndex = nextChildrenLength - 1;
	let lastStartIndex = 0;
	let nextStartIndex = 0;
	let lastStartNode = null;
	let nextStartNode = null;
	let nextEndNode = null;
	let lastEndNode = null;
	let nextNode;

	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextChildren[nextStartIndex];
		lastStartNode = lastChildren[lastStartIndex];

		if (nextStartNode.key !== lastStartNode.key) {
			break;
		}
		patchVNode(lastStartNode, nextStartNode, dom, lifecycle, context, instance, isSVG, false);
		nextStartIndex++;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextEndNode.key !== lastEndNode.key) {
			break;
		}
		patchVNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
		nextEndIndex--;
		lastEndIndex--;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextChildren[nextEndIndex];
		lastStartNode = lastChildren[lastStartIndex];

		if (nextEndNode.key !== lastStartNode.key) {
			break;
		}
		nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : null;
		patchVNode(lastStartNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
		insertOrAppend(dom, nextEndNode.dom, nextNode);
		nextEndIndex--;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextChildren[nextStartIndex];
		lastEndNode = lastChildren[lastEndIndex];

		if (nextStartNode.key !== lastEndNode.key) {
			break;
		}
		nextNode = lastChildren[lastStartIndex].dom;
		patchVNode(lastEndNode, nextStartNode, dom, lifecycle, context, instance, isSVG, false);
		insertOrAppend(dom, nextStartNode.dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}

	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : parentVList && parentVList.pointer;
			for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
				insertOrAppend(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, instance, isSVG), nextNode);
			}
		}
	} else if (nextStartIndex > nextEndIndex) {
		while (lastStartIndex <= lastEndIndex) {
			remove(lastChildren[lastStartIndex++], dom);
		}
	} else {
		let aLength = lastEndIndex - lastStartIndex + 1;
		let bLength = nextEndIndex - nextStartIndex + 1;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		let i;
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		let moved = false;
		let removeOffset = 0;
		let lastTarget = 0;
		let index;

		if (aLength * bLength <= 16) {
			for (i = lastStartIndex; i <= lastEndIndex; i++) {
				let removed = true;
				lastEndNode = lastChildren[i];
				for (index = nextStartIndex; index <= nextEndIndex; index++) {
					nextEndNode = nextChildren[index];
					if (lastEndNode.key === nextEndNode.key) {
						sources[index - nextStartIndex] = i;

						if (lastTarget > index) {
							moved = true;
						} else {
							lastTarget = index;
						}
						patchVNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
						removed = false;
						break;
					}
				}
				if (removed) {
					remove(lastEndNode, dom);
					removeOffset++;
				}
			}
		} else {
			const prevItemsMap = new Map();

			for (i = nextStartIndex; i <= nextEndIndex; i++) {
				prevItemsMap.set(nextChildren[i].key, i);
			}
			for (i = lastEndIndex; i >= lastStartIndex; i--) {
				lastEndNode = lastChildren[i];
				index = prevItemsMap.get(lastEndNode.key);

				if (index === undefined) {
					remove(lastEndNode, dom);
					removeOffset++;
				} else {

					nextEndNode = nextChildren[index];

					sources[index - nextStartIndex] = i;
					if (lastTarget > index) {
						moved = true;
					} else {
						lastTarget = index;
					}
					patchVNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
				}
			}
		}

		let pos;
		if (moved) {
			let seq = lis_algorithm(sources);
			index = seq.length - 1;
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
				} else {
					if (index < 0 || i !== seq[index]) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, nextChildren[pos].dom, nextNode);
					} else {
						index--;
					}
				}
			}
		} else if (aLength - removeOffset !== bLength) {
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
					insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
				}
			}
		}
	}
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
	let p = a.slice(0);
	let result = [];
	result.push(0);
	let i;
	let j;
	let u;
	let v;
	let c;

	for (i = 0; i < a.length; i++) {
		if (a[i] === -1) {
			continue;
		}

		j = result[result.length - 1];
		if (a[j] < a[i]) {
			p[i] = j;
			result.push(i);
			continue;
		}

		u = 0;
		v = result.length - 1;

		while (u < v) {
			c = ((u + v) / 2) | 0;
			if (a[result[c]] < a[i]) {
				u = c + 1;
			} else {
				v = c;
			}
		}

		if (a[i] < a[result[u]]) {
			if (u > 0) {
				p[i] = result[u - 1];
			}
			result[u] = i;
		}
	}

	u = result.length;
	v = result[u - 1];

	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}

	return result;
}
