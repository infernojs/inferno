import { isFunction, isNullOrUndef } from 'inferno-shared';
import { createWrappedFunction } from './wrapper';
import { attachEvent } from '../events/attachEvent';
import { type NonEmptyProps } from '../../core/types';

const onTextareaInputChange = createWrappedFunction(
  'onInput',
  applyValueTextArea,
);
const wrappedOnChange = createWrappedFunction('onChange');

export function textAreaEvents(dom, nextPropsOrEmpty): void {
  attachEvent(dom, 'input', onTextareaInputChange);
  if (isFunction(nextPropsOrEmpty.onChange)) {
    attachEvent(dom, 'change', wrappedOnChange);
  }
}

export function applyValueTextArea(
  nextPropsOrEmpty: NonEmptyProps,
  dom,
  mounting: boolean,
): void {
  const value = nextPropsOrEmpty.value;
  const domValue = dom.value;

  if (isNullOrUndef(value)) {
    if (mounting) {
      const defaultValue = nextPropsOrEmpty.defaultValue;

      if (!isNullOrUndef(defaultValue) && defaultValue !== domValue) {
        dom.defaultValue = defaultValue;
        dom.value = defaultValue;
      }
    }
  } else if (domValue !== value) {
    /* There is value so keep it controlled */
    dom.defaultValue = value;
    dom.value = value;
  }
}
