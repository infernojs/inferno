import {isNullOrUndef} from 'inferno-shared';
import {VNodeFlags} from 'inferno-vnode-flags';
import {VNode} from '../../core/types';
import {applyValueInput, inputEvents, isCheckedType} from './InputWrapper';
import {applyValueSelect, selectEvents} from './SelectWrapper';
import {applyValueTextArea, textAreaEvents} from './TextareaWrapper';

/**
 * There is currently no support for switching same input between controlled and nonControlled
 * If that ever becomes a real issue, then re design controlled elements
 * Currently user must choose either controlled or non-controlled and stick with that
 */

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
