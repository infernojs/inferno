import { createFragment, createTextVNode, createVoidVNode, directClone } from '../../core/implementation';
import { combineFrom, isArray, isFunction, isInvalid, isNull, isStringOrNumber, warning } from 'inferno-shared';
import { createDerivedState, EMPTY_OBJ, getComponentName } from './common';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { VNode } from './../../core/types';

function warnAboutOldLifecycles(component) {
  const oldLifecycles: string[] = [];

  if (component.componentWillMount) {
    oldLifecycles.push('componentWillMount');
  }

  if (component.componentWillReceiveProps) {
    oldLifecycles.push('componentWillReceiveProps');
  }

  if (component.componentWillUpdate) {
    oldLifecycles.push('componentWillUpdate');
  }

  if (oldLifecycles.length > 0) {
    warning(`
      Warning: Unsafe legacy lifecycles will not be called for components using new component APIs.
      ${getComponentName(component)} contains the following legacy lifecycles:
      ${oldLifecycles.join('\n')}
      The above lifecycles should be removed.
    `);
  }
}

export function renderNewInput(instance, props, context) {
  const nextInput = handleComponentInput(instance.render(props, instance.state, context));

  let childContext = context;
  if (isFunction(instance.getChildContext)) {
    childContext = combineFrom(context, instance.getChildContext());
  }
  instance.$CX = childContext;

  return nextInput;
}

export function createClassComponentInstance(vNode: VNode, Component, props, context: Object) {
  const instance = new Component(props, context);
  const usesNewAPI = (instance.$N = Boolean(Component.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate));

  if (process.env.NODE_ENV !== 'production') {
    if ((instance as any).getDerivedStateFromProps) {
      warning(
        `${getComponentName(instance)} getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.`
      );
    }
    if (usesNewAPI) {
      warnAboutOldLifecycles(instance);
    }
  }

  vNode.children = instance as any;
  instance.$BS = false;
  instance.context = context;
  if (instance.props === EMPTY_OBJ) {
    instance.props = props;
  }
  if (!usesNewAPI) {
    if (isFunction(instance.componentWillMount)) {
      instance.$BR = true;
      instance.componentWillMount();

      if (instance.$PSS) {
        const state = instance.state;
        const pending = instance.$PS as any;

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
  } else {
    instance.state = createDerivedState(instance, props, instance.state);
  }

  instance.$LI = renderNewInput(instance, props, context);

  return instance;
}

export function handleComponentInput(input: any): VNode {
  if (isInvalid(input)) {
    input = createVoidVNode();
  } else if (isStringOrNumber(input)) {
    input = createTextVNode(input, null);
  } else if (isArray(input)) {
    input = createFragment(input, ChildFlags.UnknownChildren, null);
  } else if (input.flags & VNodeFlags.InUse) {
    input = directClone(input);
  }
  return input;
}
