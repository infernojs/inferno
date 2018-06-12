import { isBrowser, isFunction, isInvalid, isNull, isNullOrUndef, NO_OP, throwError, warning } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVNode, directClone, InfernoChildren, InfernoInput, options, VNode } from '../core/implementation';
import { hydrate } from './hydration';
import { mount } from './mounting';
import { patch } from './patching';
import { remove } from './unmounting';
import { callAll, EMPTY_OBJ, LIFECYCLE } from './utils/common';

if (process.env.NODE_ENV !== 'production') {
  if (isBrowser && document.body === null) {
    warning(
      'Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.'
    );
  }
}

const documentBody = isBrowser ? document.body : null;

export function render(
  input: InfernoInput,
  parentDom: Element | SVGAElement | DocumentFragment | HTMLElement | Node | null,
  callback?: Function
): InfernoChildren | void {
  // Development warning
  if (process.env.NODE_ENV !== 'production') {
    if (documentBody === parentDom) {
      throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
    }
  }
  if ((input as string) === NO_OP) {
    return;
  }

  let rootInput = (parentDom as any).$V as VNode;

  if (isNullOrUndef(rootInput)) {
    if (!isInvalid(input)) {
      if ((input as VNode).dom) {
        input = directClone(input as VNode);
      }
      if (isNull((parentDom as Node).firstChild)) {
        mount(input as VNode, parentDom as Element, EMPTY_OBJ, false);
        (parentDom as any).$V = input;
      } else {
        hydrate(input, parentDom as any);
      }
      rootInput = input as VNode;
    }
  } else {
    if (isNullOrUndef(input)) {
      remove(rootInput as VNode, parentDom as Element);
      (parentDom as any).$V = null;
    } else {
      if ((input as VNode).dom) {
        input = directClone(input as VNode);
      }
      patch(rootInput as VNode, input as VNode, parentDom as Element, EMPTY_OBJ, false);
      rootInput = (parentDom as any).$V = input as VNode;
    }
  }

  if (LIFECYCLE.length > 0) {
    callAll(LIFECYCLE);
  }

  if (isFunction(callback)) {
    callback();
  }
  if (isFunction(options.renderComplete)) {
    options.renderComplete(rootInput);
  }
  if (rootInput && rootInput.flags & VNodeFlags.Component) {
    return rootInput.children;
  }
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
  return createVNode(VNodeFlags.Portal, container, null, children, ChildFlags.UnknownChildren, null, isInvalid(children) ? null : children.key, null);
}
