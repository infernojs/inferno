import { findDOMfromVNode } from 'inferno';

export function findDOMNode(ref) {
  if (ref && ref.nodeType) {
    return ref;
  }

  if (!ref || ref.$UN) {
    return null;
  }

  if (ref.$LI) {
    return findDOMfromVNode(ref.$LI);
  }

  if (ref.flags) {
    return findDOMfromVNode(ref);
  }

  return null;
}
