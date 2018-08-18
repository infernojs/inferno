import {isNullOrUndef} from 'inferno-shared';
import {svgNS} from '../constants';
import {ChildFlags, VNodeFlags} from "inferno-vnode-flags";
import { VNode } from './../../core/implementation';

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};
export const LIFECYCLE: Function[] = [];

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(EMPTY_OBJ);
}

export function appendChild(parentDom, dom) {
  parentDom.appendChild(dom);
}

export function insertOrAppend(parentDom, newNode, nextNode) {
  if (isNullOrUndef(nextNode)) {
    appendChild(parentDom, newNode);
  } else {
    parentDom.insertBefore(newNode, nextNode);
  }
}

export function documentCreateElement(tag, isSVG: boolean): Element {
  if (isSVG) {
    return document.createElementNS(svgNS, tag);
  }

  return document.createElement(tag);
}

export function replaceChild(parentDom, newDom, lastDom) {
  parentDom.replaceChild(newDom, lastDom);
}

export function removeChild(parentDom: Element, childNode: Element) {
  parentDom.removeChild(childNode);
}

export function callAll(arrayFn: Function[]) {
  let listener;
  while ((listener = arrayFn.shift()) !== undefined) {
    listener();
  }
}

export function findDOMfromVNode(vNode: VNode) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.DOMRef) {
    return vNode.dom;
  }

  return findDOMfromVNode(flags & VNodeFlags.ComponentClass ? (vNode.children as any).$LI : vNode.children);
}

export function removeVNodeDOM(vNode: VNode, dom: Element) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.DOMRef) {
    removeChild(dom, vNode.dom as Element);
  } else {
    const children = vNode.children as any;

    if (flags & VNodeFlags.ComponentClass) {
      removeVNodeDOM(children.$LI, dom);
    } else if (flags & VNodeFlags.ComponentFunction) {
      removeVNodeDOM(children, dom);
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        removeChild(dom, children);
      } else {
        for (let i = 0, len = children.length; i < len; i++) {
          removeVNodeDOM(children[i], dom);
        }
      }
    }
  }
}
