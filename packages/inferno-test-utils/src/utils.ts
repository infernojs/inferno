/**
 * @module Inferno-Test-Utils
 */ /** TypeDoc Comment */

import { Component, createVNode, render, VNode } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import { isNumber, isObject } from "inferno-shared";

export function isVNode(instance: any): instance is VNode {
  return (
    Boolean(instance) &&
    isObject(instance) &&
    isNumber((instance as any).flags) &&
    (instance as any).flags > 0
  );
}

export function isTextVNode(inst: VNode): boolean {
  return inst.flags === VNodeFlags.Text;
}

export function isFunctionalVNode(instance: VNode): boolean {
  return (
    isVNode(instance) && Boolean(instance.flags & VNodeFlags.ComponentFunction)
  );
}

export function isClassVNode(instance: VNode): boolean {
  return (
    isVNode(instance) && Boolean(instance.flags & VNodeFlags.ComponentClass)
  );
}

export function isComponentVNode(inst: VNode): boolean {
  return isFunctionalVNode(inst) || isClassVNode(inst);
}

export function getTagNameOfVNode(inst: any) {
  return (
    (inst && inst.dom && inst.dom.tagName.toLowerCase()) ||
    (inst && inst.$V && inst.$V.dom && inst.$V.dom.tagName.toLowerCase()) ||
    undefined
  );
}

export function isDOMVNode(inst: VNode): boolean {
  return !isComponentVNode(inst) && !isTextVNode(inst);
}

export class Wrapper extends Component<any, any> {
  public render() {
    return this.props.children;
  }

  public repaint() {
    return new Promise<void>(resolve => this.setState({}, resolve));
  }
}

export function renderIntoDocument(input): Wrapper {
  const wrappedInput = createVNode(
    VNodeFlags.ComponentClass,
    Wrapper,
    null,
    null,
    { children: input }
  );
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  return render(wrappedInput, parent) as any;
}
