import { isFunction, isNull, isNullOrUndef } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { VNode } from '../core/types';
import { delegatedEvents, handleEvent } from './events/delegation';
import { EMPTY_OBJ, findDOMfromVNode, removeVNodeDOM } from './utils/common';
import { unmountRef } from '../core/refs';

export function remove(vNode: VNode, parentDOM: Element | null) {
  unmount(vNode);

  if (parentDOM) {
    removeVNodeDOM(vNode, parentDOM);
  }
}

export function unmount(vNode) {
  const flags = vNode.flags;
  const children = vNode.children;
  let ref;

  if (flags & VNodeFlags.Element) {
    ref = vNode.ref as any;
    const props = vNode.props;

    unmountRef(ref);

    const childFlags = vNode.childFlags;

    if (!isNull(props)) {
      const keys = Object.keys(props);

      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (delegatedEvents[key]) {
          handleEvent(key, null, vNode.dom);
        }
      }
    }

    if (childFlags & ChildFlags.MultipleChildren) {
      unmountAllChildren(children);
    } else if (childFlags === ChildFlags.HasVNodeChildren) {
      unmount(children as VNode);
    }
  } else if (children) {
    if (flags & VNodeFlags.ComponentClass) {
      if (isFunction(children.componentWillUnmount)) {
        children.componentWillUnmount();
      }
      unmountRef(vNode.ref);
      children.$UN = true;
      unmount(children.$LI);
    } else if (flags & VNodeFlags.ComponentFunction) {
      ref = vNode.ref;

      if (!isNullOrUndef(ref) && isFunction(ref.onComponentWillUnmount)) {
        ref.onComponentWillUnmount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
      }

      unmount(children);
    } else if (flags & VNodeFlags.Portal) {
      remove(children as VNode, vNode.ref);
    } else if (flags & VNodeFlags.Fragment) {
      if (vNode.childFlags & ChildFlags.MultipleChildren) {
        unmountAllChildren(children);
      }
    } else if (VNodeFlags.WasabyControl) {
      vNode.instance.control._beforeUnmount();
      unmount(vNode.instance.markup);
      vNode.instance.control._mounted = false;
      vNode.instance.control._unmounted = true;
      if (!vNode.instance.control._destroyed) {
          vNode.instance.control.destroy();
      }
    } else if (VNodeFlags.TemplateWasabyNode) {
      unmountAllChildren(vNode.markup);
    }
  }
}

export function unmountAllChildren(children: VNode[]) {
  for (let i = 0, len = children.length; i < len; ++i) {
    unmount(children[i]);
  }
}

export function clearDOM(dom) {
  // Optimization for clearing dom
  dom.textContent = '';
}

export function removeAllChildren(dom: Element, vNode: VNode, children) {
  unmountAllChildren(children);

  if (vNode.flags & VNodeFlags.Fragment) {
    removeVNodeDOM(vNode, dom);
  } else {
    clearDOM(dom);
  }
}
