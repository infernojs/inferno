/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { isNullOrUndef } from "inferno-shared";
import { createWrappedFunction } from "./wrapper";

export function isCheckedType(type) {
  return type === "checkbox" || type === "radio";
}

const onTextInputChange = createWrappedFunction("onInput", applyValue);

const wrappedOnChange = createWrappedFunction("onChange");

const onCheckboxChange = createWrappedFunction("onClick", applyValue);

export function processInput(
  vNode,
  dom,
  nextPropsOrEmpty,
  mounting: boolean,
  isControlled: boolean
): void {
  applyValue(nextPropsOrEmpty, dom);
  if (isControlled) {
    dom.vNode = vNode;

    if (mounting) {
      if (isCheckedType(nextPropsOrEmpty.type)) {
        dom.onclick = onCheckboxChange;
      } else {
        dom.oninput = onTextInputChange;
      }
      if (nextPropsOrEmpty.onChange) {
        dom.onchange = wrappedOnChange;
      }
    }
  }
}

export function applyValue(nextPropsOrEmpty, dom) {
  const type = nextPropsOrEmpty.type;
  const value = nextPropsOrEmpty.value;
  const checked = nextPropsOrEmpty.checked;
  const multiple = nextPropsOrEmpty.multiple;
  const defaultValue = nextPropsOrEmpty.defaultValue;
  const hasValue = !isNullOrUndef(value);

  if (type && type !== dom.type) {
    dom.setAttribute("type", type);
  }
  if (multiple && multiple !== dom.multiple) {
    dom.multiple = multiple;
  }
  if (!isNullOrUndef(defaultValue) && !hasValue) {
    dom.defaultValue = defaultValue + "";
  }
  if (isCheckedType(type)) {
    if (hasValue) {
      dom.value = value;
    }
    if (!isNullOrUndef(checked)) {
      dom.checked = checked;
    }
  } else {
    if (hasValue && dom.value !== value) {
      dom.defaultValue = value;
      dom.value = value;
    } else if (!isNullOrUndef(checked)) {
      dom.checked = checked;
    }
  }
}
