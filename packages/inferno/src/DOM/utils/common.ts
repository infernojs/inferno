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

export interface MoveQueueItem {
  parent: Element;
  dom: Element;
  next: Element;
  fn: () => void;
}

export class AnimationQueues {
  public componentDidAppear: Array<() => void> = [];
  public componentWillDisappear: Array<() => void> = [];
  public componentWillMove: MoveQueueItem[] = [];
}

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

export function callAllAnimationHooks(
  animationQueue: Array<() => void>,
  callback?: () => void,
): void {
  let animationsLeft: number = animationQueue.length;
  // Picking from the top because it is faster, invocation order should be irrelevant
  // since all animations are to be run, and we can't predict the order in which they complete.
  let fn;
  while ((fn = animationQueue.pop()) !== undefined) {
    fn(() => {
      if (--animationsLeft <= 0 && isFunction(callback)) {
        callback();
      }
    });
  }
}

export function callAllMoveAnimationHooks(
  animationQueue: MoveQueueItem[],
): void {
  // Start the animations.
  for (let i = 0; i < animationQueue.length; i++) {
    animationQueue[i].fn();
  }
  // Perform the actual DOM moves when all measurements of initial
  // position have been performed. The rest of the animations are done
  // async.
  for (let i = 0; i < animationQueue.length; i++) {
    const tmp = animationQueue[i];
    insertOrAppend(tmp.parent, tmp.dom, tmp.next);
  }
  animationQueue.splice(0, animationQueue.length);
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
          clearVNodeDOM(children[i], parentDOM, false);
        }
        return;
      }
    }
  }
}

function createDeferComponentClassRemovalCallback(vNode, parentDOM) {
  return function () {
    // Mark removal as deferred to trigger check that node still exists
    clearVNodeDOM(vNode, parentDOM, true);
  };
}

export function removeVNodeDOM(
  vNode: VNode,
  parentDOM: Element,
  animations: AnimationQueues,
): void {
  if (animations.componentWillDisappear.length > 0) {
    // Wait until animations are finished before removing actual dom nodes
    callAllAnimationHooks(
      animations.componentWillDisappear,
      createDeferComponentClassRemovalCallback(vNode, parentDOM),
    );
  } else {
    clearVNodeDOM(vNode, parentDOM, false);
  }
}

function addMoveAnimationHook(
  animations: AnimationQueues,
  parentVNode,
  refOrInstance,
  dom: Element,
  parentDOM: Element,
  nextNode: Element,
  flags,
  props?,
): void {
  animations.componentWillMove.push({
    dom,
    fn: () => {
      if ((flags & VNodeFlags.ComponentClass) !== 0) {
        refOrInstance.componentWillMove(parentVNode, parentDOM, dom);
      } else if ((flags & VNodeFlags.ComponentFunction) !== 0) {
        refOrInstance.onComponentWillMove(parentVNode, parentDOM, dom, props);
      }
    },
    next: nextNode,
    parent: parentDOM,
  });
}

export function moveVNodeDOM(
  parentVNode,
  vNode,
  parentDOM,
  nextNode,
  animations: AnimationQueues,
): void {
  let refOrInstance;
  let instanceProps;
  const instanceFlags = vNode.flags;

  while (!isNullOrUndef(vNode)) {
    const flags = vNode.flags;

    if ((flags & VNodeFlags.DOMRef) !== 0) {
      if (
        !isNullOrUndef(refOrInstance) &&
        (isFunction(refOrInstance.componentWillMove) ||
          isFunction(refOrInstance.onComponentWillMove))
      ) {
        addMoveAnimationHook(
          animations,
          parentVNode,
          refOrInstance,
          vNode.dom,
          parentDOM,
          nextNode,
          instanceFlags,
          instanceProps,
        );
      } else {
        // TODO: Should we delay this too to support mixing animated moves with regular?
        insertOrAppend(parentDOM, vNode.dom, nextNode);
      }
      return;
    }
    const children = vNode.children;

    if ((flags & VNodeFlags.ComponentClass) !== 0) {
      refOrInstance = vNode.children;
      // TODO: We should probably deprecate this in V9 since it is inconsitent with other class component hooks
      instanceProps = vNode.props;
      vNode = children.$LI;
    } else if ((flags & VNodeFlags.ComponentFunction) !== 0) {
      refOrInstance = vNode.ref;
      instanceProps = vNode.props;
      vNode = children;
    } else if ((flags & VNodeFlags.Fragment) !== 0) {
      if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        vNode = children;
      } else {
        for (let i = 0, len = children.length; i < len; ++i) {
          moveVNodeDOM(
            parentVNode,
            children[i],
            parentDOM,
            nextNode,
            animations,
          );
        }
        return;
      }
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
