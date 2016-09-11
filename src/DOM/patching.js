import {
	isNullOrUndef,
	isUndefined,
	isNull,
	isString,
	isStatefulComponent,
	isStringOrNumber,
	isInvalid,
	NO_OP,
	isNumber,
	isArray,
	isAttrAnEvent,
	throwError
} from './../core/utils';
import {
	mount,
	mountVElement,
	mountVText,
	mountVFragment,
	mountVComponent,
	mountOptVElement,
	mountVPlaceholder,
	mountArrayChildrenWithType,
	mountArrayChildrenWithoutType,
	mountStatefulComponentCallbacks,
	mountStatelessComponentCallbacks
} from './mounting';
import {
	insertOrAppend,
	isKeyed,
	replaceVListWithNode,
	normaliseChild,
	resetFormInputProperties,
	removeAllChildren,
	replaceWithNewNode,
	formSelectValue,
	updateTextContent,
	setTextContent,
	replaceChild,
	normalise,
	getPropFromOptElement,
	createStatefulComponentInstance,
	createStatelessComponentInput
} from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	isVNode,
	isVElement,
	isOptVElement,
	isVFragment,
	isVComponent,
	isVPlaceholder,
	isVText,
	ValueTypes,
	isKeyedListChildrenType,
	isNonKeyedListChildrenType,
	isNodeChildrenType,
	isTextChildrenType,
	isUnknownChildrenType,
	clonePropsChildren
} from '../core/shapes';
import { unmount } from './unmounting';
import {
	isUnitlessNumber,
	booleanProps,
	strictProps,
	namespaces
} from './constants';

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
	unmount(lastInput, null, lifecycle, false, shallowUnmount);
}

