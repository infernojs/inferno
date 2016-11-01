import {
	isNullOrUndef,
	// isUndefined,
	// isNull,
	isString,
	// isStatefulComponent,
	// isStringOrNumber,
	// isInvalid,
	// NO_OP,
	isNumber,
	isArray,
	isAttrAnEvent,
	throwError
} from './../shared';
import {
	mount,
	mountElement,
	// mountText,
	// mountFragment,
	mountComponent,
	// mountVoid
} from './mounting';
import {
	// insertOrAppend,
	// isKeyed,
	// replaceFragmentWithNode,
	// normaliseChild,
	// resetFormInputProperties,
	// removeAllChildren,
	// replaceWithNewNode,
	// formSelectValue,
	updateTextContent,
	// setTextContent,
	// replaceChild,
	// normalise,
	// getPropFromOptElement,
	// createStatelessComponentInput,
	// copyPropsTo,
	replaceVNode,
	replaceLastChildAndUnmount,
	appendChild
} from './utils';
// import { componentToDOMNodeMap } from './rendering';
import { unmount } from './unmounting';
import {
	isUnitlessNumber,
	booleanProps,
	strictProps,
	namespaces
} from './constants';
import { VNodeFlags, isVNode } from '../core/shapes';
// import {
// 	getIncrementalId,
// 	componentIdMap
// } from './devtools';

export function patch(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG) {
	if (lastVNode !== nextVNode) {
		const lastFlags = lastVNode.flags;
		const nextFlags = nextVNode.flags;

		switch (nextFlags) {
			case VNodeFlags.ComponentClass:
			case VNodeFlags.ComponentFunction:
				switch (lastFlags) {
					case VNodeFlags.ComponentClass:
					case VNodeFlags.ComponentFunction:
						patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
						break;
					default:
						replaceVNode(
							parentDom,
							mountComponent(
								nextVNode,
								null,
								lifecycle,
								context,
								isSVG,
								nextFlags === VNodeFlags.ComponentClass
							), 
							lastVNode,
							lifecycle
						);
				}
				break;
			case VNodeFlags.HtmlElement:
			case VNodeFlags.SvgElement:
			case VNodeFlags.InputElement:
			case VNodeFlags.TextAreaElement:
			case VNodeFlags.MediaElement:
				switch (lastFlags) {
					case VNodeFlags.HtmlElement:
					case VNodeFlags.SvgElement:
					case VNodeFlags.InputElement:
					case VNodeFlags.TextAreaElement:
					case VNodeFlags.MediaElement:
						patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
						break;
					default:
						replaceVNode(
							parentDom, 
							mountElement(
								nextVNode, 
								null, 
								lifecycle,
								context,
								isSVG
							),
							lastVNode,
							lifecycle
						);
				}
				break;
			default:
				switch (lastFlags) {
					case VNodeFlags.ComponentClass:
					case VNodeFlags.ComponentFunction:
						replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
						break;
					default:
						if (process.env.NODE_ENV !== 'production') {
							throwError('bad input argument called on patch(). Input argument may need normalising.');
						}
						throwError();
				}
		} 

		// } else if (lastFlags === ELEMENT) {
		// 	replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
		// } else if (nextFlags === FRAGMENT) {
		// 	if (lastFlags === FRAGMENT) {
		// 		patchFragment(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
		// 	} else {
		// 		replaceVNode(parentDom, mountFragment(nextVNode, null, lifecycle, context, isSVG), lastVNode, lifecycle);
		// 	}
		// } else if (lastFlags === FRAGMENT) {
		// 	replaceFragmentWithNode(parentDom, lastVNode, mount(nextVNode, null, lifecycle, context, isSVG), lifecycle);
		// } else if (nextFlags === TEXT) {
		// 	if (lastFlags === TEXT) {
		// 		patchText(lastVNode, nextVNode);
		// 	} else {
		// 		replaceVNode(parentDom, mountText(nextVNode, null), lastVNode, lifecycle);
		// 	}
		// } else if (lastFlags === TEXT) {
		// 	replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
		// } else if (nextFlags === PLACEHOLDER) {
		// 	if (lastFlags === PLACEHOLDER) {
		// 		patchVoid(lastVNode, nextVNode);
		// 	} else {
		// 		replaceVNode(parentDom, mountVoid(nextVNode, null), lastVNode, lifecycle);
		// 	}
		// } else if (lastFlags === PLACEHOLDER) {
		// 	replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
		// } else {
		// 	if (process.env.NODE_ENV !== 'production') {
		// 		throwError('bad input argument called on patch(). Input argument may need normalising.');
		// 	}
		// 	throwError();
		// }
	}
}

function patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG) {
	const nextTag = nextVNode.type;
	const lastTag = lastVNode.type;

	if (lastTag !== nextTag) {
// 		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount);
	} else {
		const dom = lastVNode.dom;
		const lastProps = lastVNode.props;
		const nextProps = nextVNode.props;
		const lastChildren = lastVNode.children;
		const nextChildren = nextVNode.children;

		nextVNode.dom = dom;
		if (lastChildren !== nextChildren) {
			if (isString(lastChildren) && isString(nextChildren)) {
				updateTextContent(dom, nextChildren);
			} else if (isVNode(lastChildren) && isVNode(nextChildren)) {
				patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
			} else {
				if (isArray(nextChildren)) {
					if (isArray(lastChildren)) {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
					}
				}
			}
			// debugger;
		}
		if (lastProps !== nextProps) {
			patchProps(lastProps, nextProps, dom, lifecycle, context, isSVG);
		}
	}
}
// function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	switch (childrenType) {
// 		case CHILDREN_TEXT:
// 			updateTextContent(parentDom, nextChildren);
// 			break;
// 		case NODE:
// 			patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			break;
// 		case KEYED:
// 			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
// 			break;
// 		case NON_KEYED:
// 			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, false, shallowUnmount);
// 			break;
// 		case UNKNOWN:
// 			patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			break;
// 		default:
// 			if (process.env.NODE_ENV !== 'production') {
// 				throwError('bad childrenType value specified when attempting to patchChildren.');
// 			}
// 			throwError();
// 	}
// }

// 	if (isInvalid(nextChildren)) {
// 		if (!isInvalid(lastChildren)) {
// 			if (isVNode(lastChildren)) {
// 				unmount(lastChildren, parentDom, lifecycle, true, shallowUnmount);
// 			} else { // If lastChildren ain't VNode we assume its array
// 				removeAllChildren(parentDom, lastChildren, lifecycle, shallowUnmount);
// 			}
// 		}
// 	} else if (isInvalid(lastChildren)) {
// 		if (isStringOrNumber(nextChildren)) {
// 			setTextContent(parentDom, nextChildren);
// 		} else if (!isInvalid(nextChildren)) {
// 			if (isArray(nextChildren)) {
// 				mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			} else {
// 				mount(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			}
// 		}
// 	} else if (isVNode(lastChildren) && isVNode(nextChildren)) {
// 		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (isStringOrNumber(nextChildren)) {
// 		if (isStringOrNumber(lastChildren)) {
// 			updateTextContent(parentDom, nextChildren);
// 		} else {
// 			setTextContent(parentDom, nextChildren);
// 		}
// 	} else if (isStringOrNumber(lastChildren)) {
// 		const child = normalise(lastChildren);

// 		child.dom = parentDom.firstChild;
// 		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (isArray(nextChildren)) {
// 		if (isArray(lastChildren)) {
// 			nextChildren.complex = lastChildren.complex;

// 			if (isKeyed(lastChildren, nextChildren)) {
// 				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
// 			} else {
// 				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
// 			}
// 		} else {
// 			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
// 		}
// 	} else if (isArray(lastChildren)) {
// 		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
// 	} else {
// 		if (process.env.NODE_ENV !== 'production') {
// 			throwError('bad input argument called on patchChildrenWithUnknownType(). Input argument may need normalising.');
// 		}
// 		throwError();
// 	}
// }

