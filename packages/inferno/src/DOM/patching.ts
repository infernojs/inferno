import { combineFrom, isFunction, isInvalid, isNull, isNullOrUndef } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVoidVNode, directClone, normalizeRoot } from '../core/implementation';
import { VNode } from '../core/types';
import { mount, mountArrayChildren } from './mounting';
import { clearDOM, remove, removeAllChildren, unmount, unmountAllChildren } from './unmounting';
import {
  appendChild,
  createDerivedState,
  EMPTY_OBJ,
  findDOMfromVNode,
  moveVNodeDOM,
  options,
  removeChild,
  removeVNodeDOM,
  replaceChild,
  setTextContent
} from './utils/common';
import { isControlledFormElement, processElement } from './wrappers/processElement';
import { patchProp } from './props';
import { renderNewInput } from './utils/componentUtil';
import { validateKeys } from '../core/validate';
import { mountRef, unmountRef } from '../core/refs';

function replaceWithNewNode(lastVNode, nextVNode, parentDOM: Element, context: Object, isSVG: boolean, lifecycle: Function[]) {
  unmount(lastVNode);

  if ((nextVNode.flags & lastVNode.flags & VNodeFlags.DOMRef) !== 0) {
    mount(nextVNode, null, context, isSVG, null, lifecycle);
    // Single DOM operation, when we have dom references available
    replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
  } else {
    mount(nextVNode, parentDOM, context, isSVG, findDOMfromVNode(lastVNode, true), lifecycle);
    removeVNodeDOM(lastVNode, parentDOM);
  }
}

export function patch(
  lastVNode: VNode,
  nextVNode: VNode,
  parentDOM: Element,
  context: Object,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Function[]
) {
  const nextFlags = (nextVNode.flags |= VNodeFlags.InUse);

  if (process.env.NODE_ENV !== 'production') {
    if (isFunction(options.componentComparator) && lastVNode.flags & nextFlags & VNodeFlags.ComponentClass) {
      if ((options.componentComparator as Function)(lastVNode, nextVNode) === false) {
        patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
        return;
      }
    }
  }

  if (lastVNode.flags !== nextFlags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key || nextFlags & VNodeFlags.ReCreate) {
    if (lastVNode.flags & VNodeFlags.InUse) {
      replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle);
    } else {
      // Last vNode is not in use, it has crashed at application level. Just mount nextVNode and ignore last one
      mount(nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
    }
  } else if (nextFlags & VNodeFlags.Element) {
    patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle);
  } else if (nextFlags & VNodeFlags.ComponentClass) {
    patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (nextFlags & VNodeFlags.ComponentFunction) {
    patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (nextFlags & VNodeFlags.Text) {
    patchText(lastVNode, nextVNode);
  } else if (nextFlags & VNodeFlags.Void) {
    nextVNode.dom = lastVNode.dom;
  } else if (nextFlags & VNodeFlags.Fragment) {
    patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle);
  } else {
    patchPortal(lastVNode, nextVNode, context, lifecycle);
  }
}

export function patchSingleTextChild(lastChildren, nextChildren, parentDOM: Element) {
  if (lastChildren !== nextChildren) {
    if (lastChildren !== '') {
      (parentDOM.firstChild as Node).nodeValue = nextChildren;
    } else {
      setTextContent(parentDOM, nextChildren);
    }
  }
}

function patchContentEditableChildren(dom, nextChildren) {
  if (dom.textContent !== nextChildren) {
    dom.textContent = nextChildren;
  }
}

