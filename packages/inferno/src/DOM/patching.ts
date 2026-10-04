import type { ContextObject, VNode } from '../core/types';
import { isFunction, isInvalid, isNull, isNullOrUndef } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import {
  createVoidVNode,
  directClone,
  mustCloneVNode,
  normalizeRoot,
} from '../core/implementation';
import type { Component } from './../core/component';
import { mount, mountArrayChildren } from './mounting';
import {
  remove,
  removeAllChildren,
  unmount,
  unmountAllChildren,
} from './unmounting';
import {
  type AnimationQueues,
  NO_ANIMATIONS,
  activeMoveAnimations,
  moveAnimations,
  appendVNodeDOM,
  createDerivedState,
  EMPTY_OBJ,
  findDOMFromVNode,
  moveVNodeDOM,
  removeVNodeDOM,
  replaceChild,
  setTextContent,
  updateMoveHooks,
} from './utils/common';
import {
  isControlledFormElement,
  processElement,
} from './wrappers/processElement';
import { patchProp } from './props';
import {
  renderFunctionalComponent,
  renderNewInput,
} from './utils/componentUtil';
import { validateKeys } from '../core/validate';
import { mountRef, unmountRef } from '../core/refs';

function replaceWithNewNode(
  lastVNode,
  nextVNode,
  parentDOM: Element,
  context: ContextObject,
  isSVG: boolean,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  unmount(lastVNode, animations);

  // One replaceChild, unless leave hooks inside lastVNode have to animate out before its removal
  if (
    nextVNode.flags & lastVNode.flags & VNodeFlags.DOMRef &&
    animations.componentWillDisappear === null
  ) {
    mount(nextVNode, null, context, isSVG, null, lifecycle, animations);
    // Single DOM operation, when we have dom references available
    replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
  } else {
    mount(
      nextVNode,
      parentDOM,
      context,
      isSVG,
      findDOMFromVNode(lastVNode, true),
      lifecycle,
      animations,
    );
    removeVNodeDOM(lastVNode, parentDOM, animations);
  }
}

