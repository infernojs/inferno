import type {
  Inferno,
  InfernoNode,
  LinkedEvent,
  VNode,
} from './../../core/types';
import { isFunction, isNull, isNullOrUndef, isUndefined } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isLinkEventObject } from '../events/linkEvent';

// We need EMPTY_OBJ defined in one place.
// It's used for comparison, so we can't inline it into shared
export const EMPTY_OBJ = {};

// @ts-expect-error hack for fragment type
export const Fragment: Inferno.ExoticComponent<{ children?: InfernoNode }> =
  '$F';

/**
 * The move animation integration of inferno-animation. Move hook owners are class components that
 * have componentWillMove by the end of their mount, and function components whose hooks include
 * onComponentWillMove; the adapter is active while any owner is mounted.
 */
export interface MoveAnimationAdapter {
  // Owner changes, reported whenever inferno-animation is installed
  mountClass(instance: any): void;
  unmountClass(instance: any): void;
  updateHooks(lastRef: any, nextRef: any): void;
  // Reported only while the adapter is active
  prepare(
    last: VNode,
    next: VNode,
    parent: Element,
    commit: AnimationQueues,
  ): void;
  prepareFragment(
    last: VNode,
    nextChildren: VNode[] | null,
    parent: Element,
    commit: AnimationQueues,
  ): void;
  unmountList(vNode: VNode): void;
  reparent(vNode: VNode, parent: Element): void;
  remove(parent: Element, callback: () => void): void;
}

// The adapter while inferno-animation is installed, and while it is active. The reconciler tests
// these variables: a null check of a variable is the cheapest test in every JIT tier, and a bundler
// that sees no call to setMoveAnimations removes the tests altogether.
export let moveAnimations: MoveAnimationAdapter | null = null;
export let activeMoveAnimations: MoveAnimationAdapter | null = null;

// A patch changed a function component's hooks object: the move hooks among them are counted
export function updateMoveHooks(lastVNode: VNode, nextVNode: VNode): void {
  if (moveAnimations !== null) {
    moveAnimations.updateHooks(lastVNode.ref, nextVNode.ref);
  }
}

// Returns false when another copy of inferno-animation is installed already
export function setMoveAnimations(
  adapter: MoveAnimationAdapter,
  active: boolean,
): boolean {
  if (moveAnimations !== null && moveAnimations !== adapter) {
    return false;
  }
  moveAnimations = adapter;
  activeMoveAnimations = active ? adapter : null;
  return true;
}

// One per commit. The arrays are created by the first hook queued in them.
export class AnimationQueues {
  public componentDidAppear: Array<() => void> | null = null;
  public componentWillDisappear: Array<() => void> | null = null;
}

// Given to the children of a component that animates its own appearance or removal: their appear
// and leave hooks do not run. Nothing is ever queued in it.
export const NO_ANIMATIONS = new AnimationQueues();

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(EMPTY_OBJ);
}

export function normalizeEventName(name): keyof DocumentEventMap {
  return name.substring(2).toLowerCase();
}

export function appendChild(parentDOM, dom): void {
  parentDOM.appendChild(dom);
}

export function insertOrAppend(parentDOM: Element, newNode, nextNode): void {
  if (isNull(nextNode)) {
    appendChild(parentDOM, newNode);
  } else {
    parentDOM.insertBefore(newNode, nextNode);
  }
}

export function documentCreateElement(tag, isSVG: boolean): Element {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  return document.createElement(tag);
}

export function replaceChild(parentDOM: Element, newDom, lastDom): void {
  parentDOM.replaceChild(newDom, lastDom);
}

export function removeChild(parentDOM: Element, childNode: Element): void {
  parentDOM.removeChild(childNode);
}

export function callAll(arrayFn: Array<() => void>): void {
  for (let i = 0; i < arrayFn.length; i++) {
    arrayFn[i]();
  }
}

