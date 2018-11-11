import { isArray, isNullOrUndef } from 'inferno-shared';
import { EMPTY_OBJ } from '../utils/common';
import { createWrappedFunction } from './wrapper';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

function updateChildOptions(vNode, value) {
  if (vNode.type === 'option') {
    updateChildOption(vNode, value);
  } else {
    const children = vNode.children as any;
    const flags = vNode.flags;

    if (flags & VNodeFlags.ComponentClass) {
      updateChildOptions(children.$LI, value);
    } else if (flags & VNodeFlags.ComponentFunction) {
      updateChildOptions(children, value);
    } else if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
      updateChildOptions(children, value);
    } else if (vNode.childFlags & ChildFlags.MultipleChildren) {
      for (let i = 0, len = children.length; i < len; ++i) {
        updateChildOptions(children[i], value);
      }
    }
  }
}

function updateChildOption(vNode, value) {
  const props: any = vNode.props || EMPTY_OBJ;
  const dom = vNode.dom;

  // we do this as multiple may have changed
  dom.value = props.value;
  if (props.value === value || (isArray(value) && value.indexOf(props.value) !== -1)) {
    dom.selected = true;
  } else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
    dom.selected = props.selected || false;
  }
}

const onSelectChange = createWrappedFunction('onChange', applyValueSelect);

export function selectEvents(dom) {
  dom.onchange = onSelectChange;
}

export function applyValueSelect(nextPropsOrEmpty, dom, mounting: boolean, vNode) {
  const multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
  if (!isNullOrUndef(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
    dom.multiple = multiplePropInBoolean;
  }
  const childFlags = vNode.childFlags;

  if (childFlags !== ChildFlags.HasInvalidChildren) {
    let value = nextPropsOrEmpty.value;
    if (mounting && isNullOrUndef(value)) {
      value = nextPropsOrEmpty.defaultValue;
    }
    updateChildOptions(vNode, value);
  }
}