export function patch(
  lastVNode: VNode,
  nextVNode: VNode,
  parentDOM: Element,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const nextFlags = (nextVNode.flags |= VNodeFlags.InUse);

  if (
    // Normalized flag and the children shape bits are not part of the vNode type
    ((lastVNode.flags ^ nextFlags) & ~VNodeFlags.IgnoredByPatch) !== 0 ||
    lastVNode.type !== nextVNode.type ||
    lastVNode.key !== nextVNode.key ||
    nextFlags & VNodeFlags.ReCreate
  ) {
    if (lastVNode.flags & VNodeFlags.InUse) {
      replaceWithNewNode(
        lastVNode,
        nextVNode,
        parentDOM,
        context,
        isSVG,
        lifecycle,
        animations,
      );
    } else {
      // Last vNode is not in use, it has crashed at application level. Just mount nextVNode and ignore last one
      mount(
        nextVNode,
        parentDOM,
        context,
        isSVG,
        nextNode,
        lifecycle,
        animations,
      );
    }
  } else if (nextFlags & VNodeFlags.Element) {
    patchElement(lastVNode, nextVNode, context, isSVG, lifecycle, animations);
  } else if (nextFlags & VNodeFlags.ComponentClass) {
    patchClassComponent(
      lastVNode,
      nextVNode,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else if (nextFlags & VNodeFlags.ComponentFunction) {
    patchFunctionalComponent(
      lastVNode,
      nextVNode,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else if (nextFlags & VNodeFlags.Text) {
    patchText(lastVNode, nextVNode);
  } else if (nextFlags & VNodeFlags.Fragment) {
    patchFragment(
      lastVNode,
      nextVNode,
      parentDOM,
      context,
      isSVG,
      lifecycle,
      animations,
    );
  } else {
    patchPortal(lastVNode, nextVNode, context, lifecycle, animations);
  }
}

export function patchSingleTextChild(
  lastChildren,
  nextChildren,
  parentDOM: Element,
): void {
  if (lastChildren !== nextChildren) {
    if (lastChildren !== '') {
      (parentDOM.firstChild as Node).nodeValue = nextChildren;
    } else {
      setTextContent(parentDOM, nextChildren);
    }
  }
}

function patchContentEditableChildren(dom, nextChildren): void {
  if (dom.textContent !== nextChildren) {
    dom.textContent = nextChildren;
  }
}

function patchFragment(
  lastVNode: VNode,
  nextVNode: VNode,
  parentDOM: Element,
  context: ContextObject,
  isSVG: boolean,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const lastChildren = lastVNode.children as VNode[];
  let nextChildren = nextVNode.children as any;
  const lastChildFlags = lastVNode.flags & VNodeFlags.ChildFlagsMask;
  let nextChildFlags = nextVNode.flags & VNodeFlags.ChildFlagsMask;
  let nextNode: Element | null = null;

  // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
  // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
  if (
    nextChildFlags & VNodeFlags.MultipleChildren &&
    nextChildren.length === 0
  ) {
    nextChildFlags = VNodeFlags.HasVNodeChildren;
    nextVNode.flags =
      (nextVNode.flags & VNodeFlags.ClearChildFlags) | nextChildFlags;
    nextChildren = nextVNode.children = createVoidVNode();
  }

  const nextIsSingle: boolean =
    (nextChildFlags & VNodeFlags.HasVNodeChildren) !== 0;

  if (nextIsSingle && mustCloneVNode(nextChildren, lastChildren as any)) {
    nextChildren = nextVNode.children = directClone(nextChildren);
  }

  if (lastChildFlags & VNodeFlags.MultipleChildren) {
    const lastLen = lastChildren.length;

    // We need to know Fragment's edge node when
    if (
      // It uses keyed algorithm
      (lastChildFlags & VNodeFlags.HasKeyedChildren &&
        nextChildFlags & VNodeFlags.HasKeyedChildren) ||
      // It transforms from many to single
      nextIsSingle ||
      // It will append more nodes
      (!nextIsSingle && (nextChildren as VNode[]).length > lastLen)
    ) {
      // When fragment has multiple children there is always at least one vNode
      nextNode = (findDOMFromVNode(lastChildren[lastLen - 1], false) as Element)
        .nextSibling as Element | null;
    }
  }

  patchChildren(
    lastChildFlags,
    nextChildFlags,
    lastChildren,
    nextChildren,
    parentDOM,
    context,
    isSVG,
    nextNode,
    lastVNode,
    lifecycle,
    animations,
  );
}

function patchPortal(
  lastVNode: VNode,
  nextVNode: VNode,
  context,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const lastContainer = lastVNode.ref as Element;
  const nextContainer = nextVNode.ref as Element;
  let nextChildren = nextVNode.children as VNode;
  const nextChildFlags = nextVNode.flags & VNodeFlags.ChildFlagsMask;

  if (
    nextChildFlags === VNodeFlags.HasVNodeChildren &&
    mustCloneVNode(nextChildren, lastVNode.children as VNode)
  ) {
    nextChildren = nextVNode.children = directClone(nextChildren);
  }

  patchChildren(
    lastVNode.flags & VNodeFlags.ChildFlagsMask,
    nextChildFlags,
    lastVNode.children as VNode,
    nextChildren,
    lastContainer,
    context,
    false,
    null,
    lastVNode,
    lifecycle,
    animations,
  );

  nextVNode.dom = lastVNode.dom;

  if (lastContainer !== nextContainer && !isInvalid(nextChildren)) {
    appendVNodeDOM(nextChildren, nextContainer);
    if (activeMoveAnimations !== null) {
      activeMoveAnimations.reparent(nextChildren, nextContainer);
    }
  }
}

export function patchElement(
  lastVNode: VNode,
  nextVNode: VNode,
  context: ContextObject,
  isSVG: boolean,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const dom = (nextVNode.dom = lastVNode.dom as Element);
  let lastChildren = lastVNode.children;
  let lastChildFlags = lastVNode.flags & VNodeFlags.ChildFlagsMask;

  // The move hooks of a keyed list measure its items before anything changes, props included.
  // The local test goes first, so that optimized code reads the variable only for keyed lists, and
  // a bundler that knows the variable stays null removes both.
  if (lastChildFlags === VNodeFlags.HasKeyedChildren) {
    if (activeMoveAnimations !== null) {
      activeMoveAnimations.prepare(lastVNode, nextVNode, dom, animations);
    }
  }
  const lastProps = lastVNode.props;
  const nextProps = nextVNode.props;
  const nextFlags = nextVNode.flags;
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
          if (
            patchProp(
              prop,
              lastValue,
              nextValue,
              dom,
              isSVG,
              hasControlledValue,
              lastVNode,
            )
          ) {
            // Keep the reusable vNode intact after innerHTML unmounts its children.
            lastChildren = null;
            lastChildFlags = VNodeFlags.HasInvalidChildren;
          }
        }
      }
    }
    if (lastPropsOrEmpty !== EMPTY_OBJ) {
      for (const prop in lastPropsOrEmpty) {
        if (
          isNullOrUndef(nextPropsOrEmpty[prop]) &&
          !isNullOrUndef(lastPropsOrEmpty[prop])
        ) {
          if (
            patchProp(
              prop,
              lastPropsOrEmpty[prop],
              null,
              dom,
              isSVG,
              hasControlledValue,
              lastVNode,
            )
          ) {
            lastChildren = null;
            lastChildFlags = VNodeFlags.HasInvalidChildren;
          }
        }
      }
    }
  }
  let nextChildren = nextVNode.children;
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
    const nextChildFlags = nextFlags & VNodeFlags.ChildFlagsMask;

    if (
      nextChildFlags === VNodeFlags.HasVNodeChildren &&
      mustCloneVNode(nextChildren as VNode, lastChildren as VNode)
    ) {
      nextChildren = nextVNode.children = directClone(nextChildren as VNode);
    }
    patchChildren(
      lastChildFlags,
      nextChildFlags,
      lastChildren,
      nextChildren,
      dom,
      context,
      isSVG && nextVNode.type !== 'foreignObject',
      null,
      lastVNode,
      lifecycle,
      animations,
    );
  }

  if (isFormElement) {
    processElement(
      nextFlags,
      nextVNode,
      dom,
      nextPropsOrEmpty,
      false,
      hasControlledValue,
    );
  }

  const nextRef = nextVNode.ref;
  const lastRef = lastVNode.ref;

  if (lastRef !== nextRef) {
    unmountRef(lastRef);
    mountRef(nextRef, dom, lifecycle);
  }
}