export function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	if (lastInput !== nextInput) {
		if (isOptVElement(nextInput)) {
			if (isOptVElement(lastInput)) {
				patchOptVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
			} else {
				replaceChild(parentDom, mountOptVElement(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
				unmount(lastInput, null, lifecycle, false, shallowUnmount);
			}
		} else if (isOptVElement(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
		} else if (isVComponent(nextInput)) {
			if (isVComponent(lastInput)) {
				patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
			} else {
				replaceChild(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
				unmount(lastInput, null, lifecycle, false, shallowUnmount);
			}
		} else if (isVComponent(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
		} else if (isVElement(nextInput)) {
			if (isVElement(lastInput)) {
				patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
			} else {
				replaceChild(parentDom, mountVElement(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
				unmount(lastInput, null, lifecycle, false, shallowUnmount);
			}
		} else if (isVFragment(nextInput)) {
			if (isVFragment(lastInput)) {
				patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
			} else {
				replaceChild(parentDom, mountVFragment(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
				unmount(lastInput, null, lifecycle, false, shallowUnmount);
			}
		} else if (isVFragment(lastInput)) {
			replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lifecycle, shallowUnmount);
		} else if (isVElement(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
		} else if (isVText(nextInput)) {
			if (isVText(lastInput)) {
				patchVText(lastInput, nextInput, false, shallowUnmount);
			} else {
				replaceChild(parentDom, mountVText(nextInput, null), lastInput.dom);
				unmount(lastInput, null, lifecycle, false, shallowUnmount);
			}
		} else if (isVText(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
		} else if (isVPlaceholder(nextInput)) {
			if (isVPlaceholder(lastInput)) {
				patchVPlaceholder(lastInput, nextInput);
			} else {
				replaceChild(parentDom, mountVPlaceholder(nextInput, null), lastInput.dom);
				unmount(lastInput, null, lifecycle, false, shallowUnmount);
			}
		} else if (isVPlaceholder(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('bad input argument called on patch(). Input argument may need normalising.');
			}
			throwError();
		}
	}
}

function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	const nextTag = nextVElement.tag;
	const lastTag = lastVElement.tag;

	if (nextTag === 'svg') {
		isSVG = true;
	}
	if (lastTag !== nextTag) {
		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else {
		const dom = lastVElement.dom;
		const lastProps = lastVElement.props;
		const nextProps = nextVElement.props;
		const lastChildren = lastVElement.children;
		const nextChildren = nextVElement.children;

		nextVElement.dom = dom;
		if (lastChildren !== nextChildren) {
			const lastChildrenType = lastVElement.childrenType;
			const nextChildrenType = nextVElement.childrenType;

			if (lastChildrenType === nextChildrenType) {
				patchChildren(lastChildrenType, lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
			} else {
				patchChildrenWithUnknownType(lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
			}
		}
		if (lastProps !== nextProps) {
			const formValue = patchProps(lastProps, nextProps, dom, shallowUnmount);

			if (nextTag === 'select') {
				formSelectValue(dom, formValue);
			}
		}
	}
}

export function patchOptVElement(lastOptVElement, nextOptVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	const dom = lastOptVElement.dom;
	const lastBp = lastOptVElement.bp;
	const nextBp = nextOptVElement.bp;

	nextOptVElement.dom = dom;
	if (lastBp !== nextBp) {
		const newDom = mountOptVElement(nextOptVElement, null, lifecycle, context, isSVG, shallowUnmount);

		replaceChild(parentDom, newDom, dom);
		unmount(lastOptVElement, null, lifecycle, true, shallowUnmount);
	} else {
		const bp0 = nextBp.v0;
		const tag = nextBp.staticVElement.tag;
		let ignoreDiff = false;

		if (tag === 'svg') {
			isSVG = true;
		} else if (tag === 'input') {
			// input elements are problematic due to the large amount of internal state that hold
			// so instead of making lots of assumptions, we instead reset common values and re-apply
			// the the patching each time
			resetFormInputProperties(dom);
			ignoreDiff = true;
		} else if (tag === 'select') {
		} else if (tag === 'textarea') {
			// textarea elements are like input elements, except they have sligthly less internal state to
			// worry about
			ignoreDiff = true;
		}
		if (!isNull(bp0)) {
			const lastV0 = lastOptVElement.v0;
			const nextV0 = nextOptVElement.v0;
			const bp1 = nextBp.v1;

			if (lastV0 !== nextV0 || ignoreDiff) {
				patchOptVElementValue(bp0, lastV0, nextV0, nextBp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
			}
			if (!isNull(bp1)) {
				const lastV1 = lastOptVElement.v1;
				const nextV1 = nextOptVElement.v1;
				const bp2 = nextBp.v2;

				if (lastV1 !== nextV1 || ignoreDiff) {
					patchOptVElementValue(bp1, lastV1, nextV1, nextBp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
				}
				if (!isNull(bp2)) {
					const lastV2 = lastOptVElement.v2;
					const nextV2 = nextOptVElement.v2;
					const bp3 = nextBp.v3;

					if (lastV2 !== nextV2 || ignoreDiff) {
						patchOptVElementValue(bp2, lastV2, nextV2, nextBp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
					}
					if (!isNull(bp3)) {
						const d3 = nextBp.d3;
						const lastV3s = lastOptVElement.v3;
						const nextV3s = nextOptVElement.v3;

						for (let i = 0; i < lastV3s.length; i++) {
							const lastV3 = lastV3s[i];
							const nextV3 = nextV3s[i];

							if (lastV3 !== nextV3 || ignoreDiff) {
								patchOptVElementValue(bp3[i], lastV3, nextV3, d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
							}
						}
					}
				}
			}
		}
		if (tag === 'select') {
			formSelectValue(dom, getPropFromOptElement(nextOptVElement, ValueTypes.PROP_VALUE));
		}
	}
}

function patchOptVElementValue(valueType, lastValue, nextValue, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
	switch (valueType) {
		case ValueTypes.CHILDREN:
			patchChildren(descriptor, lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
			break;
		case ValueTypes.PROP_CLASS_NAME:
			if (isNullOrUndef(nextValue)) {
				dom.removeAttribute('class');
			} else {
				if (isSVG) {
					dom.setAttribute('class', nextValue);
				} else {
					dom.className = nextValue;
				}
			}
			break;
		case ValueTypes.PROP_DATA:
			dom.dataset[descriptor] = nextValue;
			break;
		case ValueTypes.PROP_STYLE:
			patchStyle(lastValue, nextValue, dom);
			break;
		case ValueTypes.PROP_VALUE:
			dom.value = isNullOrUndef(nextValue) ? '' : nextValue;
			break;
		case ValueTypes.PROP:
			patchProp(descriptor, lastValue, nextValue, dom);
			break;
		case ValueTypes.SPREAD:
			patchProps(lastValue, nextValue, dom, shallowUnmount);
			break;
	}
}

function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	if (isTextChildrenType(childrenType)) {
		updateTextContent(parentDom, nextChildren);
	} else if (isNodeChildrenType(childrenType)) {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isKeyedListChildrenType(childrenType)) {
		patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
	} else if (isNonKeyedListChildrenType(childrenType)) {
		patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, false, shallowUnmount);
	} else if (isUnknownChildrenType(childrenType)) {
		patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad childrenType value specified when attempting to patchChildren.');
		}
		throwError();
	}
}

export function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	if (isInvalid(nextChildren)) {
		if (!isInvalid(lastChildren)) {
			removeAllChildren(parentDom, lastChildren, lifecycle, shallowUnmount);
		}
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(parentDom, nextChildren);
		} else if (!isInvalid(nextChildren)) {
			if (isArray(nextChildren)) {
				mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
			} else {
				mount(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
			}
		}
	} else if (isVNode(lastChildren) && isVNode(nextChildren)) {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isStringOrNumber(nextChildren)) {
		if (isStringOrNumber(lastChildren)) {
			updateTextContent(parentDom, nextChildren);
		} else {
			setTextContent(parentDom, nextChildren);
		}
	} else if (isStringOrNumber(lastChildren)) {
		const child = normalise(lastChildren);

		child.dom = parentDom.firstChild;
		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else if (isArray(nextChildren)) {
		if (isArray(lastChildren)) {
			nextChildren.complex = lastChildren.complex;

			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
			} else {
				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
			}
		} else {
			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
		}
	} else if (isArray(lastChildren)) {
		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError('bad input argument called on patchChildrenWithUnknownType(). Input argument may need normalising.');
		}
		throwError();
	}
}

export function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	const lastComponent = lastVComponent.component;
	const nextComponent = nextVComponent.component;
	const nextProps = nextVComponent.props || {};

	if (lastComponent !== nextComponent) {
		if (isStatefulComponent(nextVComponent)) {
			const lastInstance = lastVComponent.instance;
			const nextInstance = createStatefulComponentInstance(nextComponent, nextProps, context, isSVG);
			// we use || lastInstance because stateless components store their lastInstance
			const lastInput = lastInstance._lastInput || lastInstance;
			const nextInput = nextInstance._lastInput;
			const ref = nextVComponent.ref;

			nextInstance._vComponent = nextVComponent;
			nextVComponent.instance = nextInstance;
			patch(lastInput, nextInput, parentDom, lifecycle, nextInstance._childContext, isSVG, true);
			mountStatefulComponentCallbacks(ref, nextInstance, lifecycle);
			nextVComponent.dom = nextInput.dom;
			componentToDOMNodeMap.set(nextInstance, nextInput.dom);
		} else {
			const lastInput = lastVComponent.instance._lastInput || lastVComponent.instance;
			const nextInput = createStatelessComponentInput(nextComponent, nextProps, context);

			patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, true);
			const dom = nextVComponent.dom = nextInput.dom;

			nextVComponent.instance = nextInput;
			mountStatelessComponentCallbacks(nextVComponent.hooks, dom, lifecycle);
		}
		unmount(lastVComponent, null, lifecycle, false, shallowUnmount);
	} else {
		if (isStatefulComponent(nextVComponent)) {
			const instance = lastVComponent.instance;

			if (instance._unmounted) {
				if (isNull(parentDom)) {
					return true;
				}
				replaceChild(parentDom, mountVComponent(nextVComponent, null, lifecycle, context, isSVG, shallowUnmount), lastVComponent.dom);
			} else {
				const lastProps = instance.props;
				const lastState = instance.state;
				const nextState = instance.state;
				const childContext = instance.getChildContext();

				nextVComponent.instance = instance;
				instance.context = context;
				if (!isNullOrUndef(childContext)) {
					context = Object.assign({}, context, childContext);
				}
				const lastInput = instance._lastInput;
				let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps);

				if (nextInput === NO_OP) {
					nextInput = lastInput;
				} else if (isInvalid(nextInput)) {
					nextInput = createVPlaceholder();
				}
				instance._lastInput = nextInput;
				instance._vComponent = nextVComponent;
				instance._lastInput = nextInput;
				patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
				instance.componentDidUpdate(lastProps, lastState);
				nextVComponent.dom = nextInput.dom;
				componentToDOMNodeMap.set(instance, nextInput.dom);
			}
		} else {
			let shouldUpdate = true;
			const lastProps = lastVComponent.props;
			const nextHooks = nextVComponent.hooks;
			const nextHooksDefined = !isNullOrUndef(nextHooks);
			const lastInput = lastVComponent.instance;

			nextVComponent.dom = lastVComponent.dom;
			nextVComponent.instance = lastInput;
			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
				shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
					nextHooks.onComponentWillUpdate(lastProps, nextProps);
				}
				let nextInput = nextComponent(nextProps, context);

				if (nextInput === NO_OP) {
					return false;
				} else if (isInvalid(nextInput)) {
					nextInput = createVPlaceholder();
				}
				patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
				nextVComponent.instance = nextInput;
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
					nextHooks.onComponentDidUpdate(lastProps, nextProps);
				}
			}
		}
	}
	return false;
}

export function patchVText(lastVText, nextVText) {
	const nextText = nextVText.text;
	const dom = lastVText.dom;

	nextVText.dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
	nextVPlacholder.dom = lastVPlacholder.dom;
}

function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	const lastChildren = lastVFragment.children;
	const nextChildren = nextVFragment.children;
	const pointer = lastVFragment.pointer;

	nextVFragment.dom = lastVFragment.dom;
	nextVFragment.pointer = pointer;
	if (!lastChildren !== nextChildren) {
		const lastChildrenType = lastVFragment.childrenType;
		const nextChildrenType = nextVFragment.childrenType;

		if (lastChildrenType === nextChildrenType) {
			if (isKeyedListChildrenType(nextChildrenType)) {
				return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
			} else if (isNonKeyedListChildrenType(nextChildrenType)) {
				return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, false, shallowUnmount);
			}
		}
		if (isKeyed(lastChildren, nextChildren)) {
			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
		} else {
			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, true, shallowUnmount);
		}
	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList, shouldNormalise, shallowUnmount) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	let i = 0;

	for (; i < commonLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = shouldNormalise ? normaliseChild(nextChildren, i) : nextChildren[i];

		patch(lastChild, nextChild, dom, lifecycle, context, isSVG, shallowUnmount);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			const child = normaliseChild(nextChildren, i);

			insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG, shallowUnmount), parentVList && parentVList.pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[i], dom, lifecycle, false, shallowUnmount);
		}
	}
}

