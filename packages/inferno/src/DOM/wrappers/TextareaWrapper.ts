/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { isNullOrUndef } from 'inferno-shared';
import { createWrappedFunction } from './wrapper';

const onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);

const wrappedOnChange = createWrappedFunction('onChange');

export function textAreaEvents(dom, nextPropsOrEmpty) {
  dom.oninput = onTextareaInputChange;
  if (nextPropsOrEmpty.onChange) {
    dom.onchange = wrappedOnChange;
  }
}

export function applyValueTextArea(nextPropsOrEmpty, dom, mounting: boolean) {
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