function replaceOneVNodeWithMultipleVNodes(
  lastChildren,
  nextChildren,
  parentDOM,
  context,
  isSVG: boolean,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  unmount(lastChildren, animations);

  mountArrayChildren(
    nextChildren,
    parentDOM,
    context,
    isSVG,
    findDOMFromVNode(lastChildren, true),
    lifecycle,
    animations,
  );

  removeVNodeDOM(lastChildren, parentDOM, animations);
}

function commonChildrenSwitch(
  lastChildren,
  nextChildren,
  parentDOM: Element,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
  parentVNode: VNode,
  nextChildFlags: VNodeFlags,
  lastChildFlags: VNodeFlags,
): void {
  const lastLength = lastChildren.length | 0;
  const nextLength = nextChildren.length | 0;

  // Fast path's for both algorithms
  if (lastLength === 0) {
    if (nextLength > 0) {
      mountArrayChildren(
        nextChildren,
        parentDOM,
        context,
        isSVG,
        nextNode,
        lifecycle,
        animations,
      );
    }
  } else if (nextLength === 0) {
    removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
  } else if (
    nextChildFlags === VNodeFlags.HasKeyedChildren &&
    lastChildFlags === VNodeFlags.HasKeyedChildren
  ) {
    patchKeyedChildren(
      lastChildren,
      nextChildren,
      parentDOM,
      context,
      isSVG,
      lastLength,
      nextLength,
      nextNode,
      parentVNode,
      lifecycle,
      animations,
    );
  } else {
    patchNonKeyedChildren(
      lastChildren,
      nextChildren,
      parentDOM,
      context,
      isSVG,
      lastLength,
      nextLength,
      nextNode,
      lifecycle,
      animations,
    );
  }
}