export function patchComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG) {
// 	const lastType = lastVComponent.type;
// 	const nextType = nextVComponent.type;
// 	const nextProps = nextVComponent.props || {};

// 	if (lastType !== nextType) {
// 		if (isStatefulComponent(nextVComponent)) {
// 			replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 		} else {
// 			const lastInput = lastVComponent.instance._lastInput || lastVComponent.instance;
// 			const nextInput = createStatelessComponentInput(nextType, nextProps, context);

// 			patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, true);
// 			const dom = nextVComponent.dom = nextInput.dom;

// 			nextVComponent.instance = nextInput;
// 			mountStatelessComponentCallbacks(nextVComponent.hooks, dom, lifecycle);
// 			unmount(lastVComponent, null, lifecycle, false, shallowUnmount);
// 		}
// 	} else {
// 		if (isStatefulComponent(nextVComponent)) {
// 			const instance = lastVComponent.instance;

// 			if (instance._unmounted) {
// 				if (isNull(parentDom)) {
// 					return true;
// 				}
// 				replaceChild(parentDom, mountVComponent(nextVComponent, null, lifecycle, context, isSVG, shallowUnmount), lastVComponent.dom);
// 			} else {
// 				const defaultProps = nextType.defaultProps;
// 				const lastProps = instance.props;

// 				if (instance._devToolsStatus.connected && !instance._devToolsId) {
// 					componentIdMap.set(instance._devToolsId = getIncrementalId(), instance);
// 				}
// 				if (!isUndefined(defaultProps)) {
// 					copyPropsTo(lastProps, nextProps);
// 					nextVComponent.props = nextProps;
// 				}
// 				const lastState = instance.state;
// 				const nextState = instance.state;
// 				let childContext = instance.getChildContext();

// 				nextVComponent.instance = instance;
// 				instance._isSVG = isSVG;
// 				if (!isNullOrUndef(childContext)) {
// 					childContext = Object.assign({}, context, childContext);
// 				} else {
// 					childContext = context;
// 				}
// 				const lastInput = instance._lastInput;
// 				let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false);
// 				let didUpdate = true;

// 				instance._childContext = childContext;
// 				if (isInvalid(nextInput)) {
// 					nextInput = createVPlaceholder();
// 				} else if (isArray(nextInput)) {
// 					nextInput = createVFragment(nextInput, null);
// 				} else if (nextInput === NO_OP) {
// 					nextInput = lastInput;
// 					didUpdate = false;
// 				}

// 				instance._lastInput = nextInput;
// 				instance._vComponent = nextVComponent;

// 				if (didUpdate) {
// 					patch(lastInput, nextInput, parentDom, lifecycle, childContext, isSVG, shallowUnmount);
// 					instance.componentDidUpdate(lastProps, lastState);
// 					componentToDOMNodeMap.set(instance, nextInput.dom);
// 				}
// 				nextVComponent.dom = nextInput.dom;
// 			}
// 		} else {
// 			let shouldUpdate = true;
// 			const lastProps = lastVComponent.props;
// 			const nextHooks = nextVComponent.hooks;
// 			const nextHooksDefined = !isNullOrUndef(nextHooks);
// 			const lastInput = lastVComponent.instance;

// 			nextVComponent.dom = lastVComponent.dom;
// 			nextVComponent.instance = lastInput;
// 			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
// 				shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps, nextProps);
// 			}
// 			if (shouldUpdate !== false) {
// 				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
// 					nextHooks.onComponentWillUpdate(lastProps, nextProps);
// 				}
// 				let nextInput = nextType(nextProps, context);

// 				if (isInvalid(nextInput)) {
// 					nextInput = createVPlaceholder();
// 				} else if (isArray(nextInput)) {
// 					nextInput = createVFragment(nextInput, null);
// 				} else if (nextInput === NO_OP) {
// 					return false;
// 				}

// 				patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 				nextVComponent.instance = nextInput;
// 				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
// 					nextHooks.onComponentDidUpdate(lastProps, nextProps);
// 				}
// 			}
// 		}
// 	}
// 	return false;
}

export function patchText(lastVNode, nextVNode) {
	const nextText = nextVNode.children;
	const dom = lastVNode.dom;

	nextVNode.dom = dom;
	if (lastVNode.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchVoid(lastVNode, nextVNode) {
	nextVNode.dom = lastVNode.dom;
}

function patchFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG) {
// 	const lastChildren = lastVFragment.children;
// 	const nextChildren = nextVFragment.children;
// 	const pointer = lastVFragment.pointer;

// 	nextVFragment.dom = lastVFragment.dom;
// 	nextVFragment.pointer = pointer;
// 	if (!lastChildren !== nextChildren) {
// 		const lastChildrenType = lastVFragment.childrenType;
// 		const nextChildrenType = nextVFragment.childrenType;

// 		if (lastChildrenType === nextChildrenType) {
// 			if (nextChildrenType === KEYED) {
// 				return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
// 			} else if (nextChildrenType === NON_KEYED) {
// 				return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, false, shallowUnmount);
// 			}
// 		}
// 		if (isKeyed(lastChildren, nextChildren)) {
// 			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
// 		} else {
// 			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, true, shallowUnmount);
// 		}
// 	}
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG) {
	let lastChildrenLength = lastChildren.length;
	let nextChildrenLength = nextChildren.length;
	let commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	let i = 0;

	for (; i < commonLength; i++) {
		const lastChild = lastChildren[i];
		const nextChild = nextChildren[i];

		patch(lastChild, nextChild, dom, lifecycle, context, isSVG);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			const child = nextChildren[i];

			appendChild(dom, mount(child, null, lifecycle, context, isSVG));
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[i], dom, lifecycle, false, false);
		}
	}
}

