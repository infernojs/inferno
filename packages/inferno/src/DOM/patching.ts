import {
	combineFrom,
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isNumber,
	isObject,
	isString,
	isStringOrNumber,
	isUndefined,
	LifecycleClass,
	NO_OP,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { options } from '../core/options';

import { Styles } from '../core/structures';
import { createTextVNode, createVoidVNode, directClone, isVNode, VNode } from '../core/VNodes';
import { booleanProps, delegatedEvents, isUnitlessNumber, namespaces, skipProps, strictProps } from './constants';
import { handleEvent } from './events/delegation';
import { mount, mountArrayChildren, mountComponent, mountElement, mountRef, mountText, mountVoid } from './mounting';
import { componentToDOMNodeMap } from './rendering';
import { unmount } from './unmounting';
import {
	appendChild,
	EMPTY_OBJ,
	insertOrAppend,
	isKeyed,
	removeAllChildren,
	replaceChild,
	replaceLastChildAndUnmount,
	replaceVNode,
	replaceWithNewNode,
	setTextContent,
	updateTextContent
} from './utils';
import { isControlledFormElement, processElement } from './wrappers/processElement';

export function patch(lastVNode: VNode, nextVNode: VNode, parentDom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
	if (lastVNode !== nextVNode) {
		const lastFlags = lastVNode.flags;
		const nextFlags = nextVNode.flags;

		if (nextFlags & VNodeFlags.Component) {
			if (lastFlags & VNodeFlags.Component) {
				patchComponent(
					lastVNode,
					nextVNode,
					parentDom,
					lifecycle,
					context,
					isSVG,
					nextFlags & VNodeFlags.ComponentClass,
					isRecycling
				);
			} else {
				replaceVNode(
					parentDom,
					mountComponent(
						nextVNode,
						null,
						lifecycle,
						context,
						isSVG,
						(nextFlags & VNodeFlags.ComponentClass) > 0
					),
					lastVNode,
					lifecycle,
					isRecycling
				);
			}
		} else if (nextFlags & VNodeFlags.Element) {
			if (lastFlags & VNodeFlags.Element) {
				patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
			} else {
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
					lifecycle,
					isRecycling
				);
			}
		} else if (nextFlags & VNodeFlags.Text) {
			if (lastFlags & VNodeFlags.Text) {
				patchText(lastVNode, nextVNode);
			} else {
				replaceVNode(parentDom, mountText(nextVNode, null), lastVNode, lifecycle, isRecycling);
			}
		} else if (nextFlags & VNodeFlags.Void) {
			if (lastFlags & VNodeFlags.Void) {
				patchVoid(lastVNode, nextVNode);
			} else {
				replaceVNode(parentDom, mountVoid(nextVNode, null), lastVNode, lifecycle, isRecycling);
			}
		} else {
			// Error case: mount new one replacing old one
			replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
		}
	}
}

function unmountChildren(children, dom: Element, lifecycle: LifecycleClass, isRecycling: boolean) {
	if (isVNode(children)) {
		unmount(children, dom, lifecycle, true, isRecycling);
	} else if (isArray(children)) {
		removeAllChildren(dom, children, lifecycle, isRecycling);
	} else {
		dom.textContent = '';
	}
}

