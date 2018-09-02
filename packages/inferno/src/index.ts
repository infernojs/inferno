import { warning } from 'inferno-shared';
import {
  createComponentVNode,
  createPortal,
  createTextVNode,
  createVNode,
  directClone,
  getFlagsForElementVnode,
  InfernoChildren,
  InfernoInput,
  normalizeProps,
  options,
  Props,
  Ref,
  Refs,
  VNode,
  createFragment
} from './core/implementation';
import { linkEvent, LinkedEvent } from './DOM/events/linkEvent';
import { createRenderer, render } from './DOM/rendering';
import { EMPTY_OBJ, findDOMfromVNode, LIFECYCLE } from './DOM/utils/common';
import { Component, ComponentClass, ComponentType, SFC, StatelessComponent, rerender } from './core/component';
import { mountProps } from './DOM/props';

import * as JSX from './JSX';
import { handleComponentInput, createClassComponentInstance } from './DOM/utils/componentutil';
import { mount, mountClassComponentCallbacks, mountElement, mountFunctionalComponentCallbacks, mountRef, mountText } from './DOM/mounting';

export * from './DOM/events/events';

if (process.env.NODE_ENV !== 'production') {
  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() {};
  /* tslint:disable-next-line*/
  console.info('Inferno is in development mode.');

  if (((testFunc as Function).name || testFunc.toString()).indexOf('testFn') === -1) {
    warning(
      "It looks like you're using a minified copy of the development build " +
        'of Inferno. When deploying Inferno apps to production, make sure to use ' +
        'the production build which skips development warnings and is faster. ' +
        'See http://infernojs.org for more details.'
    );
  }
}

const Fragment = '$F';
const version = process.env.INFERNO_VERSION;

function createRef() {
  if (process.env.NODE_ENV === 'production') {
    return {
      current: null
    }
  }

  const refObject = {
    current: null
  };

  Object.seal(refObject);

  return refObject;
}

export {
  Component,
  ComponentType,
  SFC,
  StatelessComponent,
  ComponentClass,
  Fragment,
  EMPTY_OBJ,
  InfernoChildren,
  InfernoInput,
  Props,
  Ref,
  Refs,
  VNode,
  createComponentVNode,
  createFragment,
  createPortal,
  createRef,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  findDOMfromVNode,
  getFlagsForElementVnode,
  linkEvent,
  LinkedEvent,
  normalizeProps,
  options,
  render,
  rerender,
  version,
  JSX,

  // Internal methods, used by hydration
  LIFECYCLE as _L,
  createClassComponentInstance as _CI,
  handleComponentInput as _HI,
  mount as _M,
  mountClassComponentCallbacks as _MCCC,
  mountElement as _ME,
  mountFunctionalComponentCallbacks as _MFCC,
  mountRef as _MR,
  mountText as _MT,
  mountProps as _MP
};