// export function patchKeyedChildren(
// 	a: Array<VComponent | OptVElement | VElement>,
// 	b: Array<VComponent | OptVElement | VElement>,
// 	dom,
// 	lifecycle,
// 	context,
// 	isSVG,
// 	parentVList,
// 	shallowUnmount
// ) {
// 	let aLength = a.length;
// 	let bLength = b.length;
// 	let aEnd = aLength - 1;
// 	let bEnd = bLength - 1;
// 	let aStart = 0;
// 	let bStart = 0;
// 	let i;
// 	let j;
// 	let aStartNode = a[aStart];
// 	let bStartNode = b[bStart];
// 	let aEndNode = a[aEnd];
// 	let bEndNode = b[bEnd];
// 	let aNode;
// 	let bNode;
// 	let nextNode;
// 	let nextPos;
// 	let node;

// 	if (aLength === 0) {
// 		if (bLength !== 0) {
// 			mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG, shallowUnmount);
// 		}
// 		return;
// 	} else if (bLength === 0) {
// 		if (aLength !== 0) {
// 			removeAllChildren(dom, a, lifecycle, shallowUnmount);
// 		}
// 		return;
// 	}
// 	// Step 1
// 	/* eslint no-constant-condition: 0 */
// 	outer: while (true) {
// 		// Sync nodes with the same key at the beginning.
// 		while (aStartNode.key === bStartNode.key) {
// 			patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			aStart++;
// 			bStart++;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break outer;
// 			}
// 			aStartNode = a[aStart];
// 			bStartNode = b[bStart];
// 		}

// 		// Sync nodes with the same key at the end.
// 		while (aEndNode.key === bEndNode.key) {
// 			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			aEnd--;
// 			bEnd--;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break outer;
// 			}
// 			aEndNode = a[aEnd];
// 			bEndNode = b[bEnd];
// 		}

// 		// Move and sync nodes from right to left.
// 		if (aEndNode.key === bStartNode.key) {
// 			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
// 			aEnd--;
// 			bStart++;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break;
// 			}
// 			aEndNode = a[aEnd];
// 			bStartNode = b[bStart];
// 			// In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
// 			// immediately jump to the start of this prefix/suffix algo.
// 			continue;
// 		}

// 		// Move and sync nodes from left to right.
// 		if (aStartNode.key === bEndNode.key) {
// 			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			nextPos = bEnd + 1;
// 			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 			insertOrAppend(dom, bEndNode.dom, nextNode);
// 			aStart++;
// 			bEnd--;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break;
// 			}
// 			aStartNode = a[aStart];
// 			bEndNode = b[bEnd];
// 			continue;
// 		}
// 		break;
// 	}

// 	if (aStart > aEnd) {
// 		if (bStart <= bEnd) {
// 			nextPos = bEnd + 1;
// 			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 			while (bStart <= bEnd) {
// 				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), nextNode);
// 			}
// 		}
// 	} else if (bStart > bEnd) {
// 		while (aStart <= aEnd) {
// 			unmount(a[aStart++], dom, lifecycle, false, shallowUnmount);
// 		}
// 	} else {
// 		aLength = aEnd - aStart + 1;
// 		bLength = bEnd - bStart + 1;
// 		const aNullable: Array<VComponent | OptVElement | VElement | null> = a;
// 		const sources = new Array(bLength);

// 		// Mark all nodes as inserted.
// 		for (i = 0; i < bLength; i++) {
// 			sources[i] = -1;
// 		}
// 		let moved = false;
// 		let pos = 0;
// 		let patched = 0;

// 		if ((bLength <= 4) || (aLength * bLength <= 16)) {
// 			for (i = aStart; i <= aEnd; i++) {
// 				aNode = a[i];
// 				if (patched < bLength) {
// 					for (j = bStart; j <= bEnd; j++) {
// 						bNode = b[j];
// 						if (aNode.key === bNode.key) {
// 							sources[j - bStart] = i;

// 							if (pos > j) {
// 								moved = true;
// 							} else {
// 								pos = j;
// 							}
// 							patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 							patched++;
// 							aNullable[i] = null;
// 							break;
// 						}
// 					}
// 				}
// 			}
// 		} else {
// 			const keyIndex = new Map();

// 			for (i = bStart; i <= bEnd; i++) {
// 				node = b[i];
// 				keyIndex.set(node.key, i);
// 			}
// 			for (i = aStart; i <= aEnd; i++) {
// 				aNode = a[i];

