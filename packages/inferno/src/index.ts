import { NO_OP, warning } from 'inferno-shared';
import {
  createComponentVNode,
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
  VNode
} from './core/implementation';
import { linkEvent, LinkedEvent } from './DOM/events/linkEvent';
import { createPortal, createRenderer, render } from './DOM/rendering';
import { EMPTY_OBJ } from './DOM/utils/common';
import { Component, ComponentClass, ComponentType, SFC, StatelessComponent } from './core/component';
import { getNumberStyleValue } from './DOM/props';
import { hydrate } from './DOM/hydration';

import * as JSX from './JSX';
export * from './DOM/events/events';

if (process.env.NODE_ENV !== 'production') {
  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() {};
  if (((testFunc as Function).name || testFunc.toString()).indexOf('testFn') === -1) {
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
  Component,
  ComponentType,
  SFC,
  StatelessComponent,
  ComponentClass,
  EMPTY_OBJ,
  InfernoChildren,
  InfernoInput,
  NO_OP,
  Props,
  Ref,
  Refs,
  VNode,
  createComponentVNode,
  createPortal,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  getFlagsForElementVnode,
  getNumberStyleValue,
  hydrate,
  linkEvent,
  LinkedEvent,
  normalizeProps,
  options,
  render,
  version,
  JSX
};
