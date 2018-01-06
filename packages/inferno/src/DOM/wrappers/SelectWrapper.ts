/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { isArray, isNullOrUndef } from 'inferno-shared';
import { EMPTY_OBJ } from '../utils/common';
import { createWrappedFunction } from './wrapper';
import { ChildFlags } from 'inferno-vnode-flags';

function updateChildOptionGroup(vNode, value) {
  const type = vNode.type;

  if (type === 'optgroup') {
    const children = vNode.children;
    const childFlags = vNode.childFlags;

    if (childFlags & ChildFlags.MultipleChildren) {
      for (let i = 0, len = children.length; i < len; i++) {
        updateChildOption(children[i], value);
      }
    } else if (childFlags & ChildFlags.HasVNodeChildren) {
      updateChildOption(children, value);
    }
  } else {
    updateChildOption(vNode, value);
  }
}

function updateChildOption(vNode, value) {
  const props: any = vNode.props || EMPTY_OBJ;
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
  applyValue(nextPropsOrEmpty, dom, mounting, vNode);

  if (isControlled) {
    dom.vNode = vNode;

    if (mounting) {
      dom.onchange = onSelectChange;
    }
  }
}

export function applyValue(nextPropsOrEmpty, dom, mounting: boolean, vNode) {
  if (
    !isNullOrUndef(nextPropsOrEmpty.multiple) &&
    nextPropsOrEmpty.multiple !== dom.multiple
  ) {
    dom.multiple = nextPropsOrEmpty.multiple;
  }
  const childFlags = vNode.childFlags;

  if ((childFlags & ChildFlags.HasInvalidChildren) === 0) {
    const children = vNode.children;
    let value = nextPropsOrEmpty.value;
    if (mounting && isNullOrUndef(value)) {
      value = nextPropsOrEmpty.defaultValue;
    }
    if (childFlags & ChildFlags.MultipleChildren) {
      for (let i = 0, len = children.length; i < len; i++) {
        updateChildOptionGroup(children[i], value);
      }
    } else if (childFlags & ChildFlags.HasVNodeChildren) {
      updateChildOptionGroup(children, value);
    }
  }
}