function findChildVNode(
  vNode: VNode,
  startEdge: boolean,
  flags: VNodeFlags,
): InfernoNode {
  const children = vNode.children;

  if ((flags & VNodeFlags.ComponentClass) !== 0) {
    return (children as any).$LI;
  }

  if ((flags & VNodeFlags.Fragment) !== 0) {
    return vNode.childFlags === ChildFlags.HasVNodeChildren
      ? (children as VNode)
      : (children as VNode[])[startEdge ? 0 : (children as VNode[]).length - 1];
  }

  return children;
}

export function findDOMFromVNode(
  vNode: VNode,
  startEdge: boolean,
): Element | null {
  let flags: VNodeFlags;
  let v: VNode | null = vNode;

  while (!isNullOrUndef(v)) {
    flags = v.flags;

    if ((flags & VNodeFlags.DOMRef) !== 0) {
      return v.dom;
    }

    v = findChildVNode(v, startEdge, flags) as VNode | null;
  }

  return null;
}

// The first Element of a vNode's rendered output, or null when that output starts with text, a
// placeholder or a portal. Appear, leave and move animations need an element to animate.
export function findElementFromVNode(vNode: VNode | null): Element | null {
  while (!isNullOrUndef(vNode)) {
    const flags = vNode.flags;

    if (flags & VNodeFlags.Element) {
      return vNode.dom;
    }
    if (flags & VNodeFlags.DOMRef) {
      return null;
    }
    if (
      flags & VNodeFlags.Fragment &&
      vNode.childFlags & ChildFlags.MultipleChildren
    ) {
      const children = vNode.children as VNode[];
      for (let i = 0; i < children.length; i++) {
        const dom = findElementFromVNode(children[i]);
        if (dom !== null) {
          return dom;
        }
      }
      return null;
    }
    vNode = findChildVNode(vNode, true, flags) as VNode | null;
  }
  return null;
}

export function callAllAnimationHooks(
  animationQueue: Array<() => void> | null,
  callback?: (synchronous?: boolean) => void,
): void {
  if (animationQueue === null) {
    return;
  }
  let synchronous = true;
  let animationsLeft: number = animationQueue.length;
  // Picking from the top because it is faster, invocation order should be irrelevant
  // since all animations are to be run, and we can't predict the order in which they complete.
  let fn;
  while ((fn = animationQueue.pop()) !== undefined) {
    fn(() => {
      if (--animationsLeft <= 0 && isFunction(callback)) {
        callback(synchronous);
      }
    });
  }
  synchronous = false;
}

export function clearVNodeDOM(
  vNode: VNode | null,
  parentDOM: Element,
  deferredRemoval: boolean,
): void {
  while (!isNullOrUndef(vNode)) {
    const flags = vNode.flags;

    if ((flags & VNodeFlags.DOMRef) !== 0) {
      // On deferred removals the node might disappear because of later operations
      if (!deferredRemoval || (vNode.dom as Element).parentNode === parentDOM) {
        removeChild(parentDOM, vNode.dom as Element);
      }
      return;
    }
    const children = vNode.children as any;

    if ((flags & VNodeFlags.ComponentClass) !== 0) {
      vNode = children.$LI;
    }
    if ((flags & VNodeFlags.ComponentFunction) !== 0) {
      vNode = children;
    }
    if ((flags & VNodeFlags.Fragment) !== 0) {
      if ((vNode as VNode).childFlags === ChildFlags.HasVNodeChildren) {
        vNode = children;
      } else {
        for (let i = 0, len = children.length; i < len; ++i) {
          clearVNodeDOM(children[i], parentDOM, deferredRemoval);
        }
        return;
      }
    }
  }
}

// Appends all DOM nodes of the vNode to parentDOM, moving them from their current parent
export function appendVNodeDOM(vNode: VNode | null, parentDOM: Element): void {
  while (!isNullOrUndef(vNode)) {
    const flags = vNode.flags;

    if ((flags & VNodeFlags.DOMRef) !== 0) {
      appendChild(parentDOM, vNode.dom);
      return;
    }
    const children = vNode.children as any;

    if ((flags & VNodeFlags.ComponentClass) !== 0) {
      vNode = children.$LI;
    }
    if ((flags & VNodeFlags.ComponentFunction) !== 0) {
      vNode = children;
    }
    if ((flags & VNodeFlags.Fragment) !== 0) {
      if ((vNode as VNode).childFlags === ChildFlags.HasVNodeChildren) {
        vNode = children;
      } else {
        for (let i = 0, len = children.length; i < len; ++i) {
          appendVNodeDOM(children[i], parentDOM);
        }
        return;
      }
    }
  }
}

