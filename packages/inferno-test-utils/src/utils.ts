import { Component, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isNumber, isObject } from 'inferno-shared';

export function isVNode(instance: any): instance is VNode {
  return Boolean(instance) && isObject(instance) && isNumber((instance as any).flags) && (instance as any).flags > 0;
}

export function isTextVNode(inst: VNode): boolean {
  return inst.flags === VNodeFlags.Text;
}

export function isFunctionalVNode(instance: VNode): boolean {
  return isVNode(instance) && Boolean(instance.flags & VNodeFlags.ComponentFunction);
}

export function isClassVNode(instance: VNode): boolean {
  return isVNode(instance) && Boolean(instance.flags & VNodeFlags.ComponentClass);
}

export function isComponentVNode(inst: VNode): boolean {
  return isFunctionalVNode(inst) || isClassVNode(inst);
}

export function getTagNameOfVNode(inst: any) {
  return (inst && inst.dom && inst.dom.tagName.toLowerCase()) || (inst && inst.$V && inst.$V.dom && inst.$V.dom.tagName.toLowerCase()) || undefined;
}

export function isDOMVNode(inst: VNode): boolean {
  return !isComponentVNode(inst) && !isTextVNode(inst);
}

export class Wrapper extends Component<any, any> {
  public render() {
    return this.props.children;
  }
}
