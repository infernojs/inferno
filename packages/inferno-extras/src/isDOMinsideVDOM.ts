import { Component, VNode } from 'inferno';
import { VNodeFlags, ChildFlags } from 'inferno-vnode-flags';

export function isDOMinsideVNode(DOM: Element, vNode: VNode): boolean {
  const stack = [vNode];
  let _vNode;
  let flags;
  let children;

  while (stack.length > 0) {
    _vNode = stack.pop();

    if (_vNode.dom === DOM) {
      return true;
    }

    flags = _vNode.flags;
    children = _vNode.children;

    if (flags & VNodeFlags.ComponentClass) {
      stack.push(children.$LI);
    } else if (flags & VNodeFlags.ComponentFunction) {
      stack.push(children);
    } else {
      flags = _vNode.childFlags;

      if (flags & ChildFlags.MultipleChildren) {
        let i = children.length;

        while (i--) {
          stack.push(children[i]);
        }
      } else if (flags & ChildFlags.HasVNodeChildren) {
        stack.push(children);
      }
    }
  }

  return false;
}

export function isDOMinsideComponent(DOM: Element, instance: Component<any, any>) {
  if (instance.$UN) {
    return false;
  }

  return isDOMinsideVNode(DOM, instance.$LI);
}