// 				if (patched < bLength) {
// 					j = keyIndex.get(aNode.key);

// 					if (!isUndefined(j)) {
// 						bNode = b[j];
// 						sources[j - bStart] = i;
// 						if (pos > j) {
// 							moved = true;
// 						} else {
// 							pos = j;
// 						}
// 						patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 						patched++;
// 						aNullable[i] = null;
// 					}
// 				}
// 			}
// 		}
// 		if (aLength === a.length && patched === 0) {
// 			removeAllChildren(dom, a, lifecycle, shallowUnmount);
// 			while (bStart < bLength) {
// 				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), null);
// 			}
// 		} else {
// 			i = aLength - patched;
// 			while (i > 0) {
// 				aNode = aNullable[aStart++];
// 				if (!isNull(aNode)) {
// 					unmount(aNode, dom, lifecycle, false, shallowUnmount);
// 					i--;
// 				}
// 			}
// 			if (moved) {
// 				let seq = lis_algorithm(sources);
// 				j = seq.length - 1;
// 				for (i = bLength - 1; i >= 0; i--) {
// 					if (sources[i] === -1) {
// 						pos = i + bStart;
// 						node = b[pos];
// 						nextPos = pos + 1;
// 						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG, shallowUnmount), nextNode);
// 					} else {
// 						if (j < 0 || i !== seq[j]) {
// 							pos = i + bStart;
// 							node = b[pos];
// 							nextPos = pos + 1;
// 							nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 							insertOrAppend(dom, node.dom, nextNode);
// 						} else {
// 							j--;
// 						}
// 					}
// 				}
// 			} else if (patched !== bLength) {
// 				for (i = bLength - 1; i >= 0; i--) {
// 					if (sources[i] === -1) {
// 						pos = i + bStart;
// 						node = b[pos];
// 						nextPos = pos + 1;
// 						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG, shallowUnmount), nextNode);
// 					}
// 				}
// 			}
// 		}
// 	}
// }

// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
// function lis_algorithm(a) {
// 	let p = a.slice(0);
// 	let result: Array<any> = [];
// 	result.push(0);
// 	let i;
// 	let j;
// 	let u;
// 	let v;
// 	let c;

// 	for (i = 0; i < a.length; i++) {
// 		if (a[i] === -1) {
// 			continue;
// 		}

// 		j = result[result.length - 1];
// 		if (a[j] < a[i]) {
// 			p[i] = j;
// 			result.push(i);
// 			continue;
// 		}

// 		u = 0;
// 		v = result.length - 1;

// 		while (u < v) {
// 			c = ((u + v) / 2) | 0;
// 			if (a[result[c]] < a[i]) {
// 				u = c + 1;
// 			} else {
// 				v = c;
// 			}
// 		}

// 		if (a[i] < a[result[u]]) {
// 			if (u > 0) {
// 				p[i] = result[u - 1];
// 			}
// 			result[u] = i;
// 		}
// 	}

// 	u = result.length;
// 	v = result[u - 1];

// 	while (u-- > 0) {
// 		result[u] = v;
// 		v = p[v];
// 	}

// 	return result;
// }

// // returns true if a property has been applied that can't be cloned via elem.cloneNode()
export function patchProp(prop, lastValue, nextValue, dom, isSVG: boolean) {
	if (prop === 'children') {
		return;
	}
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
				if (isSVG) {
					dom.setAttribute('class', nextValue);
				} else {
					dom.className = nextValue;
				}

				return false;
			} else if (prop === 'style') {
				patchStyle(lastValue, nextValue, dom);
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

function patchProps(lastProps, nextProps, dom, lifecycle, context, isSVG) {
	lastProps = lastProps || {};
	nextProps = nextProps || {};

	for (let prop in nextProps) {
		const nextValue = nextProps[prop];
		const lastValue = lastProps[prop];

		if (isNullOrUndef(nextValue)) {
			removeProp(prop, dom);
		} else {
			patchProp(prop, lastValue, nextValue, dom, isSVG);
		}
	}
	for (let prop in lastProps) {
		if (isNullOrUndef(nextProps[prop])) {
			removeProp(prop, dom);
		}
	}
}

export function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndef(lastAttrValue)) {
		if (!isNullOrUndef(nextAttrValue)) {
			for (let style in nextAttrValue) {
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
		for (let style in nextAttrValue) {
			const value = nextAttrValue[style];

			if (isNumber(value) && !isUnitlessNumber[style]) {
				dom.style[style] = value + 'px';
			} else {
				dom.style[style] = value;
			}
		}
		for (let style in lastAttrValue) {
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
