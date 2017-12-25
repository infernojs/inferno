/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createComponentVNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { Route } from './Route';

/**
 * @deprecated
 */
export function IndexRoute(props): any {
  if (process.env.NODE_ENV !== 'production') {
    // tslint:disable-next-line:no-console
    console.error('Using IndexRoute is deprecated. Please use Route instead.');
  }
  return createComponentVNode(VNodeFlags.ComponentClass, Route, props);
}
