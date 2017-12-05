/**
 * @module Inferno
 */
/** TypeDoc Comment */
/* tslint:disable:object-literal-sort-keys */
import { NO_OP, warning } from "inferno-shared";
import { default as _VNodeFlags } from "inferno-vnode-flags";
import {
  cloneVNode,
  createVNode,
  getFlagsForElementVnode,
  InfernoChildren,
  InfernoInput,
  normalize as internal_normalize,
  options,
  Props,
  Refs as _Refs,
  Root as _Root,
  VNode
} from "./core/implementation";
import { isUnitlessNumber as internal_isUnitlessNumber } from "./DOM/constants";
import { linkEvent } from "./DOM/events/linkEvent";
import { patch as internal_patch } from "./DOM/patching";
import {
  createPortal,
  createRenderer,
  render
} from "./DOM/rendering";
import {
  EMPTY_OBJ
} from "./DOM/utils/common";
import { Component } from "./core/component";

if (process.env.NODE_ENV !== "production") {
  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() {};
  if (
    ((testFunc as Function).name || testFunc.toString()).indexOf("testFn") ===
    -1
  ) {
    warning(
      "It looks like you're using a minified copy of the development build " +
        "of Inferno. When deploying Inferno apps to production, make sure to use " +
        "the production build which skips development warnings and is faster. " +
        "See http://infernojs.org for more details."
    );
  }
}

// To please the TS God
// https://github.com/Microsoft/TypeScript/issues/6307
export declare const VNodeFlags: _VNodeFlags;
export declare const Root: _Root;
export declare const Refs: _Refs;

const version = process.env.INFERNO_VERSION;

// we duplicate it so it plays nicely with different module loading systems

export default {
  EMPTY_OBJ, // used to shared common items between Inferno libs
  NO_OP, // used to shared common items between Inferno libs
  Component,
  cloneVNode, // cloning
  createPortal,
  createRenderer,
  createVNode, // core shapes
  getFlagsForElementVnode,
  internal_isUnitlessNumber,
  internal_normalize,
  internal_patch,
  linkEvent,
  options,
  render,
  version
};

export {
  Component,
  EMPTY_OBJ,
  InfernoChildren,
  InfernoInput,
  NO_OP,
  Props,
  VNode,
  cloneVNode,
  createPortal,
  createRenderer,
  createVNode,
  getFlagsForElementVnode,
  internal_isUnitlessNumber,
  internal_normalize,
  internal_patch,
  linkEvent,
  options,
  render,
  version
};
