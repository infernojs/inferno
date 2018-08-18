import { Component, InfernoChildren, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isNumber, isObject } from 'inferno-shared';

export function isVNode(inst: any): inst is VNode {
  return Boolean(inst) && isObject(inst) && isNumber((inst as any).flags) && (inst as any).flags > 0;
}

export function isTextVNode(inst: VNode): inst is VNode {
  return isVNode(inst) && (inst.flags & VNodeFlags.Text) !== 0;
}

export function isFunctionalVNode(inst: VNode): inst is VNode {
  return isVNode(inst) && (inst.flags & VNodeFlags.ComponentFunction) !== 0;
}

export function isClassVNode(inst: VNode): inst is VNode {
  return isVNode(inst) && (inst.flags & VNodeFlags.ComponentClass) !== 0;
}

export function isComponentVNode(inst: VNode): inst is VNode {
  return isFunctionalVNode(inst) || isClassVNode(inst);
}

export function getTagNameOfVNode(vNode: any) {
  return (vNode && vNode.dom && vNode.dom.tagName.toLowerCase()) || undefined;
}

export function isDOMVNode(inst: any): inst is VNode {
  return isVNode(inst) && (inst.flags & VNodeFlags.Element) !== 0;
}

export class Wrapper<P, S> extends Component<P, S> {
  public render(): InfernoChildren {
    return this.props.children;
  }
}