export function patchElement(lastVNode: VNode, nextVNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
	const nextTag = nextVNode.type;
	const lastTag = lastVNode.type;

	if (lastTag !== nextTag) {
		replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
	} else {
		const dom = lastVNode.dom as Element;
		const lastProps = lastVNode.props;
		const nextProps = nextVNode.props;
		const lastChildren = lastVNode.children;
		const nextChildren = nextVNode.children;
		const lastFlags = lastVNode.flags;
		const nextFlags = nextVNode.flags;
		const nextRef = nextVNode.ref;
		const lastClassName = lastVNode.className;
		const nextClassName = nextVNode.className;

		nextVNode.dom = dom;
		isSVG = isSVG || (nextFlags & VNodeFlags.SvgElement) > 0;
		if (lastChildren !== nextChildren) {
			patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
		}

		// inlined patchProps  -- starts --
		if (lastProps !== nextProps) {
			const lastPropsOrEmpty = lastProps || EMPTY_OBJ;
			const nextPropsOrEmpty = nextProps || EMPTY_OBJ as any;
			let hasControlledValue = false;

			if (nextPropsOrEmpty !== EMPTY_OBJ) {
				const isFormElement = (nextFlags & VNodeFlags.FormElement) > 0;
				if (isFormElement) {
					hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
				}

				for (const prop in nextPropsOrEmpty) {
					// do not add a hasOwnProperty check here, it affects performance
					const nextValue = nextPropsOrEmpty[ prop ];
					const lastValue = lastPropsOrEmpty[ prop ];

					patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue);
				}

				if (isFormElement) {
					// When inferno is recycling form element, we need to process it like it would be mounting
					processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, isRecycling, hasControlledValue);
				}
			}
			if (lastPropsOrEmpty !== EMPTY_OBJ) {
				for (const prop in lastPropsOrEmpty) {
					// do not add a hasOwnProperty check here, it affects performance
					if (isNullOrUndef(nextPropsOrEmpty[ prop ])) {
						removeProp(prop, lastPropsOrEmpty[ prop ], dom);
					}
				}
			}
		}
		// inlined patchProps  -- ends --
		if (lastClassName !== nextClassName) {
			if (isNullOrUndef(nextClassName)) {
				dom.removeAttribute('class');
			} else {
				if (isSVG) {
					dom.setAttribute('class', nextClassName);
				} else {
					dom.className = nextClassName;
				}
			}
		}
		if (nextRef) {
			if (lastVNode.ref !== nextRef || isRecycling) {
				mountRef(dom as Element, nextRef, lifecycle);
			}
		}
	}
}

function patchChildren(lastFlags: VNodeFlags, nextFlags: VNodeFlags, lastChildren, nextChildren, dom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
	let patchArray = false;
	let patchKeyed = false;

	if (nextFlags & VNodeFlags.HasNonKeyedChildren) {
		patchArray = true;
	} else if ((lastFlags & VNodeFlags.HasKeyedChildren) > 0 && (nextFlags & VNodeFlags.HasKeyedChildren) > 0) {
		patchKeyed = true;
		patchArray = true;
	} else if (isInvalid(nextChildren)) {
		unmountChildren(lastChildren, dom, lifecycle, isRecycling);
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(dom, nextChildren);
		} else {
			if (isArray(nextChildren)) {
				mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
			} else {
				mount(nextChildren, dom, lifecycle, context, isSVG);
			}
		}
	} else if (isStringOrNumber(nextChildren)) {
		if (isStringOrNumber(lastChildren)) {
			updateTextContent(dom, nextChildren);
		} else {
			unmountChildren(lastChildren, dom, lifecycle, isRecycling);
			setTextContent(dom, nextChildren);
		}
	} else if (isArray(nextChildren)) {
		if (isArray(lastChildren)) {
			patchArray = true;
			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyed = true;
			}
		} else {
			unmountChildren(lastChildren, dom, lifecycle, isRecycling);
			mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
		}
	} else if (isArray(lastChildren)) {
		removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
		mount(nextChildren, dom, lifecycle, context, isSVG);
	} else if (isVNode(nextChildren)) {
		if (isVNode(lastChildren)) {
			patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
		} else {
			unmountChildren(lastChildren, dom, lifecycle, isRecycling);
			mount(nextChildren, dom, lifecycle, context, isSVG);
		}
	}
	if (patchArray) {
		if (patchKeyed) {
			patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
		} else {
			patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
		}
	}
}

