export * from './core/types';
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
  normalizeRoot
} from './core/implementation';
import { linkEvent } from './DOM/events/linkEvent';
import { __render, createRenderer, render } from './DOM/rendering';
import { AnimationQueues, EMPTY_OBJ, findDOMfromVNode, Fragment, options } from './DOM/utils/common';
import { Component, ComponentType, rerender } from './core/component';
import { mountProps } from './DOM/props';
import { createClassComponentInstance, renderFunctionalComponent } from './DOM/utils/componentUtil';
import { mount, mountClassComponentCallbacks, mountElement, mountFunctionalComponentCallbacks } from './DOM/mounting';
import { createRef, forwardRef, mountRef } from './core/refs';

if (process.env.NODE_ENV !== 'production') {
  // Checks if Inferno is running in jest testing environment.
  const testingEnv = (process && process.env && process.env.JEST_WORKER_ID !== undefined);

  // This message informs developers that they are using development mode (can happen
  // in production because of bundling mistakes) and, therefore, Inferno is slower
  // than in production mode. Skipping the notification for testing mode to keep testing
  // console clear.

  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() {};
  /* tslint:disable-next-line*/
  console.log('Inferno is in development mode.');

  if (!testingEnv && ((testFunc as Function).name || testFunc.toString()).indexOf('testFn') === -1) {
    warning(
      "It looks like you're using a minified copy of the development build " +
        'of Inferno. When deploying Inferno apps to production, make sure to use ' +
        'the production build which skips development warnings and is faster. ' +
        'See http://infernojs.org for more details.'
    );
  }
}

const version = process.env.INFERNO_VERSION;

export {
  AnimationQueues,
  Component,
  ComponentType,
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
  findDOMfromVNode,
  getFlagsForElementVnode,
  linkEvent,
  normalizeProps,
  options,
  render,
  rerender,
  version,
  // Internal methods, used by hydration
  createClassComponentInstance as _CI,
  normalizeRoot as _HI,
  mount as _M,
  mountClassComponentCallbacks as _MCCC,
  mountElement as _ME,
  mountFunctionalComponentCallbacks as _MFCC,
  mountRef as _MR,
  mountProps as _MP,
  __render,
  renderFunctionalComponent as _RFC
};
