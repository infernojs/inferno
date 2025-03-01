import { warning } from 'inferno-shared';
import {
  createComponentVNode,
  createFragment,
  createPortal,
  createTextVNode,
  createVNode,
  directClone,
  getFlagsForElementVnode,
  normalizeProps,
  normalizeRoot,
} from './core/implementation';
import { linkEvent } from './DOM/events/linkEvent';
import { renderInternal, createRenderer, render } from './DOM/rendering';
import {
  AnimationQueues,
  EMPTY_OBJ,
  findDOMFromVNode,
  Fragment,
  options,
} from './DOM/utils/common';
import { Component, type ComponentType, rerender } from './core/component';
import { mountProps } from './DOM/props';
import {
  createClassComponentInstance,
  renderFunctionalComponent,
} from './DOM/utils/componentUtil';
import {
  mount,
  mountClassComponentCallbacks,
  mountElement,
  mountFunctionalComponentCallbacks,
} from './DOM/mounting';
import { createRef, forwardRef, mountRef } from './core/refs';
export * from './core/types';

if (process.env.NODE_ENV !== 'production') {
  const skipWarnings =
    typeof SKIP_INFERNO_WARNINGS !== 'undefined' ||
    (typeof process === 'object' &&
      (process.env?.SKIP_INFERNO_WARNINGS !== undefined ||
        process.env?.JEST_WORKER_ID !== undefined));

  if (!skipWarnings) {
    const testFunc = function testFn() {};

    if (
      !((testFunc as Function).name || testFunc.toString()).includes('testFn')
    ) {
      warning(
        "It looks like you're using a minified copy of the development build " +
          'of Inferno. When deploying Inferno apps to production, make sure to use ' +
          'the production build which skips development warnings and is faster. ' +
          'See https://infernojs.org for more details.',
      );
    }
  }
}

const version = process.env.INFERNO_VERSION;

export {
  AnimationQueues,
  Component,
  type ComponentType,
  Fragment,
  EMPTY_OBJ,
  createComponentVNode,
  createFragment,
  createPortal,
  createRef,
  createRenderer,
  createTextVNode,
  createVNode,
  forwardRef,
  directClone,
  findDOMFromVNode,
  getFlagsForElementVnode,
  linkEvent,
  normalizeProps,
  options,
  render,
  rerender,
  version,
  // Internal methods, used by hydration
  createClassComponentInstance as _CI,
  normalizeRoot as _HI, // used by inferno-mobx
  mount as _M,
  mountClassComponentCallbacks as _MCCC,
  mountElement as _ME,
  mountFunctionalComponentCallbacks as _MFCC,
  mountRef as _MR,
  mountProps as _MP,
  renderInternal,
  renderFunctionalComponent as _RFC,
};
