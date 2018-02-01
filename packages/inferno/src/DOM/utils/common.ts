import { isNullOrUndef } from 'inferno-shared';
import { svgNS } from '../constants';

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};

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
  if (isSVG === true) {
    return document.createElementNS(svgNS, tag);
  }

  return document.createElement(tag);
}

export function replaceChild(parentDom, newDom, lastDom) {
  parentDom.replaceChild(newDom, lastDom);
}

export function removeChild(parentDom: Element, dom: Element) {
  parentDom.removeChild(dom);
}

export function callAll(arrayFn: Function[]) {
  let listener;
  while ((listener = arrayFn.shift()) !== undefined) {
    listener();
  }
}