export function patchComponent(lastVNode, nextVNode, parentDom, lifecycle: LifecycleClass, context, isSVG: boolean, isClass: number, isRecycling: boolean) {
	const lastType = lastVNode.type;
	const nextType = nextVNode.type;
	const lastKey = lastVNode.key;
	const nextKey = nextVNode.key;

	if (lastType !== nextType || lastKey !== nextKey) {
		replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
		return false;
	} else {
		const nextProps = nextVNode.props || EMPTY_OBJ;

		if (isClass) {
			const instance = lastVNode.children;
			instance._updating = true;

			if (instance._unmounted) {
				if (isNull(parentDom)) {
					return true;
				}
				replaceChild(
					parentDom,
					mountComponent(
						nextVNode,
						null,
						lifecycle,
						context,
						isSVG,
						(nextVNode.flags & VNodeFlags.ComponentClass) > 0
					),
					lastVNode.dom
				);
			} else {
				const hasComponentDidUpdate = !isUndefined(instance.componentDidUpdate);
				const nextState = instance.state;
				// When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
				const lastState = hasComponentDidUpdate ? combineFrom(nextState, null) : nextState;
				const lastProps = instance.props;
				let childContext;
				if (!isUndefined(instance.getChildContext)) {
					childContext = instance.getChildContext();
				}

				nextVNode.children = instance;
				instance._isSVG = isSVG;
				if (isNullOrUndef(childContext)) {
					childContext = context;
				} else {
					childContext = combineFrom(context, childContext);
				}
				const lastInput = instance._lastInput;
				let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false, false);
				let didUpdate = true;

				instance._childContext = childContext;
				if (isInvalid(nextInput)) {
					nextInput = createVoidVNode();
				} else if (nextInput === NO_OP) {
					nextInput = lastInput;
					didUpdate = false;
				} else if (isStringOrNumber(nextInput)) {
					nextInput = createTextVNode(nextInput, null);
				} else if (isArray(nextInput)) {
					if (process.env.NODE_ENV !== 'production') {
						throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
					}
					throwError();
				} else if (isObject(nextInput)) {
					if (!isNull((nextInput as VNode).dom)) {
						nextInput = directClone(nextInput as VNode);
					}
				}
				if (nextInput.flags & VNodeFlags.Component) {
					nextInput.parentVNode = nextVNode;
				} else if (lastInput.flags & VNodeFlags.Component) {
					lastInput.parentVNode = nextVNode;
				}
				instance._lastInput = nextInput;
				instance._vNode = nextVNode;
				if (didUpdate) {
					patch(lastInput, nextInput, parentDom, lifecycle, childContext, isSVG, isRecycling);
					if (hasComponentDidUpdate) {
						instance.componentDidUpdate(lastProps, lastState);
					}
					if (!isNull(options.afterUpdate)) {
						options.afterUpdate(nextVNode);
					}
					if (options.findDOMNodeEnabled) {
						componentToDOMNodeMap.set(instance, nextInput.dom);
					}
				}
				nextVNode.dom = nextInput.dom;
			}
			instance._updating = false;
		} else {
			let shouldUpdate = true;
			const lastProps = lastVNode.props;
			const nextHooks = nextVNode.ref;
			const nextHooksDefined = !isNullOrUndef(nextHooks);
			const lastInput = lastVNode.children;
			let nextInput = lastInput;

			nextVNode.dom = lastVNode.dom;
			nextVNode.children = lastInput;
			if (lastKey !== nextKey) {
				shouldUpdate = true;
			} else {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
					shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps, nextProps);
				}
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
					nextHooks.onComponentWillUpdate(lastProps, nextProps);
				}
				nextInput = nextType(nextProps, context);

				if (isInvalid(nextInput)) {
					nextInput = createVoidVNode();
				} else if (isStringOrNumber(nextInput) && nextInput !== NO_OP) {
					nextInput = createTextVNode(nextInput, null);
				} else if (isArray(nextInput)) {
					if (process.env.NODE_ENV !== 'production') {
						throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
					}
					throwError();
				} else if (isObject(nextInput)) {
					if (!isNull((nextInput as VNode).dom)) {
						nextInput = directClone((nextInput as VNode));
					}
				}
				if (nextInput !== NO_OP) {
					patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling);
					nextVNode.children = nextInput;
					if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
						nextHooks.onComponentDidUpdate(lastProps, nextProps);
					}
					nextVNode.dom = nextInput.dom;
				}
			}
			if (nextInput.flags & VNodeFlags.Component) {
				nextInput.parentVNode = nextVNode;
			} else if (lastInput.flags & VNodeFlags.Component) {
				lastInput.parentVNode = nextVNode;
			}
		}
	}
	return false;
}