function patchFragment(lastVNode: VNode, nextVNode: VNode, parentDOM: Element, context: Object, isSVG: boolean, lifecycle: Function[]) {
  const lastChildren = lastVNode.children as VNode[];
  let nextChildren = nextVNode.children as any;
  const lastChildFlags = lastVNode.childFlags;
  let nextChildFlags = nextVNode.childFlags;
  let nextNode: Element | null = null;

  // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
  // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
  if (nextChildFlags & ChildFlags.MultipleChildren && nextChildren.length === 0) {
    nextChildFlags = nextVNode.childFlags = ChildFlags.HasVNodeChildren;
    nextChildren = nextVNode.children = createVoidVNode();
  }

  const nextIsSingle: boolean = (nextChildFlags & ChildFlags.HasVNodeChildren) !== 0;

  if (lastChildFlags & ChildFlags.MultipleChildren) {
    const lastLen = lastChildren.length;

    // We need to know Fragment's edge node when
    if (
      // It uses keyed algorithm
      (lastChildFlags & ChildFlags.HasKeyedChildren && nextChildFlags & ChildFlags.HasKeyedChildren) ||
      // It transforms from many to single
      nextIsSingle ||
      // It will append more nodes
      (!nextIsSingle && (nextChildren as VNode[]).length > lastLen)
    ) {
      // When fragment has multiple children there is always at least one vNode
      nextNode = (findDOMfromVNode(lastChildren[lastLen - 1], false) as Element).nextSibling as Element | null;
    }
  }

  patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lastVNode, lifecycle);
}

function patchPortal(lastVNode: VNode, nextVNode: VNode, context, lifecycle: Function[]) {
  const lastContainer = lastVNode.ref as Element;
  const nextContainer = nextVNode.ref as Element;
  const nextChildren = nextVNode.children as VNode;

  patchChildren(
    lastVNode.childFlags,
    nextVNode.childFlags,
    lastVNode.children as VNode,
    nextChildren,
    lastContainer as Element,
    context,
    false,
    null,
    lastVNode,
    lifecycle
  );

  nextVNode.dom = lastVNode.dom;

  if (lastContainer !== nextContainer && !isInvalid(nextChildren)) {
    const node = nextChildren.dom as Element;

    removeChild(lastContainer, node);
    appendChild(nextContainer, node);
  }
}

export function patchElement(lastVNode: VNode, nextVNode: VNode, context: Object, isSVG: boolean, nextFlags: VNodeFlags, lifecycle: Function[]) {
  const dom = (nextVNode.dom = lastVNode.dom as Element);
  const lastProps = lastVNode.props;
  const nextProps = nextVNode.props;
  let isFormElement = false;
  let hasControlledValue = false;
  let nextPropsOrEmpty;

  isSVG = isSVG || (nextFlags & VNodeFlags.SvgElement) > 0;

  // inlined patchProps  -- starts --
  if (lastProps !== nextProps) {
    const lastPropsOrEmpty = lastProps || EMPTY_OBJ;
    nextPropsOrEmpty = nextProps || EMPTY_OBJ;

    if (nextPropsOrEmpty !== EMPTY_OBJ) {
      isFormElement = (nextFlags & VNodeFlags.FormElement) > 0;
      if (isFormElement) {
        hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
      }

      for (const prop in nextPropsOrEmpty) {
        const lastValue = lastPropsOrEmpty[prop];
        const nextValue = nextPropsOrEmpty[prop];
        if (lastValue !== nextValue) {
          patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode);
        }
      }
    }
    if (lastPropsOrEmpty !== EMPTY_OBJ) {
      for (const prop in lastPropsOrEmpty) {
        if (isNullOrUndef(nextPropsOrEmpty[prop]) && !isNullOrUndef(lastPropsOrEmpty[prop])) {
          patchProp(prop, lastPropsOrEmpty[prop], null, dom, isSVG, hasControlledValue, lastVNode);
        }
      }
    }
  }
  const nextChildren = nextVNode.children;
  const nextClassName = nextVNode.className;

  // inlined patchProps  -- ends --
  if (lastVNode.className !== nextClassName) {
    if (isNullOrUndef(nextClassName)) {
      dom.removeAttribute('class');
    } else if (isSVG) {
      dom.setAttribute('class', nextClassName);
    } else {
      dom.className = nextClassName;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    validateKeys(nextVNode);
  }
  if (nextFlags & VNodeFlags.ContentEditable) {
    patchContentEditableChildren(dom, nextChildren);
  } else {
    patchChildren(
      lastVNode.childFlags,
      nextVNode.childFlags,
      lastVNode.children,
      nextChildren,
      dom,
      context,
      isSVG && nextVNode.type !== 'foreignObject',
      null,
      lastVNode,
      lifecycle
    );
  }

  if (isFormElement) {
    processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, false, hasControlledValue);
  }

  const nextRef = nextVNode.ref;
  const lastRef = lastVNode.ref;

  if (lastRef !== nextRef) {
    unmountRef(lastRef);
    mountRef(nextRef, dom, lifecycle);
  }
}

function replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG: boolean, lifecycle: Function[]) {
  unmount(lastChildren);

  mountArrayChildren(nextChildren, parentDOM, context, isSVG, findDOMfromVNode(lastChildren, true), lifecycle);

  removeVNodeDOM(lastChildren, parentDOM);
}

function patchChildren(
  lastChildFlags: ChildFlags,
  nextChildFlags: ChildFlags,
  lastChildren,
  nextChildren,
  parentDOM: Element,
  context: Object,
  isSVG: boolean,
  nextNode: Element | null,
  parentVNode: VNode,
  lifecycle: Function[]
) {
  switch (lastChildFlags) {
    case ChildFlags.HasVNodeChildren:
      switch (nextChildFlags) {
        case ChildFlags.HasVNodeChildren:
          patch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
          break;
        case ChildFlags.HasInvalidChildren:
          remove(lastChildren, parentDOM);
          break;
        case ChildFlags.HasTextChildren:
          unmount(lastChildren);
          setTextContent(parentDOM, nextChildren);
          break;
        default:
          replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle);
          break;
      }
      break;
    case ChildFlags.HasInvalidChildren:
      switch (nextChildFlags) {
        case ChildFlags.HasVNodeChildren:
          mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
          break;
        case ChildFlags.HasInvalidChildren:
          break;
        case ChildFlags.HasTextChildren:
          setTextContent(parentDOM, nextChildren);
          break;
        default:
          mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
          break;
      }
      break;
    case ChildFlags.HasTextChildren:
      switch (nextChildFlags) {
        case ChildFlags.HasTextChildren:
          patchSingleTextChild(lastChildren, nextChildren, parentDOM);
          break;
        case ChildFlags.HasVNodeChildren:
          clearDOM(parentDOM);
          mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
          break;
        case ChildFlags.HasInvalidChildren:
          clearDOM(parentDOM);
          break;
        default:
          clearDOM(parentDOM);
          mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
          break;
      }
      break;
    default:
      switch (nextChildFlags) {
        case ChildFlags.HasTextChildren:
          unmountAllChildren(lastChildren);
          setTextContent(parentDOM, nextChildren);
          break;
        case ChildFlags.HasVNodeChildren:
          removeAllChildren(parentDOM, parentVNode, lastChildren);
          mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
          break;
        case ChildFlags.HasInvalidChildren:
          removeAllChildren(parentDOM, parentVNode, lastChildren);
          break;
        default:
          const lastLength = lastChildren.length | 0;
          const nextLength = nextChildren.length | 0;

          // Fast path's for both algorithms
          if (lastLength === 0) {
            if (nextLength > 0) {
              mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            }
          } else if (nextLength === 0) {
            removeAllChildren(parentDOM, parentVNode, lastChildren);
          } else if (nextChildFlags === ChildFlags.HasKeyedChildren && lastChildFlags === ChildFlags.HasKeyedChildren) {
            patchKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, parentVNode, lifecycle);
          } else {
            patchNonKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, lifecycle);
          }
          break;
      }
      break;
  }
}

function createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle) {
  lifecycle.push(() => {
    instance.componentDidUpdate(lastProps, lastState, snapshot);
  });
}