function patchChildren(
  lastChildFlags: VNodeFlags,
  nextChildFlags: VNodeFlags,
  lastChildren,
  nextChildren,
  parentDOM: Element,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  parentVNode: VNode,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  switch (lastChildFlags) {
    case VNodeFlags.HasVNodeChildren:
      switch (nextChildFlags) {
        case VNodeFlags.HasVNodeChildren:
          patch(
            lastChildren,
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
          );
          break;
        case VNodeFlags.HasInvalidChildren:
          remove(lastChildren, parentDOM, animations);
          break;
        case VNodeFlags.HasTextChildren:
          unmount(lastChildren, NO_ANIMATIONS);
          setTextContent(parentDOM, nextChildren);
          break;
        default:
          replaceOneVNodeWithMultipleVNodes(
            lastChildren,
            nextChildren,
            parentDOM,
            context,
            isSVG,
            lifecycle,
            animations,
          );
          break;
      }
      break;
    case VNodeFlags.HasInvalidChildren:
      switch (nextChildFlags) {
        case VNodeFlags.HasVNodeChildren:
          mount(
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
          );
          break;
        case VNodeFlags.HasInvalidChildren:
          break;
        case VNodeFlags.HasTextChildren:
          setTextContent(parentDOM, nextChildren);
          break;
        default:
          mountArrayChildren(
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
          );
          break;
      }
      break;
    case VNodeFlags.HasTextChildren:
      switch (nextChildFlags) {
        case VNodeFlags.HasTextChildren:
          patchSingleTextChild(lastChildren, nextChildren, parentDOM);
          break;
        case VNodeFlags.HasVNodeChildren:
          setTextContent(parentDOM, '');
          mount(
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
          );
          break;
        case VNodeFlags.HasInvalidChildren:
          setTextContent(parentDOM, '');
          break;
        default:
          setTextContent(parentDOM, '');
          mountArrayChildren(
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
          );
          break;
      }
      break;
    default:
      // A keyed fragment's move hooks measure its items before any of them change
      if (lastChildFlags === VNodeFlags.HasKeyedChildren) {
        if (
          activeMoveAnimations !== null &&
          (parentVNode.flags & VNodeFlags.Fragment) !== 0
        ) {
          activeMoveAnimations.prepareFragment(
            parentVNode,
            nextChildFlags === VNodeFlags.HasKeyedChildren
              ? nextChildren
              : null,
            parentDOM,
            animations,
          );
        }
      }
      switch (nextChildFlags) {
        case VNodeFlags.HasTextChildren:
          unmountAllChildren(lastChildren, NO_ANIMATIONS);
          setTextContent(parentDOM, nextChildren);
          break;
        case VNodeFlags.HasVNodeChildren:
          removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
          mount(
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
          );
          break;
        case VNodeFlags.HasInvalidChildren:
          removeAllChildren(parentDOM, parentVNode, lastChildren, animations);
          break;
        default:
          commonChildrenSwitch(
            lastChildren,
            nextChildren,
            parentDOM,
            context,
            isSVG,
            nextNode,
            lifecycle,
            animations,
            parentVNode,
            nextChildFlags,
            lastChildFlags,
          );
          break;
      }
      break;
  }
}

