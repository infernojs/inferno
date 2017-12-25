/**
 * @module Inferno
 */
/** TypeDoc Comment */
/* tslint:disable:object-literal-sort-keys */
import { NO_OP, warning } from 'inferno-shared';
import {
  createTextVNode,
  createVNode,
  directClone,
  getFlagsForElementVnode,
  InfernoChildren,
  InfernoInput,
  normalizeChildren,
  normalizeProps,
  options,
  Props,
  VNode
} from './core/implementation';
import { isUnitlessNumber as internal_isUnitlessNumber } from './DOM/constants';
import { linkEvent } from './DOM/events/linkEvent';
import { createPortal, createRenderer, render } from './DOM/rendering';
import { EMPTY_OBJ } from './DOM/utils/common';
import { Component } from './core/component';

if (process.env.NODE_ENV !== 'production') {
  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() {};
  if (
    ((testFunc as Function).name || testFunc.toString()).indexOf('testFn') ===
    -1
  ) {
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
  EMPTY_OBJ,
  InfernoChildren,
  InfernoInput,
  NO_OP,
  Props,
  VNode,
  createPortal,
  createRenderer,
  createTextVNode,
  createVNode,
  directClone,
  getFlagsForElementVnode,
  internal_isUnitlessNumber,
  linkEvent,
  normalizeChildren,
  normalizeProps,
  options,
  render,
  version
};
