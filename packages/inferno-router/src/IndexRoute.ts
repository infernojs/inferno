/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import Route from "./Route";

/**
 * @deprecated
 */
export default function(props): any {
  if (process.env.NODE_ENV !== "production") {
    // tslint:disable-next-line:no-console
    console.error("Using IndexRoute is deprecated. Please use Route instead.");
  }
  return createVNode(VNodeFlags.ComponentClass, Route, null, null, props);
}
