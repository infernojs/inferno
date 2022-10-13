import { Component, VNode, findDOMFromVNode } from 'inferno';

export function findDOMNode(ref: VNode | Component | Node): Node | null {
  if (ref && (ref as Node).nodeType) {
    return ref as Node;
  }

  if (!ref || (ref as Component).$UN) {
    return null;
  }

  if ((ref as Component).$LI) {
    return findDOMFromVNode((ref as Component).$LI, true);
  }

  if ((ref as VNode).flags) {
    return findDOMFromVNode(ref as VNode, true);
  }

  return null;
}
