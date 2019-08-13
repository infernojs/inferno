import {isArray, isNullOrUndef, isNumber} from 'inferno-shared';
import {ChildFlags, VNodeFlags} from 'inferno-vnode-flags';
import {EMPTY_OBJ} from '../utils/common';
import {createWrappedFunction} from './wrapper';
import {attachEvent} from '../events/attachEvent';

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
  attachEvent(dom, 'change', onSelectChange);
}

export function applyValueSelect(nextPropsOrEmpty, dom, mounting: boolean, vNode) {
  const multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
  if (!isNullOrUndef(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
    dom.multiple = multiplePropInBoolean;
  }
  const index = nextPropsOrEmpty.selectedIndex;
  if (index === -1) {
    dom.selectedIndex = -1;
  }
  const childFlags = vNode.childFlags;

  if (childFlags !== ChildFlags.HasInvalidChildren) {
    let value = nextPropsOrEmpty.value;
    if (isNumber(index) && index > -1 && dom.options[index]) {
      value = dom.options[index].value;
    }
    if (mounting && isNullOrUndef(value)) {
      value = nextPropsOrEmpty.defaultValue;
    }
    updateChildOptions(vNode, value);
  }
}
