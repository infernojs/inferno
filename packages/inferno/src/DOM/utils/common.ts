import type { Inferno, LinkedEvent, VNode } from './../../core/types';
import { combineFrom, isFunction, isNull, isNullOrUndef, isUndefined } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { isLinkEventObject } from '../events/linkEvent';
import {  } from "../../core/types";

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};
// @ts-ignore
export const Fragment: Inferno.ExoticComponent<{ children?: Inferno.InfernoNode | undefined }> = '$F';

export type MoveQueueItem = {
  parent: Element;
  dom: Element;
  next: Element;
  fn: Function;
};

export class AnimationQueues {
  public componentDidAppear: Function[];
  public componentWillDisappear: Function[];
  public componentWillMove: MoveQueueItem[];

  constructor() {
    this.componentDidAppear = [];
    this.componentWillDisappear = [];
    this.componentWillMove = [];
  }
}

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(EMPTY_OBJ);
}

export function normalizeEventName(name) {
  return name.substr(2).toLowerCase();
}

export function appendChild(parentDOM, dom) {
  parentDOM.appendChild(dom);
}

export function insertOrAppend(parentDOM: Element, newNode, nextNode) {
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

export function replaceChild(parentDOM: Element, newDom, lastDom) {
  parentDOM.replaceChild(newDom, lastDom);
}

export function removeChild(parentDOM: Element, childNode: Element) {
  parentDOM.removeChild(childNode);
}

export function callAll(arrayFn: Function[]) {
  for (let i = 0; i < arrayFn.length; i++) {
    arrayFn[i]();
  }
}

function findChildVNode(vNode: VNode, startEdge: boolean, flags: VNodeFlags) {
  const children = vNode.children;

  if (flags & VNodeFlags.ComponentClass) {
    return (children as any).$LI;
  }

  if (flags & VNodeFlags.Fragment) {
    return vNode.childFlags === ChildFlags.HasVNodeChildren ? (children as VNode) : (children as VNode[])[startEdge ? 0 : (children as VNode[]).length - 1];
  }

  return children;
}

export function findDOMfromVNode(vNode: VNode, startEdge: boolean) {
  let flags;

  while (vNode) {
    flags = vNode.flags;

    if (flags & VNodeFlags.DOMRef) {
      return vNode.dom;
    }

    vNode = findChildVNode(vNode, startEdge, flags);
  }

  return null;
}

export function callAllAnimationHooks(animationQueue: Function[], callback?: Function) {
  let animationsLeft: number = animationQueue.length;
  // Picking from the top because it is faster, invocation order should be irrelevant
  // since all animations are to be run and we can't predict the order in which they complete.
  let fn;
  while ((fn = animationQueue.pop()) !== undefined) {
    fn(() => {
      if (--animationsLeft <= 0 && isFunction(callback)) {
        callback();
      }
    });
  }
}

export function callAllMoveAnimationHooks(animationQueue: MoveQueueItem[]) {
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

export function clearVNodeDOM(vNode: VNode, parentDOM: Element, deferredRemoval: boolean) {
  do {
    const flags = vNode.flags;

    if (flags & VNodeFlags.DOMRef) {
      // On deferred removals the node might disappear because of later operations
      if (!deferredRemoval || (vNode.dom as Element).parentNode === parentDOM) {
        removeChild(parentDOM, vNode.dom as Element);
      }
      return;
    }
    const children = vNode.children as any;

    if (flags & VNodeFlags.ComponentClass) {
      vNode = children.$LI;
    }
    if (flags & VNodeFlags.ComponentFunction) {
      vNode = children;
    }
    if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        vNode = children;
      } else {
        for (let i = 0, len = children.length; i < len; ++i) {
          clearVNodeDOM(children[i], parentDOM, false);
        }
        return;
      }
    }
  } while (vNode);
}

function createDeferComponentClassRemovalCallback(vNode, parentDOM) {
  return function () {
    // Mark removal as deferred to trigger check that node still exists
    clearVNodeDOM(vNode, parentDOM, true);
  };
}