export function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, parentVList, shallowUnmount) {
	let aLength = a.length;
	let bLength = b.length;
	let aEnd = aLength - 1;
	let bEnd = bLength - 1;
	let aStart = 0;
	let bStart = 0;
	let i;
	let j;
	let aStartNode = a[aStart];
	let bStartNode = b[bStart];
	let aEndNode = a[aEnd];
	let bEndNode = b[bEnd];
	let aNode = null;
	let bNode = null;
	let nextNode;
	let nextPos;
	let node;

	if (aLength === 0) {
		if (bLength !== 0) {
			mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG, shallowUnmount);
		}
		return;
	} else if (bLength === 0) {
		if (aLength !== 0) {
			removeAllChildren(dom, a, lifecycle, shallowUnmount);
		}
		return;
	}
	// Step 1
	/* eslint no-constant-condition: 0 */
	outer: while (true) {
		// Sync nodes with the same key at the beginning.
		while (aStartNode.key === bStartNode.key) {
			patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
			aStart++;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aStartNode = a[aStart];
			bStartNode = b[bStart];
		}

		// Sync nodes with the same key at the end.
		while (aEndNode.key === bEndNode.key) {
			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
			aEnd--;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aEndNode = a[aEnd];
			bEndNode = b[bEnd];
		}

		// Move and sync nodes from right to left.
		if (aEndNode.key === bStartNode.key) {
			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
			insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
			aEnd--;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break;
			}
			aEndNode = a[aEnd];
			bStartNode = b[bStart];
			// In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
			// immediately jump to the start of this prefix/suffix algo.
			continue;
		}

		// Move and sync nodes from left to right.
		if (aStartNode.key === bEndNode.key) {
			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
			insertOrAppend(dom, bEndNode.dom, nextNode);
			aStart++;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break;
			}
			aStartNode = a[aStart];
			bEndNode = b[bEnd];
			continue;
		}
		break;
	}

	if (aStart > aEnd) {
		if (bStart <= bEnd) {
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
			while (bStart <= bEnd) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), nextNode);
			}
		}
	} else if (bStart > bEnd) {
		while (aStart <= aEnd) {
			unmount(a[aStart++], dom, lifecycle, false, shallowUnmount);
		}
	} else {
		aLength = aEnd - aStart + 1;
		bLength = bEnd - bStart + 1;
		const aNullable = a;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		let moved = false;
		let pos = 0;
		let patched = 0;

		if ((bLength <= 4) || (aLength * bLength <= 16)) {
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];
				if (patched < bLength) {
					for (j = bStart; j <= bEnd; j++) {
						bNode = b[j];
						if (aNode.key === bNode.key) {
							sources[j - bStart] = i;

							if (pos > j) {
								moved = true;
							} else {
								pos = j;
							}
							patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
							patched++;
							aNullable[i] = null;
							break;
						}
					}
				}
			}
		} else {
			const keyIndex = new Map();

			for (i = bStart; i <= bEnd; i++) {
				node = b[i];
				keyIndex.set(node.key, i);
			}
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];

				if (patched < bLength) {
					j = keyIndex.get(aNode.key);

					if (!isUndefined(j)) {
						bNode = b[j];
						sources[j - bStart] = i;
						if (pos > j) {
							moved = true;
						} else {
							pos = j;
						}
						patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
						patched++;
						aNullable[i] = null;
					}
				}
			}
		}
		if (aLength === a.length && patched === 0) {
			removeAllChildren(dom, a, lifecycle);
			while (bStart < bLength) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), null);
			}
		} else {
			i = aLength - patched;
			while (i > 0) {
				aNode = aNullable[aStart++];
				if (!isNull(aNode)) {
					unmount(aNode, dom, lifecycle, false, shallowUnmount);
					i--;
				}
			}
			if (moved) {
				let seq = lis_algorithm(sources);
				j = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG, shallowUnmount), nextNode);
					} else {
						if (j < 0 || i !== seq[j]) {
							pos = i + bStart;
							node = b[pos];
							nextPos = pos + 1;
							nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
							insertOrAppend(dom, node.dom, nextNode);
						} else {
							j--;
						}
					}
				}
			} else if (patched !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG, shallowUnmount), nextNode);
					}
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

