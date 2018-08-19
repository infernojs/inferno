import {
  createFragment,
  createTextVNode,
  createVoidVNode,
  directClone,
  options,
  Props,
  VNode
} from '../../core/implementation';
import {combineFrom, isArray, isFunction, isInvalid, isNull, isNullOrUndef, isStringOrNumber} from 'inferno-shared';
import {EMPTY_OBJ} from './common';
import {ChildFlags, VNodeFlags} from 'inferno-vnode-flags';

export function createClassComponentInstance<P>(vNode: VNode, Component, props: Props<P>, context: Object) {
  const instance = new Component(props, context);
  vNode.children = instance;
  instance.$V = vNode;
  instance.$BS = false;
  instance.context = context;
  if (instance.props === EMPTY_OBJ) {
    instance.props = props;
  }
  instance.$UN = false;
  if (isFunction(instance.componentWillMount)) {
    instance.$BR = true;
    instance.componentWillMount();

    if (instance.$PSS) {
      const state = instance.state;
      const pending = instance.$PS;

      if (isNull(state)) {
        instance.state = pending;
      } else {
        for (const key in pending) {
          state[key] = pending[key];
        }
      }
      instance.$PSS = false;
      instance.$PS = null;
    }

    instance.$BR = false;
  }

  if (isFunction(options.beforeRender)) {
    options.beforeRender(instance);
  }

  const input = handleComponentInput(instance.render(props, instance.state, context));

  let childContext;
  if (isFunction(instance.getChildContext)) {
    childContext = instance.getChildContext();
  }

  if (isNullOrUndef(childContext)) {
    instance.$CX = context;
  } else {
    instance.$CX = combineFrom(context, childContext);
  }

  if (isFunction(options.afterRender)) {
    options.afterRender(instance);
  }

  instance.$LI = input;
  return instance;
}

export function handleComponentInput(input: any): VNode {
  if (isInvalid(input)) {
    input = createVoidVNode();
  } else if (isStringOrNumber(input)) {
    input = createTextVNode(input, null);
  } else if (isArray(input)) {
    input = createFragment(input, ChildFlags.UnknownChildren, null);
  } else {
    if (input.flags & VNodeFlags.InUse) {
      input = directClone(input);
    }
  }
  return input;
}
