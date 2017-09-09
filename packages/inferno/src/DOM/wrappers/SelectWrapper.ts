/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { isArray, isInvalid, isNullOrUndef } from "inferno-shared";
import { isVNode } from "../../core/VNodes";
import { EMPTY_OBJ } from "../utils";
import {createWrappedFunction} from "./wrapper";

function updateChildOptionGroup(vNode, value) {
  const type = vNode.type;

  if (type === "optgroup") {
    const children = vNode.children;

    if (isArray(children)) {
      for (let i = 0, len = children.length; i < len; i++) {
        updateChildOption(children[i], value);
      }
    } else if (isVNode(children)) {
      updateChildOption(children, value);
    }
  } else {
    updateChildOption(vNode, value);
  }
}

function updateChildOption(vNode, value) {
  const props = vNode.props || EMPTY_OBJ;
  const dom = vNode.dom;

  // we do this as multiple may have changed
  dom.value = props.value;
  if (
    (isArray(value) && value.indexOf(props.value) !== -1) ||
    props.value === value
  ) {
    dom.selected = true;
  } else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
    dom.selected = props.selected || false;
  }
}

const onSelectChange = createWrappedFunction('onChange', applyValue);

export function processSelect(
  vNode,
  dom,
  nextPropsOrEmpty,
  mounting: boolean,
  isControlled: boolean
) {
  applyValue(vNode, dom, nextPropsOrEmpty, mounting);

  if (isControlled) {
    dom.vNode = vNode;

    if (mounting) {
      dom.onchange = onSelectChange;
    }
  }
}

export function applyValue(vNode, dom, nextPropsOrEmpty, mounting: boolean) {
  if (nextPropsOrEmpty.multiple !== dom.multiple) {
    dom.multiple = nextPropsOrEmpty.multiple;
  }
  const children = vNode.children;

  if (!isInvalid(children)) {
    let value = nextPropsOrEmpty.value;
    if (mounting && isNullOrUndef(value)) {
      value = nextPropsOrEmpty.defaultValue;
    }
    if (isArray(children)) {
      for (let i = 0, len = children.length; i < len; i++) {
        updateChildOptionGroup(children[i], value);
      }
    } else if (isVNode(children)) {
      updateChildOptionGroup(children, value);
    }
  }
}