export function updateClassComponent(
  instance,
  nextState,
  nextProps,
  parentDOM: Element,
  context,
  isSVG: boolean,
  force: boolean,
  nextNode: Element | null,
  lifecycle: Function[]
) {
  const lastState = instance.state;
  const lastProps = instance.props;
  const usesNewAPI = Boolean(instance.$N);
  const hasSCU = isFunction(instance.shouldComponentUpdate);

  if (usesNewAPI) {
    nextState = createDerivedState(instance, nextProps, nextState !== lastState ? combineFrom(lastState, nextState) : nextState);
  }

  if (force || !hasSCU || (hasSCU && (instance.shouldComponentUpdate as Function)(nextProps, nextState, context))) {
    if (!usesNewAPI && isFunction(instance.componentWillUpdate)) {
      instance.componentWillUpdate(nextProps, nextState, context);
    }

    instance.props = nextProps;
    instance.state = nextState;
    instance.context = context;
    let snapshot = null;
    const nextInput = renderNewInput(instance, nextProps, context);

    if (usesNewAPI && isFunction(instance.getSnapshotBeforeUpdate)) {
      snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
    }

    patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);

    // Dont update Last input, until patch has been succesfully executed
    instance.$LI = nextInput;

    if (isFunction(instance.componentDidUpdate)) {
      createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle);
    }
  } else {
    instance.props = nextProps;
    instance.state = nextState;
    instance.context = context;
  }
}

function patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]) {
  const instance = (nextVNode.children = lastVNode.children);
  // If Component has crashed, ignore it to stay functional
  if (isNull(instance)) {
    return;
  }

  instance.$L = lifecycle;
  const nextProps = nextVNode.props || EMPTY_OBJ;
  const nextRef = nextVNode.ref;
  const lastRef = lastVNode.ref;
  let nextState = instance.state;

  if (!instance.$N) {
    if (isFunction(instance.componentWillReceiveProps)) {
      instance.$BR = true;
      instance.componentWillReceiveProps(nextProps, context);
      // If instance component was removed during its own update do nothing.
      if (instance.$UN) {
        return;
      }
      instance.$BR = false;
    }
    if (!isNull(instance.$PS)) {
      nextState = combineFrom(nextState, instance.$PS) as any;
      instance.$PS = null;
    }
  }

  updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, false, nextNode, lifecycle);

  if (lastRef !== nextRef) {
    unmountRef(lastRef);
    mountRef(nextRef, instance, lifecycle);
  }
}

function patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]) {
  let shouldUpdate: boolean = true;
  const nextProps = nextVNode.props || EMPTY_OBJ;
  const nextRef = nextVNode.ref;
  const lastProps = lastVNode.props;
  const nextHooksDefined = !isNullOrUndef(nextRef);
  const lastInput = lastVNode.children;

  if (nextHooksDefined && isFunction(nextRef.onComponentShouldUpdate)) {
    shouldUpdate = nextRef.onComponentShouldUpdate(lastProps, nextProps);
  }

  if (shouldUpdate !== false) {
    if (nextHooksDefined && isFunction(nextRef.onComponentWillUpdate)) {
      nextRef.onComponentWillUpdate(lastProps, nextProps);
    }
    const type = nextVNode.type;
    const nextInput = normalizeRoot(nextVNode.flags & VNodeFlags.ForwardRef ? type.render(nextProps, nextRef, context) : type(nextProps, context));

    patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle);
    nextVNode.children = nextInput;
    if (nextHooksDefined && isFunction(nextRef.onComponentDidUpdate)) {
      nextRef.onComponentDidUpdate(lastProps, nextProps);
    }
  } else {
    nextVNode.children = lastInput;
  }
}

function patchText(lastVNode: VNode, nextVNode: VNode) {
  const nextText = nextVNode.children as string;
  const dom = (nextVNode.dom = lastVNode.dom);

  if (nextText !== lastVNode.children) {
    (dom as Element).nodeValue = nextText;
  }
}

