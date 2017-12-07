/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  isBrowser,
  isFunction,
  isInvalid,
  isUndefined,
  isNullOrUndef,
  NO_OP,
  throwError,
  warning
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import {
  createVNode,
  directClone,
  InfernoChildren,
  InfernoInput,
  options,
  VNode
} from "../core/implementation";
import { hydrateRoot } from "./hydration";
import { mount } from "./mounting";
import { patch } from "./patching";
import { unmount } from "./unmounting";
import { callAll, EMPTY_OBJ } from "./utils/common";

const roots = options.roots;

if (process.env.NODE_ENV !== "production") {
  if (isBrowser && document.body === null) {
    warning(
      'Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.'
    );
  }
}

const documentBody = isBrowser ? document.body : null;

export function render(
  input: InfernoInput,
  parentDom:
    | Element
    | SVGAElement
    | DocumentFragment
    | null
    | HTMLElement
    | Node,
  callback?: Function,
  context = getDefaultContext()
): InfernoChildren {
  // Development warning
  if (process.env.NODE_ENV !== "production") {
    if (documentBody === parentDom) {
      throwError(
        'you cannot render() to the "document.body". Use an empty element as a container instead.'
      );
    }
  }
  if ((input as string) === NO_OP) {
    return;
  }
  const lifecycle = [];
  let rootInput = roots.get(parentDom);

  if (isUndefined(rootInput)) {
    if (!isInvalid(input)) {
      if ((input as VNode).dom) {
        input = directClone(input as VNode);
      }
      if (!hydrateRoot(input, parentDom as any, lifecycle, context)) {
        mount(
          input as VNode,
          parentDom as Element,
          lifecycle,
          context,
          false,
        );
      }
      roots.set(parentDom, input);
      rootInput = input;
    }
  } else {
    if (isNullOrUndef(input)) {
      unmount(rootInput as VNode, parentDom as Element);
      roots.delete(parentDom);
    } else {
      if ((input as VNode).dom) {
        input = directClone(input as VNode);
      }
      patch(
        rootInput as VNode,
        input as VNode,
        parentDom as Element,
        lifecycle,
        context,
        false
      );
      roots.set(parentDom, input);
      rootInput = input;
    }
  }

  callAll(lifecycle);

  if (isFunction(callback)) {
    callback();
  }
  if (rootInput && rootInput.flags & VNodeFlags.Component) {
    return rootInput.children;
  }
}

function getDefaultContext() {
  return typeof options.defaultContext === 'function' ? options.defaultContext() : (options.defaultContext || EMPTY_OBJ);
}

export function createRenderer(parentDom?) {
  return function renderer(lastInput, nextInput) {
    if (!parentDom) {
      parentDom = lastInput;
    }
    render(nextInput, parentDom);
  };
}

export function createPortal(children, container) {
  return createVNode(
    VNodeFlags.Portal,
    container,
    null,
    children,
    null,
    isInvalid(children) ? null : children.key,
    null,
    true
  );
}