export function removeVNodeDOM(vNode: VNode, parentDOM: Element, animations: AnimationQueues) {
  if (animations.componentWillDisappear.length > 0) {
    // Wait until animations are finished before removing actual dom nodes
    callAllAnimationHooks(animations.componentWillDisappear, createDeferComponentClassRemovalCallback(vNode, parentDOM));
  } else {
    clearVNodeDOM(vNode, parentDOM, false);
  }
}

function addMoveAnimationHook(animations: AnimationQueues, parentVNode, refOrInstance, dom: Element, parentDOM: Element, nextNode: Element, flags, props) {
  animations.componentWillMove.push({
    dom,
    fn: () => {
      if (flags & VNodeFlags.ComponentClass) {
        refOrInstance.componentWillMove(parentVNode, parentDOM, dom, props);
      } else if (flags & VNodeFlags.ComponentFunction) {
        refOrInstance.onComponentWillMove(parentVNode, parentDOM, dom, props);
      }
    },
    next: nextNode,
    parent: parentDOM
  });
}

export function moveVNodeDOM(parentVNode, vNode, parentDOM, nextNode, animations: AnimationQueues) {
  let refOrInstance;
  let instanceProps;
  const instanceFlags = vNode.flags;
  do {
    const flags = vNode.flags;

    if (flags & VNodeFlags.DOMRef) {
      if (!isNullOrUndef(refOrInstance) && (isFunction(refOrInstance.componentWillMove) || isFunction(refOrInstance.onComponentWillMove))) {
        addMoveAnimationHook(animations, parentVNode, refOrInstance, vNode.dom, parentDOM, nextNode, instanceFlags, instanceProps);
      } else {
        // TODO: Should we delay this too to support mixing animated moves with regular?
        insertOrAppend(parentDOM, vNode.dom, nextNode);
      }
      return;
    }
    const children = vNode.children as any;

    if (flags & VNodeFlags.ComponentClass) {
      refOrInstance = vNode.children;
      instanceProps = vNode.props;
      vNode = children.$LI;
    } else if (flags & VNodeFlags.ComponentFunction) {
      refOrInstance = vNode.ref;
      instanceProps = vNode.props;
      vNode = children;
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        vNode = children;
      } else {
        for (let i = 0, len = children.length; i < len; ++i) {
          moveVNodeDOM(parentVNode, children[i], parentDOM, nextNode, animations);
        }
        return;
      }
    }
  } while (vNode);
}

export function getComponentName(instance): string {
  // Fallback for IE
  return instance.name || instance.displayName || instance.constructor.name || (instance.toString().match(/^function\s*([^\s(]+)/) || [])[1];
}

export function createDerivedState(instance, nextProps, state) {
  if (instance.constructor.getDerivedStateFromProps) {
    return combineFrom(state, instance.constructor.getDerivedStateFromProps(nextProps, state));
  }

  return state;
}

export const renderCheck = {
  v: false
};

export const options: {
  componentComparator: ((lastVNode: VNode, nextVNode: VNode) => boolean) | null;
  createVNode: ((vNode: VNode) => void) | null;
  renderComplete: ((rootInput: VNode | Inferno.InfernoNode, parentDOM: Element | SVGAElement | ShadowRoot | DocumentFragment | HTMLElement | Node) => void) | null;
  reactStyles?: boolean;
} = {
  componentComparator: null,
  createVNode: null,
  renderComplete: null
};

export function setTextContent(dom: Element, children): void {
  dom.textContent = children;
}

// Calling this function assumes, nextValue is linkEvent
export function isLastValueSameLinkEvent(lastValue, nextValue): boolean {
  return (
    isLinkEventObject(lastValue) &&
    (lastValue as LinkedEvent<any, any>).event === (nextValue as LinkedEvent<any, any>).event &&
    (lastValue as LinkedEvent<any, any>).data === (nextValue as LinkedEvent<any, any>).data
  );
}

export function mergeUnsetProperties(to, from) {
  for (const propName in from) {
    if (isUndefined(to[propName])) {
      to[propName] = from[propName];
    }
  }

  return to;
}

export function safeCall1(method: Function | null | undefined, arg1: any): boolean {
  return !!isFunction(method) && (method(arg1), true);
}
