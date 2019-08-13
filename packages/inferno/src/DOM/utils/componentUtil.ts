import {combineFrom, isFunction, isNull, warning} from 'inferno-shared';
import {createDerivedState, EMPTY_OBJ, getComponentName} from './common';
import {VNode} from './../../core/types';
import {normalizeRoot} from "../../core/implementation";

function warnAboutOldLifecycles(component) {
  const oldLifecycles: string[] = [];

  // Don't warn about react polyfilled components.
  if (component.componentWillMount && component.componentWillMount.__suppressDeprecationWarning !== true) {
    oldLifecycles.push('componentWillMount');
  }

  if (component.componentWillReceiveProps && component.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
    oldLifecycles.push('componentWillReceiveProps');
  }

  if (component.componentWillUpdate && component.componentWillUpdate.__suppressDeprecationWarning !== true) {
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
  const nextInput = normalizeRoot(instance.render(props, instance.state, context));

  let childContext = context;
  if (isFunction(instance.getChildContext)) {
    childContext = combineFrom(context, instance.getChildContext());
  }
  instance.$CX = childContext;

  return nextInput;
}

export function createClassComponentInstance(vNode: VNode, Component, props, context: Object, isSVG: boolean, lifecycle: Function[]) {
  const instance = new Component(props, context);
  const usesNewAPI = (instance.$N = Boolean(Component.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate));

  instance.$SVG = isSVG;
  instance.$L = lifecycle;

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

      const pending = instance.$PS as any;

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
