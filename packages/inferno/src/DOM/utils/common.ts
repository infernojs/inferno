import {combineFrom, isFunction, isNull, isUndefined} from 'inferno-shared';
import {ChildFlags, VNodeFlags} from 'inferno-vnode-flags';
import {InfernoNode, LinkedEvent, VNode} from './../../core/types';
import {isLinkEventObject} from '../events/linkEvent';

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};
export const Fragment: string = '$F';

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
  let listener;
  while ((listener = arrayFn.shift()) !== undefined) {
    listener();
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

export function removeVNodeDOM(vNode: VNode, parentDOM: Element) {
  do {
    const flags = vNode.flags;

    if (flags & VNodeFlags.DOMRef) {
      removeChild(parentDOM, vNode.dom as Element);
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
          removeVNodeDOM(children[i], parentDOM);
        }
        return;
      }
    }
  } while (vNode);
}

export function moveVNodeDOM(vNode, parentDOM, nextNode) {
  do {
    const flags = vNode.flags;

    if (flags & VNodeFlags.DOMRef) {
      insertOrAppend(parentDOM, vNode.dom, nextNode);
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
          moveVNodeDOM(children[i], parentDOM, nextNode);
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
  renderComplete: ((rootInput: VNode | InfernoNode, parentDOM: Element | SVGAElement | ShadowRoot | DocumentFragment | HTMLElement | Node) => void) | null;
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