export function patchText(lastVNode: VNode, nextVNode: VNode) {
	const nextText = nextVNode.children as string;
	const dom = lastVNode.dom as Element;

	nextVNode.dom = dom;

	if (lastVNode.children !== nextText) {
		dom.nodeValue = nextText;
	}
}

export function patchVoid(lastVNode: VNode, nextVNode: VNode) {
	nextVNode.dom = lastVNode.dom;
}

export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
	const lastChildrenLength = lastChildren.length;
	const nextChildrenLength = nextChildren.length;
	const commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	let i = 0;

	for (; i < commonLength; i++) {
		let nextChild = nextChildren[ i ];

		if (nextChild.dom) {
			nextChild = nextChildren[ i ] = directClone(nextChild);
		}
		patch(lastChildren[ i ], nextChild, dom, lifecycle, context, isSVG, isRecycling);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			let nextChild = nextChildren[ i ];

			if (nextChild.dom) {
				nextChild = nextChildren[ i ] = directClone(nextChild);
			}
			appendChild(dom, mount(nextChild, null, lifecycle, context, isSVG));
		}
	} else if (nextChildrenLength === 0) {
		removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[ i ], dom, lifecycle, false, isRecycling);
		}
	}
}

export function patchKeyedChildren(a: VNode[], b: VNode[], dom, lifecycle: LifecycleClass, context, isSVG: boolean, isRecycling: boolean) {
	let aLength = a.length;
	let bLength = b.length;
	let aEnd = aLength - 1;
	let bEnd = bLength - 1;
	let aStart = 0;
	let bStart = 0;
	let i;
	let j;
	let aNode;
	let bNode;
	let nextNode;
	let nextPos;
	let node;

	if (aLength === 0) {
		if (bLength > 0) {
			mountArrayChildren(b, dom, lifecycle, context, isSVG);
		}
		return;
	} else if (bLength === 0) {
		removeAllChildren(dom, a, lifecycle, isRecycling);
		return;
	}
	let aStartNode = a[ aStart ];
	let bStartNode = b[ bStart ];
	let aEndNode = a[ aEnd ];
	let bEndNode = b[ bEnd ];

	if (bStartNode.dom) {
		b[ bStart ] = bStartNode = directClone(bStartNode);
	}
	if (bEndNode.dom) {
		b[ bEnd ] = bEndNode = directClone(bEndNode);
	}
	// Step 1
	/* eslint no-constant-condition: 0 */
	outer: while (true) {
		// Sync nodes with the same key at the beginning.
		while (aStartNode.key === bStartNode.key) {
			patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
			aStart++;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aStartNode = a[ aStart ];
			bStartNode = b[ bStart ];
			if (bStartNode.dom) {
				b[ bStart ] = bStartNode = directClone(bStartNode);
			}
		}

		// Sync nodes with the same key at the end.
		while (aEndNode.key === bEndNode.key) {
			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
			aEnd--;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aEndNode = a[ aEnd ];
			bEndNode = b[ bEnd ];
			if (bEndNode.dom) {
				b[ bEnd ] = bEndNode = directClone(bEndNode);
			}
		}

		// Move and sync nodes from right to left.
		if (aEndNode.key === bStartNode.key) {
			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
			insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
			aEnd--;
			bStart++;
			aEndNode = a[ aEnd ];
			bStartNode = b[ bStart ];
			if (bStartNode.dom) {
				b[ bStart ] = bStartNode = directClone(bStartNode);
			}
			continue;
		}

		// Move and sync nodes from left to right.
		if (aStartNode.key === bEndNode.key) {
			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[ nextPos ].dom : null;
			insertOrAppend(dom, bEndNode.dom, nextNode);
			aStart++;
			bEnd--;
			aStartNode = a[ aStart ];
			bEndNode = b[ bEnd ];
			if (bEndNode.dom) {
				b[ bEnd ] = bEndNode = directClone(bEndNode);
			}
			continue;
		}
		break;
	}

	if (aStart > aEnd) {
		if (bStart <= bEnd) {
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[ nextPos ].dom : null;
			while (bStart <= bEnd) {
				node = b[ bStart ];
				if (node.dom) {
					b[ bStart ] = node = directClone(node);
				}
				bStart++;
				insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
			}
		}
	} else if (bStart > bEnd) {
		while (aStart <= aEnd) {
			unmount(a[ aStart++ ], dom, lifecycle, false, isRecycling);
		}
	} else {
		aLength = aEnd - aStart + 1;
		bLength = bEnd - bStart + 1;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		for (i = 0; i < bLength; i++) {
			sources[ i ] = -1;
		}
		let moved = false;
		let pos = 0;
		let patched = 0;

		// When sizes are small, just loop them through
		if ((bLength <= 4) || (aLength * bLength <= 16)) {
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[ i ];
				if (patched < bLength) {
					for (j = bStart; j <= bEnd; j++) {
						bNode = b[ j ];
						if (aNode.key === bNode.key) {
							sources[ j - bStart ] = i;

							if (pos > j) {
								moved = true;
							} else {
								pos = j;
							}
							if (bNode.dom) {
								b[ j ] = bNode = directClone(bNode);
							}
							patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
							patched++;
							a[ i ] = null as any;
							break;
						}
					}
				}
			}
		} else {
			const keyIndex = new Map();

			// Map keys by their index in array
			for (i = bStart; i <= bEnd; i++) {
				keyIndex.set(b[ i ].key, i);
			}

			// Try to patch same keys
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[ i ];

				if (patched < bLength) {
					j = keyIndex.get(aNode.key);

					if (!isUndefined(j)) {
						bNode = b[ j ];
						sources[ j - bStart ] = i;
						if (pos > j) {
							moved = true;
						} else {
							pos = j;
						}
						if (bNode.dom) {
							b[ j ] = bNode = directClone(bNode);
						}
						patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
						patched++;
						a[ i ] = null as any;
					}
				}
			}
		}
		// fast-path: if nothing patched remove all old and add all new
		if (aLength === a.length && patched === 0) {
			removeAllChildren(dom, a, lifecycle, isRecycling);
			while (bStart < bLength) {
				node = b[ bStart ];
				if (node.dom) {
					b[ bStart ] = node = directClone(node);
				}
				bStart++;
				insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), null);
			}
		} else {
			i = aLength - patched;
			while (i > 0) {
				aNode = a[ aStart++ ];
				if (!isNull(aNode)) {
					unmount(aNode, dom, lifecycle, true, isRecycling);
					i--;
				}
			}
			if (moved) {
				const seq = lis_algorithm(sources);
				j = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[ i ] === -1) {
						pos = i + bStart;
						node = b[ pos ];
						if (node.dom) {
							b[ pos ] = node = directClone(node);
						}
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[ nextPos ].dom : null;
						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
					} else {
						if (j < 0 || i !== seq[ j ]) {
							pos = i + bStart;
							node = b[ pos ];
							nextPos = pos + 1;
							nextNode = nextPos < b.length ? b[ nextPos ].dom : null;
							insertOrAppend(dom, node.dom, nextNode);
						} else {
							j--;
						}
					}
				}
			} else if (patched !== bLength) {
				// when patched count doesn't match b length we need to insert those new ones
				// loop backwards so we can use insertBefore
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[ i ] === -1) {
						pos = i + bStart;
						node = b[ pos ];
						if (node.dom) {
							b[ pos ] = node = directClone(node);
						}
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[ nextPos ].dom : null;
						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
					}
				}
			}
		}
	}
}

// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(arr: number[]): number[] {
	const p = arr.slice(0);
	const result: number[] = [ 0 ];
	let i;
	let j;
	let u;
	let v;
	let c;
	const len = arr.length;

	for (i = 0; i < len; i++) {
		const arrI = arr[ i ];

		if (arrI === -1) {
			continue;
		}

		j = result[ result.length - 1 ];
		if (arr[ j ] < arrI) {
			p[ i ] = j;
			result.push(i);
			continue;
		}

		u = 0;
		v = result.length - 1;

		while (u < v) {
			c = ((u + v) / 2) | 0;
			if (arr[ result[ c ] ] < arrI) {
				u = c + 1;
			} else {
				v = c;
			}
		}

		if (arrI < arr[ result[ u ] ]) {
			if (u > 0) {
				p[ i ] = result[ u - 1 ];
			}
			result[ u ] = i;
		}
	}

	u = result.length;
	v = result[ u - 1 ];

	while (u-- > 0) {
		result[ u ] = v;
		v = p[ v ];
	}

	return result;
}

export function isAttrAnEvent(attr: string): boolean {
	return attr[ 0 ] === 'o' && attr[ 1 ] === 'n';
}

export function patchProp(prop, lastValue, nextValue, dom: Element, isSVG: boolean, hasControlledValue: boolean) {
	if (lastValue !== nextValue) {
		if (skipProps.has(prop) || (hasControlledValue && prop === 'value')) {
			return;
		} else if (booleanProps.has(prop)) {
			prop = prop === 'autoFocus' ? prop.toLowerCase() : prop;
			dom[ prop ] = !!nextValue;
		} else if (strictProps.has(prop)) {
			const value = isNullOrUndef(nextValue) ? '' : nextValue;

			if (dom[ prop ] !== value) {
				dom[ prop ] = value;
			}
		} else if (isAttrAnEvent(prop)) {
			patchEvent(prop, lastValue, nextValue, dom);
		} else if (isNullOrUndef(nextValue)) {
			dom.removeAttribute(prop);
		} else if (prop === 'style') {
			patchStyle(lastValue, nextValue, dom);
		} else if (prop === 'dangerouslySetInnerHTML') {
			const lastHtml = lastValue && lastValue.__html;
			const nextHtml = nextValue && nextValue.__html;

			if (lastHtml !== nextHtml) {
				if (!isNullOrUndef(nextHtml)) {
					dom.innerHTML = nextHtml;
				}
			}
		} else {
			// We optimize for NS being boolean. Its 99.9% time false
			if (isSVG && namespaces.has(prop)) {
				// If we end up in this path we can read property again
				dom.setAttributeNS(namespaces.get(prop) as string, prop, nextValue);
			} else {
				dom.setAttribute(prop, nextValue);
			}
		}
	}
}

