import type { VNode } from '../../core/types';
import { isNullOrUndef } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { applyValueInput, inputEvents, isCheckedType } from './InputWrapper';
import { applyValueSelect, selectEvents } from './SelectWrapper';
import { applyValueTextArea, textAreaEvents } from './TextareaWrapper';

export function processElement(
  flags: VNodeFlags,
  vNode: VNode,
  dom: Element,
  nextPropsOrEmpty,
  mounting: boolean,
  isControlled: boolean,
): void {
  if ((flags & VNodeFlags.InputElement) !== 0) {
    applyValueInput(nextPropsOrEmpty, dom);
  } else if ((flags & VNodeFlags.SelectElement) !== 0) {
    applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode);
  } else if ((flags & VNodeFlags.TextareaElement) !== 0) {
    applyValueTextArea(nextPropsOrEmpty, dom, mounting);
  }
  if (isControlled) {
    (dom as any).$V = vNode;
  }
}

export function addFormElementEventHandlers(
  flags: VNodeFlags,
  dom: Element,
  nextPropsOrEmpty,
): void {
  if ((flags & VNodeFlags.InputElement) !== 0) {
    inputEvents(dom, nextPropsOrEmpty);
  } else if ((flags & VNodeFlags.SelectElement) !== 0) {
    selectEvents(dom);
  } else if ((flags & VNodeFlags.TextareaElement) !== 0) {
    textAreaEvents(dom, nextPropsOrEmpty);
  }
}

export function isControlledFormElement(nextPropsOrEmpty): boolean {
  return isCheckedType(nextPropsOrEmpty.type)
    ? !isNullOrUndef(nextPropsOrEmpty.checked)
    : !isNullOrUndef(nextPropsOrEmpty.value);
}
