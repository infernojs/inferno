import type {
  InfernoNode,
  VNode,
  ContextObject,
  ParentDOM,
} from '../core/types';
import {
  isFunction,
  isInvalid,
  isNullOrUndef,
  throwError,
  warning,
} from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';
import { directClone } from '../core/implementation';
import { mount } from './mounting';
import { patch } from './patching';
import { remove } from './unmounting';
import {
  AnimationQueues,
  callAll,
  callAllAnimationHooks,
  EMPTY_OBJ,
  renderCheck,
} from './utils/common';
import { type DelegateEventTypes } from './events/delegation';

const hasDocumentAvailable: boolean = typeof document !== 'undefined';

if (process.env.NODE_ENV !== 'production') {
  if (hasDocumentAvailable && !document.body) {
    warning(
      'Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.',
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

  if (window.Node) {
    (Node.prototype as any).$EV = null as DelegateEventTypes | null;
    (Node.prototype as any).$V = null as DelegateEventTypes | null;
  }
}

// noinspection JSUnusedAssignment
export function renderInternal(
  input: VNode | InfernoNode,
  parentDOM: ParentDOM,
  callback: (() => void) | null,
  context: ContextObject,
): void {
  // Development warning
  if (process.env.NODE_ENV !== 'production') {
    if (documentBody === parentDOM) {
      throwError(
        'you cannot render() to the "document.body". Use an empty element as a container instead.',
      );
    }
    if (isInvalid(parentDOM)) {
      throwError(
        `render target ( DOM ) is mandatory, received ${
          parentDOM === null ? 'null' : typeof parentDOM
        }`,
      );
    }
  }
  const lifecycle: Array<() => void> = [];
  const animations: AnimationQueues = new AnimationQueues();
  let rootInput = (parentDOM as any).$V as VNode | null;

  renderCheck.v = true;

  if (isNullOrUndef(rootInput)) {
    if (!isNullOrUndef(input)) {
      if (((input as VNode).flags & VNodeFlags.InUse) !== 0) {
        input = directClone(input as VNode);
      }
      mount(
        input as VNode,
        parentDOM as Element,
        context,
        false,
        null,
        lifecycle,
        animations,
      );
      (parentDOM as any).$V = input;
      rootInput = input as VNode;
    }
  } else {
    if (isNullOrUndef(input)) {
      remove(rootInput, parentDOM as Element, animations);
      (parentDOM as any).$V = null;
    } else {
      if ((input as VNode).flags & VNodeFlags.InUse) {
        input = directClone(input as VNode);
      }
      patch(
        rootInput,
        input as VNode,
        parentDOM as Element,
        context,
        false,
        null,
        lifecycle,
        animations,
      );
      rootInput = (parentDOM as any).$V = input as VNode;
    }
  }
  callAll(lifecycle);
  callAllAnimationHooks(animations.componentDidAppear);

  renderCheck.v = false;
  if (isFunction(callback)) {
    callback();
  }
}

export function render(
  input: VNode | InfernoNode,
  parentDOM: ParentDOM,
  callback: (() => void) | null = null,
  context: ContextObject = EMPTY_OBJ,
): void {
  renderInternal(input, parentDOM, callback, context);
}

export function createRenderer(parentDOM?: ParentDOM) {
  return function renderer(lastInput, nextInput, callback, context) {
    if (!parentDOM) {
      parentDOM = lastInput;
    }
    render(nextInput, parentDOM as ParentDOM, callback, context);
  };
}