export function patchEvent(name: string, lastValue, nextValue, dom) {
	if (lastValue !== nextValue) {
		if (delegatedEvents.has(name)) {
			handleEvent(name, lastValue, nextValue, dom);
		} else {
			const nameLowerCase = name.toLowerCase();
			const domEvent = dom[ nameLowerCase ];
			// if the function is wrapped, that means it's been controlled by a wrapper
			if (domEvent && domEvent.wrapped) {
				return;
			}
			if (!isFunction(nextValue) && !isNullOrUndef(nextValue)) {
				const linkEvent = nextValue.event;

				if (linkEvent && isFunction(linkEvent)) {
					dom[ nameLowerCase ] = function(e) {
						linkEvent(nextValue.data, e);
					};
				} else {
					if (process.env.NODE_ENV !== 'production') {
						throwError(`an event on a VNode "${ name }". was not a function or a valid linkEvent.`);
					}
					throwError();
				}
			} else {
				dom[ nameLowerCase ] = nextValue;
			}
		}
	}
}

// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
export function patchStyle(lastAttrValue: string | Styles, nextAttrValue: string | Styles, dom) {
	const domStyle = dom.style;

	if (isString(nextAttrValue)) {
		domStyle.cssText = nextAttrValue;
		return;
	}

	for (const style in nextAttrValue as Styles) {
		// do not add a hasOwnProperty check here, it affects performance
		const value = nextAttrValue[ style ];

		if (!isNumber(value) || isUnitlessNumber.has(style)) {
			domStyle[ style ] = value;
		} else {
			domStyle[ style ] = value + 'px';
		}
	}

	if (!isNullOrUndef(lastAttrValue)) {
		for (const style in lastAttrValue as Styles) {
			if (isNullOrUndef(nextAttrValue[ style ])) {
				domStyle[ style ] = '';
			}
		}
	}
}

function removeProp(prop: string, lastValue, dom) {
	if (prop === 'value') {
		dom.value = '';
	} else if (prop === 'style') {
		dom.removeAttribute('style');
	} else if (isAttrAnEvent(prop)) {
		handleEvent(prop, lastValue, null, dom);
	} else {
		dom.removeAttribute(prop);
	}
}