function createDidUpdate(
  instance: Component<any, any>,
  lastProps,
  lastState,
  snapshot,
  lifecycle: Array<() => void>,
): void {
  lifecycle.push(() => {
    instance.componentDidUpdate!(lastProps, lastState, snapshot);
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
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const lastState = instance.state;
  const lastProps = instance.props;
  const usesNewAPI = Boolean(instance.$N);
  const hasSCU = isFunction(instance.shouldComponentUpdate);

  if (usesNewAPI) {
    nextState = createDerivedState(
      instance,
      nextProps,
      nextState !== lastState ? { ...lastState, ...nextState } : nextState,
    );
  }

  if (
    force ||
    !hasSCU ||
    (hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context))
  ) {
    if (!usesNewAPI && isFunction(instance.componentWillUpdate)) {
      instance.componentWillUpdate(nextProps, nextState, context);
    }

    instance.props = nextProps;
    instance.state = nextState;
    instance.context = context;
    let snapshot = null;
    const nextInput = renderNewInput(
      instance,
      nextProps,
      context,
      instance.$LI,
    );

    if (usesNewAPI && isFunction(instance.getSnapshotBeforeUpdate)) {
      snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
    }

    patch(
      instance.$LI,
      nextInput,
      parentDOM,
      instance.$CX,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );

    // Don't update Last input, until patch has been successfully executed
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

function patchClassComponent(
  lastVNode,
  nextVNode,
  parentDOM,
  context,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
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
      nextState = { ...nextState, ...instance.$PS };
      instance.$PS = null;
    }
  }

  updateClassComponent(
    instance,
    nextState,
    nextProps,
    parentDOM,
    context,
    isSVG,
    false,
    nextNode,
    lifecycle,
    animations,
  );

  if (lastRef !== nextRef) {
    unmountRef(lastRef);
    mountRef(nextRef, instance, lifecycle);
  }
}

function patchFunctionalComponent(
  lastVNode,
  nextVNode,
  parentDOM,
  context,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const nextProps = nextVNode.props || EMPTY_OBJ;
  const nextRef = nextVNode.ref;
  const lastProps = lastVNode.props;
  const nextHooksDefined = !isNullOrUndef(nextRef);
  const lastInput = lastVNode.children;

  if (nextHooksDefined) {
    // A move hook that a patch adds is counted; one that a patch removes is not, which only keeps
    // inferno-animation active
    if (moveAnimations !== null && isFunction(nextRef.onComponentWillMove)) {
      updateMoveHooks(lastVNode, nextVNode);
    }
    if (
      isFunction(nextRef.onComponentShouldUpdate) &&
      !nextRef.onComponentShouldUpdate(lastProps, nextProps)
    ) {
      nextVNode.children = lastInput;
      return;
    }
    if (isFunction(nextRef.onComponentWillUpdate)) {
      nextRef.onComponentWillUpdate(lastProps, nextProps);
    }
  }
  const nextInput = normalizeRoot(
    renderFunctionalComponent(nextVNode, context),
    lastInput,
  );

  patch(
    lastInput,
    nextInput,
    parentDOM,
    context,
    isSVG,
    nextNode,
    lifecycle,
    animations,
  );
  nextVNode.children = nextInput;
  if (nextHooksDefined && isFunction(nextRef.onComponentDidUpdate)) {
    nextRef.onComponentDidUpdate(lastProps, nextProps);
  }
}

function patchText(lastVNode: VNode, nextVNode: VNode): void {
  const nextText = nextVNode.children as string;
  const dom = (nextVNode.dom = lastVNode.dom);

  if (nextText !== lastVNode.children) {
    (dom as Element).nodeValue = nextText;
  }
}

// Patching does not change last children, so that vNodes can be rendered again.
// When patching throws, last children are updated to vNodes that were patched already, so the next render continues from the current DOM.
function syncLastChildren(
  lastChildren: VNode[],
  nextChildren: VNode[],
  start: number,
  end: number,
): void {
  const lastLength = lastChildren.length;
  const nextLength = nextChildren.length;

  for (let i = 0; i < start; ++i) {
    lastChildren[i] = nextChildren[i];
  }
  for (let i = 1; i <= end; ++i) {
    lastChildren[lastLength - i] = nextChildren[nextLength - i];
  }
}

function patchNonKeyedChildren(
  lastChildren,
  nextChildren,
  dom,
  context: ContextObject,
  isSVG: boolean,
  lastChildrenLength: number,
  nextChildrenLength: number,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const commonLength =
    lastChildrenLength > nextChildrenLength
      ? nextChildrenLength
      : lastChildrenLength;
  let i = 0;
  let nextChild;
  let lastChild;

  try {
    for (; i < commonLength; ++i) {
      nextChild = nextChildren[i];
      lastChild = lastChildren[i];

      if (mustCloneVNode(nextChild, lastChild)) {
        nextChild = nextChildren[i] = directClone(nextChild);
      }

      patch(
        lastChild,
        nextChild,
        dom,
        context,
        isSVG,
        nextNode,
        lifecycle,
        animations,
      );
    }
    if (lastChildrenLength < nextChildrenLength) {
      for (i = commonLength; i < nextChildrenLength; ++i) {
        nextChild = nextChildren[i];

        if (mustCloneVNode(nextChild, null)) {
          nextChild = nextChildren[i] = directClone(nextChild);
        }
        mount(nextChild, dom, context, isSVG, nextNode, lifecycle, animations);
      }
    } else if (lastChildrenLength > nextChildrenLength) {
      for (i = commonLength; i < lastChildrenLength; ++i) {
        remove(lastChildren[i], dom, animations);
      }
    }
  } catch (e) {
    syncLastChildren(
      lastChildren,
      nextChildren,
      i < commonLength ? i : commonLength,
      0,
    );
    throw e;
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
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  let aEnd = aLength - 1;
  let bEnd = bLength - 1;
  let j: number = 0;
  let aNode: VNode = a[j];
  let bNode: VNode = b[j];
  let nextPos: number;
  let nextNode;
  // Count of vNodes patched at the beginning and at the end
  let synced = 0;
  let syncedEnd = 0;

  try {
    // Step 1
    outer: {
      // Sync nodes with the same key at the beginning.
      while (aNode.key === bNode.key) {
        if (mustCloneVNode(bNode, aNode)) {
          b[j] = bNode = directClone(bNode);
        }
        patch(
          aNode,
          bNode,
          dom,
          context,
          isSVG,
          outerEdge,
          lifecycle,
          animations,
        );
        synced = ++j;
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
        if (mustCloneVNode(bNode, aNode)) {
          b[bEnd] = bNode = directClone(bNode);
        }
        patch(
          aNode,
          bNode,
          dom,
          context,
          isSVG,
          outerEdge,
          lifecycle,
          animations,
        );
        syncedEnd++;
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
        nextNode =
          nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge;

        while (j <= bEnd) {
          bNode = b[j];
          if (mustCloneVNode(bNode, null)) {
            b[j] = bNode = directClone(bNode);
          }
          ++j;
          mount(bNode, dom, context, isSVG, nextNode, lifecycle, animations);
        }
      }
    } else if (j > bEnd) {
      while (j <= aEnd) {
        remove(a[j++], dom, animations);
      }
    } else {
      patchKeyedChildrenComplex(
        a,
        b,
        context,
        aLength,
        bLength,
        aEnd,
        bEnd,
        j,
        dom,
        isSVG,
        outerEdge,
        parentVNode,
        lifecycle,
        animations,
      );
    }
  } catch (e) {
    syncLastChildren(a, b, synced, syncedEnd);
    throw e;
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
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  let aNode: VNode;
  let bNode: VNode;
  // eslint-disable-next-line no-useless-assignment
  let nextPos: number = 0;
  // eslint-disable-next-line no-useless-assignment
  let i: number = 0;
  let aStart: number = j;
  const bStart: number = j;
  const aLeft: number = aEnd - j + 1;
  const bLeft: number = bEnd - j + 1;
  const sources = new Int32Array(bLeft + 1);
  // Keep track if it is possible to remove whole DOM using textContent = '';
  let canRemoveWholeContent: boolean = aLeft === aLength;
  let moved: boolean = false;
  let pos: number = 0;
  let patched: number = 0;

  try {
    // When sizes are small, just loop them through
    if (bLength < 4 || (aLeft | bLeft) < 32) {
      for (i = aStart; i <= aEnd; ++i) {
        aNode = a[i];
        if (patched < bLeft) {
          for (j = bStart; j <= bEnd; j++) {
            bNode = b[j];
            if (aNode.key === bNode.key) {
              if (canRemoveWholeContent) {
                canRemoveWholeContent = false;
                while (aStart < i) {
                  remove(a[aStart++], dom, animations);
                }
              }
              if (pos > j) {
                moved = true;
              } else {
                pos = j;
              }
              if (mustCloneVNode(bNode, aNode)) {
                b[j] = bNode = directClone(bNode);
              }
              patch(
                aNode,
                bNode,
                dom,
                context,
                isSVG,
                outerEdge,
                lifecycle,
                animations,
              );
              sources[j - bStart] = i + 1;
              ++patched;
              break;
            }
          }
          if (!canRemoveWholeContent && j > bEnd) {
            remove(aNode, dom, animations);
          }
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom, animations);
        }
      }
    } else {
      const keyIndex = new Map<string | number, number>();

      // Map keys by their index
      for (i = bStart; i <= bEnd; ++i) {
        keyIndex.set(b[i].key as string | number, i);
      }

      // Try to patch same keys
      for (i = aStart; i <= aEnd; ++i) {
        aNode = a[i];

        if (patched < bLeft) {
          j = keyIndex.get(aNode.key as string | number) as number;

          if (j !== void 0) {
            if (canRemoveWholeContent) {
              canRemoveWholeContent = false;
              while (i > aStart) {
                remove(a[aStart++], dom, animations);
              }
            }
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            bNode = b[j];
            if (mustCloneVNode(bNode, aNode)) {
              b[j] = bNode = directClone(bNode);
            }
            patch(
              aNode,
              bNode,
              dom,
              context,
              isSVG,
              outerEdge,
              lifecycle,
              animations,
            );
            sources[j - bStart] = i + 1;
            ++patched;
          } else if (!canRemoveWholeContent) {
            remove(aNode, dom, animations);
          }
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom, animations);
        }
      }
    }
    // fast-path: if nothing patched remove all old and add all new
    if (canRemoveWholeContent) {
      removeAllChildren(dom, parentVNode, a, animations);
      mountArrayChildren(
        b,
        dom,
        context,
        isSVG,
        outerEdge,
        lifecycle,
        animations,
      );
    } else if (moved) {
      const seq = lisAlgorithm(sources);
      j = seq.length - 1;
      for (i = bLeft - 1; i >= 0; i--) {
        if (sources[i] === 0) {
          pos = i + bStart;
          bNode = b[pos];
          if (mustCloneVNode(bNode, null)) {
            b[pos] = bNode = directClone(bNode);
          }
          nextPos = pos + 1;
          mount(
            bNode,
            dom,
            context,
            isSVG,
            nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge,
            lifecycle,
            animations,
          );
        } else if (j < 0 || i !== seq[j]) {
          pos = i + bStart;
          bNode = b[pos];
          nextPos = pos + 1;

          // --- the DOM-node is moved by a call to insertAppend
          moveVNodeDOM(
            bNode,
            dom,
            nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge,
          );
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
          if (mustCloneVNode(bNode, null)) {
            b[pos] = bNode = directClone(bNode);
          }
          nextPos = pos + 1;
          mount(
            bNode,
            dom,
            context,
            isSVG,
            nextPos < bLength ? findDOMFromVNode(b[nextPos], true) : outerEdge,
            lifecycle,
            animations,
          );
        }
      }
    }
  } catch (error) {
    for (let k = 0; k < bLeft; k++) {
      if (sources[k] !== 0) a[sources[k] - 1] = b[k + bStart];
    }
    throw error;
  }
}

let result: Int32Array;
let p: Int32Array;
let maxLen = 0;
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence

function lisAlgorithm(arr: Int32Array): Int32Array {
  // Assigning number here tells JIT that these variables are numbers
  /* eslint-disable no-useless-assignment */
  let arrI = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let u = 0;
  let v = 0;
  let c = 0;
  const len = arr.length;
  /* eslint-enable no-useless-assignment */

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