function createDeferComponentClassRemovalCallback(vNode, parentDOM) {
  return deferRemoval(parentDOM, () => clearVNodeDOM(vNode, parentDOM, true));
}

// A completion may be invoked more than once, or after a later patch removed its DOM.
export function deferRemoval(
  parent: Element,
  callback: () => void,
): () => void {
  let completed = false;
  return (synchronous?: boolean) => {
    if (completed) return;
    completed = true;
    if (!synchronous && activeMoveAnimations !== null) {
      activeMoveAnimations.remove(parent, callback);
    } else {
      callback();
    }
  };
}

export function removeVNodeDOM(
  vNode: VNode,
  parentDOM: Element,
  animations: AnimationQueues,
): void {
  const hooks = animations.componentWillDisappear;
  if (hooks !== null) {
    // The leave hooks queued while unmounting vNode belong to this removal.
    // Wait until animations are finished before removing actual dom nodes
    animations.componentWillDisappear = null;
    callAllAnimationHooks(
      hooks,
      createDeferComponentClassRemovalCallback(vNode, parentDOM),
    );
  } else {
    clearVNodeDOM(vNode, parentDOM, false);
  }
}

// Reconciliation owns DOM placement. Animation hooks measure before patching,
// so animated and ordinary nodes follow exactly the same insertion order.
export function moveVNodeDOM(vNode, parentDOM, nextNode): void {
  while (!isNullOrUndef(vNode)) {
    const flags = vNode.flags;
    if (flags & VNodeFlags.DOMRef) {
      insertOrAppend(parentDOM, vNode.dom, nextNode);
      return;
    }
    const children = vNode.children;
    if (flags & VNodeFlags.ComponentClass) {
      vNode = children.$LI;
    } else if (flags & VNodeFlags.ComponentFunction) {
      vNode = children;
    } else if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
      vNode = children;
    } else {
      for (let i = 0; i < children.length; i++) {
        moveVNodeDOM(children[i], parentDOM, nextNode);
      }
      return;
    }
  }
}

export function getComponentName(instance: any): string {
  // TODO: Fallback for IE
  return (
    instance.name ??
    instance.displayName ??
    instance.constructor.name ??
    ((instance as any).toString().match(/^function\s*([^\s(]+)/) || [])[1]
  );
}

export function createDerivedState<TState>(
  instance,
  nextProps,
  state: TState,
): TState {
  if (isFunction(instance.constructor.getDerivedStateFromProps)) {
    return {
      ...state,
      ...instance.constructor.getDerivedStateFromProps(nextProps, state),
    };
  }

  return state;
}

export const renderCheck = {
  v: false,
};

export const options: {
  createVNode: ((vNode: VNode) => void) | null;
  reactStyles?: boolean;
} = {
  createVNode: null,
};

export function setTextContent(dom: Element, children): void {
  dom.textContent = children;
}

// Calling this function assumes, nextValue is linkEvent
export function isLastValueSameLinkEvent(lastValue, nextValue): boolean {
  return (
    isLinkEventObject(lastValue) &&
    lastValue.event === (nextValue as LinkedEvent<any, any>).event &&
    lastValue.data === (nextValue as LinkedEvent<any, any>).data
  );
}

export function mergeUnsetProperties<TTo, TFrom>(
  to: TTo,
  from: TFrom,
): TTo & TFrom {
  for (const propName in from) {
    // @ts-expect-error merge objects
    if (isUndefined(to[propName])) {
      // @ts-expect-error merge objects
      to[propName] = from[propName];
    }
  }

  // @ts-expect-error merge objects
  return to;
}

export function safeCall1(
  method: Function | null | undefined,
  arg1: any,
): boolean {
  return isFunction(method) && (method(arg1), true);
}
