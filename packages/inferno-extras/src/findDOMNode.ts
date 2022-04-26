import { findDOMFromVNode } from 'inferno';

export function findDOMNode(ref) {
  if (ref && ref.nodeType) {
    return ref;
  }

  if (!ref || ref.$UN) {
    return null;
  }

  if (ref.$LI) {
    return findDOMFromVNode(ref.$LI, true);
  }

  if (ref.flags) {
    return findDOMFromVNode(ref, true);
  }

  return null;
}