function patchNonKeyedChildren(
  lastChildren,
  nextChildren,
  dom,
  context: Object,
  isSVG: boolean,
  lastChildrenLength: number,
  nextChildrenLength: number,
  nextNode: Element | null,
  lifecycle: Function[]
) {
  const commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
  let i = 0;
  let nextChild;
  let lastChild;

  for (; i < commonLength; ++i) {
    nextChild = nextChildren[i];
    lastChild = lastChildren[i];

    if (nextChild.flags & VNodeFlags.InUse) {
      nextChild = nextChildren[i] = directClone(nextChild);
    }

    patch(lastChild, nextChild, dom, context, isSVG, nextNode, lifecycle);
    lastChildren[i] = nextChild;
  }
  if (lastChildrenLength < nextChildrenLength) {
    for (i = commonLength; i < nextChildrenLength; ++i) {
      nextChild = nextChildren[i];

      if (nextChild.flags & VNodeFlags.InUse) {
        nextChild = nextChildren[i] = directClone(nextChild);
      }
      mount(nextChild, dom, context, isSVG, nextNode, lifecycle);
    }
  } else if (lastChildrenLength > nextChildrenLength) {
    for (i = commonLength; i < lastChildrenLength; ++i) {
      remove(lastChildren[i], dom);
    }
  }
}

function patchKeyedChildren(
  a: VNode[],
  b: VNode[],
  dom,
  context,
  isSVG: boolean,
  aLength: number,
  bLength: number,
  outerEdge: Element | null,
  parentVNode: VNode,
  lifecycle: Function[]
) {
  let aEnd = aLength - 1;
  let bEnd = bLength - 1;
  let j: number = 0;
  let aNode: VNode = a[j];
  let bNode: VNode = b[j];
  let nextPos: number;
  let nextNode;

  // Step 1
  // tslint:disable-next-line
  outer: {
    // Sync nodes with the same key at the beginning.
    while (aNode.key === bNode.key) {
      if (bNode.flags & VNodeFlags.InUse) {
        b[j] = bNode = directClone(bNode);
      }
      patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
      a[j] = bNode;
      ++j;
      if (j > aEnd || j > bEnd) {
        break outer;
      }
      aNode = a[j];
      bNode = b[j];
    }

    aNode = a[aEnd];
    bNode = b[bEnd];

    // Sync nodes with the same key at the end.
    while (aNode.key === bNode.key) {
      if (bNode.flags & VNodeFlags.InUse) {
        b[bEnd] = bNode = directClone(bNode);
      }
      patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
      a[aEnd] = bNode;
      aEnd--;
      bEnd--;
      if (j > aEnd || j > bEnd) {
        break outer;
      }
      aNode = a[aEnd];
      bNode = b[bEnd];
    }
  }

  if (j > aEnd) {
    if (j <= bEnd) {
      nextPos = bEnd + 1;
      nextNode = nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge;

      while (j <= bEnd) {
        bNode = b[j];
        if (bNode.flags & VNodeFlags.InUse) {
          b[j] = bNode = directClone(bNode);
        }
        ++j;
        mount(bNode, dom, context, isSVG, nextNode, lifecycle);
      }
    }
  } else if (j > bEnd) {
    while (j <= aEnd) {
      remove(a[j++], dom);
    }
  } else {
    patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle);
  }
}

