import { Component, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isNumber } from 'inferno-shared';

export function isVNode(obj: any): obj is VNode {
  return Boolean(obj) && typeof obj === 'object' && isNumber((obj as any).flags) && (obj as any).flags > 0;
}

export function isTextVNode(obj: VNode): obj is VNode {
  return (obj.flags & VNodeFlags.Text) > 0;
}

export function isFunctionalVNode(obj: VNode): obj is VNode {
  return isVNode(obj) && (obj.flags & VNodeFlags.ComponentFunction) > 0;
}

export function isClassVNode(obj: VNode): obj is VNode {
  return isVNode(obj) && (obj.flags & VNodeFlags.ComponentClass) > 0;
}

export function isComponentVNode(obj: VNode): obj is VNode {
  return isFunctionalVNode(obj) || isClassVNode(obj);
}

export function getTagNameOfVNode(vNode: VNode) {
  return (vNode && vNode.dom && vNode.dom.tagName.toLowerCase()) || undefined;
}

export function isDOMVNode(vNode: any): vNode is VNode {
  return !isComponentVNode(vNode) && !isTextVNode(vNode) && (vNode.flags & VNodeFlags.Element) > 0;
}

export class Wrapper<P, S> extends Component<P, S> {
  public render() {
    return this.props.children;
  }
}
