import { isFunction, isInvalid, isNullOrUndef, throwError, warning } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { directClone } from '../core/implementation';
import { InfernoNode, VNode } from '../core/types';
import { mount } from './mounting';
import { patch } from './patching';
import { remove } from './unmounting';
import { callAll, options, EMPTY_OBJ, renderCheck } from './utils/common';
import { getDocumentId, registerDocumentScope } from './events/delegation';

const hasDocumentAvailable: boolean = typeof document !== 'undefined';

if (process.env.NODE_ENV !== 'production') {
  if (hasDocumentAvailable && !document.body) {
    warning(
      'Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.'
    );
  }
}

let documentBody: HTMLElement | null = null;

if (hasDocumentAvailable) {
  documentBody = document.body;
  /*
   * Defining $EV and $V properties on Node.prototype
   * fixes v8 "wrong map" de-optimization
   */
  (Node.prototype as any).$EV = null;
  (Node.prototype as any).$V = null;
}

export function __render(
  input: VNode | null | InfernoNode | undefined,
  parentDOM: Element | SVGAElement | ShadowRoot | DocumentFragment | HTMLElement | Node | null,
  callback: Function | null,
  context: any
): void {
  // Development warning
  if (process.env.NODE_ENV !== 'production') {
    if (documentBody === parentDOM) {
      throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
    }
    if (isInvalid(parentDOM)) {
      throwError(`render target ( DOM ) is mandatory, received ${parentDOM === null ? 'null' : typeof parentDOM}`);
    }
  }
  const lifecycle: Function[] = [];
  let rootInput = (parentDOM as any).$V as VNode | null;
  const doc = (parentDOM as Element).ownerDocument as Document;

  if (getDocumentId(doc) === null) {
    registerDocumentScope(doc);
  }

  renderCheck.v = true;

  if (isNullOrUndef(rootInput)) {
    if (!isNullOrUndef(input)) {
      if ((input as VNode).flags & VNodeFlags.InUse) {
        input = directClone(input as VNode);
      }
      mount(input as VNode, parentDOM as Element, context, false, null, lifecycle, doc);
      (parentDOM as any).$V = input;
      rootInput = input as VNode;
    }
  } else {
    if (isNullOrUndef(input)) {
      remove(rootInput as VNode, parentDOM as Element, doc);
      (parentDOM as any).$V = null;
    } else {
      if ((input as VNode).flags & VNodeFlags.InUse) {
        input = directClone(input as VNode);
      }
      patch(rootInput as VNode, input as VNode, parentDOM as Element, context, false, null, lifecycle, doc);
      rootInput = (parentDOM as any).$V = input as VNode;
    }
  }

  if (lifecycle.length > 0) {
    callAll(lifecycle);
  }
  renderCheck.v = false;
  if (isFunction(callback)) {
    (callback as Function)();
  }
  if (isFunction(options.renderComplete)) {
    (options.renderComplete as Function)(rootInput, parentDOM as any);
  }
}

export function render(
  input: VNode | null | InfernoNode | undefined,
  parentDOM: Element | SVGAElement | ShadowRoot | DocumentFragment | HTMLElement | Node | null,
  callback: Function | null = null,
  context: any = EMPTY_OBJ
): void {
  __render(input, parentDOM, callback, context);
}

export function createRenderer(parentDOM?) {
  return function renderer(lastInput, nextInput, callback, context) {
    if (!parentDOM) {
      parentDOM = lastInput;
    }
    render(nextInput, parentDOM, callback, context);
  };
}
