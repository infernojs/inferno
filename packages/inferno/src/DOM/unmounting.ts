/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { isDefined, isFunction, isNull, isNullOrUndef, isObject } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { options, VNode } from '../core/implementation';
import { delegatedEvents } from './constants';
import { handleEvent } from './events/delegation';
import { EMPTY_OBJ, removeChild } from './utils/common';

export function remove(vNode: VNode, parentDom: Element | null) {
  unmount(vNode);

  if (!isNull(parentDom)) {
    removeChild(parentDom, vNode.dom as Element);
    // Let carbage collector free memory
    vNode.dom = null;
  }
}

export function unmount(vNode) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.Element) {
    const ref = vNode.ref as any;
    const props = vNode.props;

    if (isFunction(ref)) {
      ref(null);
    }

    const children = vNode.children;
    const childFlags = vNode.childFlags;

    if (childFlags & ChildFlags.MultipleChildren) {
      unmountAllChildren(children);
    } else if (childFlags & ChildFlags.HasVNodeChildren) {
      unmount(children as VNode);
    }

    if (!isNull(props)) {
      for (const name in props) {
        // Remove all delegated events, regular events die with dom node
        if (isDefined(delegatedEvents[name])) {
          handleEvent(name, null, vNode.dom);
        }
      }
    }
  } else if (flags & VNodeFlags.Component) {
    const instance = vNode.children as any;
    const ref = vNode.ref as any;

    if (flags & VNodeFlags.ComponentClass) {
      if (isFunction(options.beforeUnmount)) {
        options.beforeUnmount(vNode);
      }
      if (isFunction(instance.componentWillUnmount)) {
        instance.componentWillUnmount();
      }
      if (isFunction(ref)) {
        ref(null);
      }
      instance.$UN = true;

      unmount(instance.$LI);
    } else {
      if (!isNullOrUndef(ref) && isFunction(ref.onComponentWillUnmount)) {
        ref.onComponentWillUnmount(vNode.dom, vNode.props || EMPTY_OBJ);
      }

      unmount(instance);
    }
  } else if (flags & VNodeFlags.Portal) {
    const children = vNode.children;

    if (!isNull(children) && isObject(children)) {
      remove(children as VNode, vNode.type);
    }
  }
}

export function unmountAllChildren(children: VNode[]) {
  for (let i = 0, len = children.length; i < len; i++) {
    unmount(children[i]);
  }
}

export function removeAllChildren(dom: Element, children) {
  unmountAllChildren(children);
  dom.textContent = '';
}
