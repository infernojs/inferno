import type { VNode } from '../../core/types';
import { isNullOrUndef } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { applyValueInput, inputEvents, isCheckedType } from './InputWrapper';
import { applyValueSelect, selectEvents } from './SelectWrapper';
import { applyValueTextArea, textAreaEvents } from './TextareaWrapper';

export function processElement(flags: VNodeFlags, vNode: VNode, dom: Element, nextPropsOrEmpty, mounting: boolean, isControlled: boolean): void {
  if (flags & VNodeFlags.InputElement) {
    applyValueInput(nextPropsOrEmpty, dom);
  } else if (flags & VNodeFlags.SelectElement) {
    applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode);
  } else if (flags & VNodeFlags.TextareaElement) {
    applyValueTextArea(nextPropsOrEmpty, dom, mounting);
  }
  if (isControlled) {
    (dom as any).$V = vNode;
  }
}

export function addFormElementEventHandlers(flags: VNodeFlags, dom: Element, nextPropsOrEmpty): void {
  if (flags & VNodeFlags.InputElement) {
    inputEvents(dom, nextPropsOrEmpty);
  } else if (flags & VNodeFlags.SelectElement) {
    selectEvents(dom);
  } else if (flags & VNodeFlags.TextareaElement) {
    textAreaEvents(dom, nextPropsOrEmpty);
  }
}

export function isControlledFormElement(nextPropsOrEmpty): boolean {
  return nextPropsOrEmpty.type && isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef(nextPropsOrEmpty.checked) : !isNullOrUndef(nextPropsOrEmpty.value);
}
