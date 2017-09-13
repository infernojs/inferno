/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isObject
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import { options, VNode } from "../core/implementation";
import { delegatedEvents } from "./constants";
import { handleEvent } from "./events/delegation";
import { componentToDOMNodeMap, EMPTY_OBJ, removeChild } from "./utils/common";

export function unmount(vNode: VNode, parentDom: Element | null) {
  const flags = vNode.flags;
  const dom = vNode.dom as Element;

  if ((flags & VNodeFlags.Component) > 0) {
    const instance = vNode.children as any;
    const isStatefulComponent: boolean =
      (flags & VNodeFlags.ComponentClass) > 0;
    const props = vNode.props || EMPTY_OBJ;
    const ref = vNode.ref as any;

    if (isStatefulComponent) {
      if (!instance.$UN) {
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
        if (options.findDOMNodeEnabled) {
          componentToDOMNodeMap.delete(instance);
        }

        unmount(instance.$LI, null);
      }
    } else {
      if (!isNullOrUndef(ref)) {
        if (isFunction(ref.onComponentWillUnmount)) {
          ref.onComponentWillUnmount(dom, props);
        }
      }

      unmount(instance, null);
    }
  } else if ((flags & VNodeFlags.Element) > 0) {
    const ref = vNode.ref as any;
    const props = vNode.props;

    if (isFunction(ref)) {
      ref(null);
    }

    const children = vNode.children;

    if (!isNullOrUndef(children)) {
      if (isArray(children)) {
        for (
          let i = 0, len = (children as Array<string | number | VNode>).length;
          i < len;
          i++
        ) {
          const child = children[i];

          if (!isInvalid(child) && isObject(child)) {
            unmount(child as VNode, null);
          }
        }
      } else if (isObject(children)) {
        unmount(children as VNode, null);
      }
    }

    if (!isNull(props)) {
      for (const name in props) {
        // Remove all delegated events, regular events die with dom node
        if (delegatedEvents.has(name)) {
          handleEvent(name, null, dom);
        }
      }
    }
  } else if ((flags & VNodeFlags.Portal) > 0) {
    const children = vNode.children;

    if (!isInvalid(children) && isObject(children)) {
      unmount(children as VNode, vNode.type);
    }
  }

  if (!isNull(parentDom)) {
    removeChild(parentDom, dom as Element);
  }
}
