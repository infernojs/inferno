import { Component, VNode, InfernoChildren } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isNumber, isObject } from 'inferno-shared';

export function isVNode(instance: any): instance is VNode {
  return Boolean(instance) && isObject(instance) && isNumber((instance as any).flags) && (instance as any).flags > 0;
}

export function isTextVNode(inst: VNode): inst is VNode {
  return (inst.flags & VNodeFlags.Text) > 0;
}

export function isFunctionalVNode(instance: VNode): instance is VNode {
  return isVNode(instance) && (instance.flags & VNodeFlags.ComponentFunction) > 0;
}

export function isClassVNode(instance: VNode): instance is VNode {
  return isVNode(instance) && (instance.flags & VNodeFlags.ComponentClass) > 0;
}

export function isComponentVNode(inst: VNode): inst is VNode {
  return isFunctionalVNode(inst) || isClassVNode(inst);
}

export function getTagNameOfVNode(vNode: VNode) {
  return (vNode && vNode.dom && vNode.dom.tagName.toLowerCase()) || undefined;
}

export function isDOMVNode(vNode: any): vNode is VNode {
  return !isComponentVNode(vNode) && !isTextVNode(vNode) && (vNode.flags & VNodeFlags.Element) > 0;
}

export class Wrapper<P, S> extends Component<P, S> {
  public render(): InfernoChildren {
    return this.props.children;
  }
}
