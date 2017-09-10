/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  createTextVNode,
  createVoidVNode,
  directClone,
  options,
  Props,
  VNode
} from "../../core/implementation";
import {
  combineFrom,
  isArray,
  isFunction,
  isInvalid,
  isNullOrUndef,
  isStringOrNumber,
  isUndefined,
  throwError
} from "inferno-shared";
import { EMPTY_OBJ } from "./common";
import VNodeFlags from "inferno-vnode-flags";

export function createClassComponentInstance(
  vNode: VNode,
  Component,
  props: Props,
  context: Object,
  isSVG: boolean,
  lifecycle: Function[]
) {
  if (isUndefined(context)) {
    context = EMPTY_OBJ; // Context should not be mutable
  }
  const instance = new Component(props, context);
  vNode.children = instance;
  instance._blockSetState = false;
  instance.context = context;
  if (instance.props === EMPTY_OBJ) {
    instance.props = props;
  }
  // setState callbacks must fire after render is done when called from componentWillReceiveProps or componentWillMount
  instance._lifecycle = lifecycle;

  instance._unmounted = false;
  instance._isSVG = isSVG;
  if (isFunction(instance.componentWillMount)) {
    instance._blockRender = true;
    instance.componentWillMount();

    if (instance._pendingSetState) {
      const state = instance.state;
      const pending = instance._pendingState;

      if (state === null) {
        instance.state = pending;
      } else {
        for (const key in pending) {
          state[key] = pending[key];
        }
      }
      instance._pendingSetState = false;
      instance._pendingState = null;
    }

    instance._blockRender = false;
  }

  let childContext;
  if (isFunction(instance.getChildContext)) {
    childContext = instance.getChildContext();
  }

  if (isNullOrUndef(childContext)) {
    instance._childContext = context;
  } else {
    instance._childContext = combineFrom(context, childContext);
  }

  if (isFunction(options.beforeRender)) {
    options.beforeRender(instance);
  }

  const input = handleComponentInput(
    instance.render(props, instance.state, context),
    vNode
  );

  if (isFunction(options.afterRender)) {
    options.afterRender(instance);
  }

  instance._lastInput = input;
  return instance;
}

export function handleComponentInput(input: any, componentVNode: VNode): VNode {
  // Development validation
  if (process.env.NODE_ENV !== "production") {
    if (isArray(input)) {
      throwError(
        "a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object."
      );
    }
  }

  if (isInvalid(input)) {
    input = createVoidVNode();
  } else if (isStringOrNumber(input)) {
    input = createTextVNode(input, null);
  } else {
    if (input.dom) {
      input = directClone(input);
    }
    if ((input.flags & VNodeFlags.Component) > 0) {
      // if we have an input that is also a component, we run into a tricky situation
      // where the root vNode needs to always have the correct DOM entry
      // so we break monomorphism on our input and supply it our vNode as parentVNode
      // we can optimise this in the future, but this gets us out of a lot of issues
      input.parentVNode = componentVNode;
    }
  }
  return input;
}
