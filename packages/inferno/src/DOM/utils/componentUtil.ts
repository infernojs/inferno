import type { ContextObject, InfernoNode, VNode } from './../../core/types';
import type { Component } from './../../core/component';
import { isFunction, isNull, warning } from 'inferno-shared';
import { createDerivedState, EMPTY_OBJ, getComponentName } from './common';
import { VNodeFlags } from 'inferno-vnode-flags';
import { normalizeRoot } from '../../core/implementation';

function warnAboutOldLifecycles(component: any): void {
  const oldLifecycles: string[] = [];

  // Don't warn about react polyfilled components.
  if (
    component.componentWillMount &&
    component.componentWillMount.__suppressDeprecationWarning !== true
  ) {
    oldLifecycles.push('componentWillMount');
  }

  if (
    component.componentWillReceiveProps &&
    component.componentWillReceiveProps.__suppressDeprecationWarning !== true
  ) {
    oldLifecycles.push('componentWillReceiveProps');
  }

  if (
    component.componentWillUpdate &&
    component.componentWillUpdate.__suppressDeprecationWarning !== true
  ) {
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

export function renderNewInput(instance, props, context): VNode {
  const nextInput = normalizeRoot(
    instance.render(props, instance.state, context),
  );

  let childContext = context;
  if (isFunction(instance.getChildContext)) {
    childContext = { ...context, ...instance.getChildContext() };
  }
  instance.$CX = childContext;

  return nextInput;
}

export function createClassComponentInstance(
  vNode: VNode,
  ComponentCtr,
  props,
  context: ContextObject,
  isSVG: boolean,
  lifecycle: Array<() => void>,
): Component<any, any> {
  const instance = new ComponentCtr(props, context);
  const usesNewAPI = (instance.$N = Boolean(
    ComponentCtr.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate,
  ));

  instance.$SVG = isSVG;
  instance.$L = lifecycle;

  if (process.env.NODE_ENV !== 'production') {
    if (instance.getDerivedStateFromProps) {
      warning(
        `${getComponentName(
          instance,
        )} getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.`,
      );
    }
    if (usesNewAPI) {
      warnAboutOldLifecycles(instance);
    }
  }

  vNode.children = instance;
  instance.$BS = false;
  instance.context = context;
  if (instance.props === EMPTY_OBJ) {
    instance.props = props;
  }
  if (!usesNewAPI) {
    if (isFunction(instance.componentWillMount)) {
      instance.$BR = true;
      instance.componentWillMount();

      const pending = instance.$PS;

      if (!isNull(pending)) {
        const state = instance.state;

        if (isNull(state)) {
          instance.state = pending;
        } else {
          for (const key in pending) {
            state[key] = pending[key];
          }
        }
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

export function renderFunctionalComponent(
  vNode: VNode,
  context: ContextObject,
): InfernoNode {
  const props = vNode.props || EMPTY_OBJ;
  return vNode.flags & VNodeFlags.ForwardRef
    ? vNode.type.render(props, vNode.ref, context)
    : vNode.type(props, context);
}
