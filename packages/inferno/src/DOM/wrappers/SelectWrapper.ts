import { isArray, isNullOrUndef, isNumber } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { EMPTY_OBJ } from '../utils/common';
import { createWrappedFunction } from './wrapper';
import { attachEvent } from '../events/attachEvent';
import { type VNode } from '../../core/types';
import { type Component } from '../../core/component';

function updateChildOptions(vNode: VNode, value): void {
  if (vNode.type === 'option') {
    updateChildOption(vNode, value);
  } else {
    const children = vNode.children;
    const flags = vNode.flags;

    if ((flags & VNodeFlags.ComponentClass) !== 0) {
      updateChildOptions((children as Component).$LI, value);
    } else if ((flags & VNodeFlags.ComponentFunction) !== 0) {
      updateChildOptions(children as VNode, value);
    } else if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
      updateChildOptions(children as VNode, value);
    } else if ((vNode.childFlags & ChildFlags.MultipleChildren) !== 0) {
      for (let i = 0, len = (children as VNode[]).length; i < len; ++i) {
        updateChildOptions((children as VNode[])[i], value);
      }
    }
  }
}

function updateChildOption(vNode: VNode, value: unknown): void {
  const props: any = vNode.props ?? EMPTY_OBJ;
  const propsValue = props.value;
  const dom = vNode.dom as any;

  // we do this as multiple prop may have changed
  dom.value = propsValue;

  if (propsValue === value || (isArray(value) && value.includes(propsValue))) {
    dom.selected = true;
  } else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
    dom.selected = Boolean(props.selected);
  }
}

const onSelectChange = createWrappedFunction('onChange', applyValueSelect);

export function selectEvents(dom): void {
  attachEvent(dom, 'change', onSelectChange);
}

export function applyValueSelect(
  nextPropsOrEmpty,
  dom: any,
  mounting: boolean,
  vNode,
): void {
  const multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
  if (
    !isNullOrUndef(nextPropsOrEmpty.multiple) &&
    multiplePropInBoolean !== dom.multiple
  ) {
    dom.multiple = multiplePropInBoolean;
  }
  const index = nextPropsOrEmpty.selectedIndex;
  if (index === -1) {
    dom.selectedIndex = -1;
  }
  const childFlags = vNode.childFlags;

  if (childFlags !== ChildFlags.HasInvalidChildren) {
    let value = nextPropsOrEmpty.value;
    if (isNumber(index) && index > -1 && !isNullOrUndef(dom.options[index])) {
      value = dom.options[index].value;
    }
    if (mounting && isNullOrUndef(value)) {
      value = nextPropsOrEmpty.defaultValue;
    }
    updateChildOptions(vNode, value);
  }
}