// returns true if a property has been applied that can't be cloned via elem.cloneNode()
export function patchProp(prop, lastValue, nextValue, dom) {
	if (strictProps[prop]) {
		dom[prop] = isNullOrUndef(nextValue) ? '' : nextValue;
	} else if (booleanProps[prop]) {
		dom[prop] = nextValue ? true : false;
	} else {
		if (lastValue !== nextValue) {
			if (isNullOrUndef(nextValue)) {
				dom.removeAttribute(prop);
				return false;
			}
			if (prop === 'className') {
				dom.className = nextValue;
				return false;
			} else if (prop === 'style') {
				patchStyle(lastValue, nextValue, dom);
			} else if (prop === 'defaultChecked') {
				if (isNull(lastValue)) {
					dom.addAttribute('checked');
				}
				return false;
			} else if (prop === 'defaultValue') {
				if (isNull(lastValue)) {
					dom.setAttribute('value', nextValue);
				}
				return false;
			} else if (isAttrAnEvent(prop)) {
				dom[prop.toLowerCase()] = nextValue;
			} else if (prop === 'dangerouslySetInnerHTML') {
				const lastHtml = lastValue && lastValue.__html;
				const nextHtml = nextValue && nextValue.__html;

				if (isNullOrUndef(nextHtml)) {
					if (process.env.NODE_ENV !== 'production') {
						throwError('dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.');
					}
					throwError();
				}
				if (lastHtml !== nextHtml) {
					dom.innerHTML = nextHtml;
				}
			} else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
				const ns = namespaces[prop];

				if (ns) {
					dom.setAttributeNS(ns, prop, nextValue);
				} else {
					dom.setAttribute(prop, nextValue);
				}
				return false;
			}
		}
	}
	return true;
}

function patchProps(lastProps, nextProps, dom, shallowUnmount) {
	lastProps = lastProps || {};
	nextProps = nextProps || {};
	let formValue;

	for (let prop in nextProps) {
		const nextValue = nextProps[prop];
		const lastValue = lastProps[prop];

		if (prop === 'value') {
			formValue = nextValue;
		}
		if (isNullOrUndef(nextValue)) {
			removeProp(prop, dom);
		} else {
			patchProp(prop, lastValue, nextValue, dom);
		}
	}
	for (let prop in lastProps) {
		if (isNullOrUndef(nextProps[prop])) {
			removeProp(prop, dom);
		}
	}
	return formValue;
}

export function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndef(lastAttrValue)) {
		if (!isNullOrUndef(nextAttrValue)) {
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
	} else if (isNullOrUndef(nextAttrValue)) {
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
			if (isNullOrUndef(nextAttrValue[style])) {
				dom.style[style] = '';
			}
		}
	}
}

function removeProp(prop, dom) {
	if (prop === 'className') {
		dom.removeAttribute('class');
	} else if (prop === 'value') {
		dom.value = '';
	} else {
		dom.removeAttribute(prop);
	}
}
