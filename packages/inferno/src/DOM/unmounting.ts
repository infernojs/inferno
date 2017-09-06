/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isObject,
  isUndefined,
  LifecycleClass
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import { options } from "../core/options";
import { VNode } from "../core/VNodes";
import { isAttrAnEvent, patchEvent } from "./patching";
import { poolComponent, poolElement } from "./recycling";
import { componentToDOMNodeMap } from "./rendering";
import { EMPTY_OBJ, removeChild } from "./utils";

export function unmount(
  vNode: VNode,
  parentDom: Element | null,
  lifecycle: LifecycleClass,
  canRecycle: boolean,
  isRecycling: boolean
) {
  const flags = vNode.flags;
  const dom = vNode.dom as Element;

  if (flags & VNodeFlags.Component) {
    const instance = vNode.children as any;
    const isStatefulComponent: boolean =
      (flags & VNodeFlags.ComponentClass) > 0;
    const props = vNode.props || EMPTY_OBJ;
    const ref = vNode.ref as any;

    if (!isRecycling) {
      if (isStatefulComponent) {
        if (!instance._unmounted) {
          if (!isNull(options.beforeUnmount)) {
            options.beforeUnmount(vNode);
          }
          if (!isUndefined(instance.componentWillUnmount)) {
            instance.componentWillUnmount();
          }
          if (ref && !isRecycling) {
            ref(null);
          }
          instance._unmounted = true;
          if (options.findDOMNodeEnabled) {
            componentToDOMNodeMap.delete(instance);
          }

          unmount(
            instance._lastInput,
            null,
            instance._lifecycle,
            false,
            isRecycling
          );
        }
      } else {
        if (!isNullOrUndef(ref)) {
          if (!isNullOrUndef(ref.onComponentWillUnmount)) {
            ref.onComponentWillUnmount(dom, props);
          }
        }

        unmount(instance, null, lifecycle, false, isRecycling);
      }
    }
    if (
      options.recyclingEnabled &&
      !isStatefulComponent &&
      (parentDom || canRecycle)
    ) {
      poolComponent(vNode);
    }
  } else if (flags & VNodeFlags.Element) {
    const ref = vNode.ref as any;
    const props = vNode.props;

    if (!isRecycling && isFunction(ref)) {
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
            unmount(child as VNode, null, lifecycle, false, isRecycling);
          }
        }
      } else if (isObject(children)) {
        unmount(children as VNode, null, lifecycle, false, isRecycling);
      }
    }

    if (!isNull(props)) {
      for (const name in props) {
        // do not add a hasOwnProperty check here, it affects performance
        if (props[name] !== null && isAttrAnEvent(name)) {
          patchEvent(name, props[name], null, dom);
          // We need to set this null, because same props otherwise come back if SCU returns false and we are recyling
          props[name] = null;
        }
      }
    }
    if (options.recyclingEnabled && (parentDom || canRecycle)) {
      poolElement(vNode);
    }
  }

  if (!isNull(parentDom)) {
    removeChild(parentDom, dom as Element);
  }
}