function patchKeyedChildrenComplex(
  a: VNode[],
  b: VNode[],
  context,
  aLength: number,
  bLength: number,
  aEnd: number,
  bEnd: number,
  j: number,
  dom: Element,
  isSVG: boolean,
  outerEdge: Element | null,
  parentVNode: VNode,
  lifecycle: Function[]
) {
  let aNode: VNode;
  let bNode: VNode;
  let nextPos: number;
  let i: number = 0;
  let aStart: number = j;
  const bStart: number = j;
  const aLeft: number = aEnd - j + 1;
  const bLeft: number = bEnd - j + 1;
  const sources = new Int32Array(bLeft + 1);
  // Keep track if its possible to remove whole DOM using textContent = '';
  let canRemoveWholeContent: boolean = aLeft === aLength;
  let moved: boolean = false;
  let pos: number = 0;
  let patched: number = 0;

  // When sizes are small, just loop them through
  if (bLength < 4 || (aLeft | bLeft) < 32) {
    for (i = aStart; i <= aEnd; ++i) {
      aNode = a[i];
      if (patched < bLeft) {
        for (j = bStart; j <= bEnd; j++) {
          bNode = b[j];
          if (aNode.key === bNode.key) {
            sources[j - bStart] = i + 1;
            if (canRemoveWholeContent) {
              canRemoveWholeContent = false;
              while (aStart < i) {
                remove(a[aStart++], dom);
              }
            }
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            if (bNode.flags & VNodeFlags.InUse) {
              b[j] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
            ++patched;
            break;
          }
        }
        if (!canRemoveWholeContent && j > bEnd) {
          remove(aNode, dom);
        }
      } else if (!canRemoveWholeContent) {
        remove(aNode, dom);
      }
    }
  } else {
    const keyIndex: Record<string, number> = {};

    // Map keys by their index
    for (i = bStart; i <= bEnd; ++i) {
      keyIndex[b[i].key as string | number] = i;
    }

    // Try to patch same keys
    for (i = aStart; i <= aEnd; ++i) {
      aNode = a[i];

      if (patched < bLeft) {
        j = keyIndex[aNode.key as string | number];

        if (j !== void 0) {
          if (canRemoveWholeContent) {
            canRemoveWholeContent = false;
            while (i > aStart) {
              remove(a[aStart++], dom);
            }
          }
          sources[j - bStart] = i + 1;
          if (pos > j) {
            moved = true;
          } else {
            pos = j;
          }
          bNode = b[j];
          if (bNode.flags & VNodeFlags.InUse) {
            b[j] = bNode = directClone(bNode);
          }
          patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
          ++patched;
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom);
        }
      } else if (!canRemoveWholeContent) {
        remove(aNode, dom);
      }
    }
  }
  // fast-path: if nothing patched remove all old and add all new
  if (canRemoveWholeContent) {
    removeAllChildren(dom, parentVNode, a);
    mountArrayChildren(b, dom, context, isSVG, outerEdge, lifecycle);
  } else if (moved) {
    const seq = lis_algorithm(sources);
    j = seq.length - 1;
    for (i = bLeft - 1; i >= 0; i--) {
      if (sources[i] === 0) {
        pos = i + bStart;
        bNode = b[pos];
        if (bNode.flags & VNodeFlags.InUse) {
          b[pos] = bNode = directClone(bNode);
        }
        nextPos = pos + 1;
        mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle);
      } else if (j < 0 || i !== seq[j]) {
        pos = i + bStart;
        bNode = b[pos];
        nextPos = pos + 1;

        moveVNodeDOM(bNode, dom, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge);
      } else {
        j--;
      }
    }
  } else if (patched !== bLeft) {
    // when patched count doesn't match b length we need to insert those new ones
    // loop backwards so we can use insertBefore
    for (i = bLeft - 1; i >= 0; i--) {
      if (sources[i] === 0) {
        pos = i + bStart;
        bNode = b[pos];
        if (bNode.flags & VNodeFlags.InUse) {
          b[pos] = bNode = directClone(bNode);
        }
        nextPos = pos + 1;
        mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle);
      }
    }
  }
}

let result: Int32Array;
let p: Int32Array;
let maxLen = 0;
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence

function lis_algorithm(arr: Int32Array): Int32Array {
  let arrI = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let u = 0;
  let v = 0;
  let c = 0;
  const len = arr.length;

  if (len > maxLen) {
    maxLen = len;
    result = new Int32Array(len);
    p = new Int32Array(len);
  }

  for (; i < len; ++i) {
    arrI = arr[i];

    if (arrI !== 0) {
      j = result[k];
      if (arr[j] < arrI) {
        p[i] = j;
        result[++k] = i;
        continue;
      }

      u = 0;
      v = k;

      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }

  u = k + 1;
  const seq = new Int32Array(u);
  v = result[u - 1];

  while (u-- > 0) {
    seq[u] = v;
    v = p[v];
    result[u] = 0;
  }

  return seq;
}
