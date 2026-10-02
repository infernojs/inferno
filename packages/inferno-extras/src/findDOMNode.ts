import { type Component, findDOMFromVNode, type VNode } from 'inferno';

// ref is a component instance, a vNode or a DOM node
export function findDOMNode(
  ref: VNode | JSX.ElementClass | Node | null | undefined,
): Node | null {
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
