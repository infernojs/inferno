/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createComponentVNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { NavLink } from './NavLink';

/**
 * @deprecated
 */
export function IndexLink(props): any {
  if (process.env.NODE_ENV !== 'production') {
    // tslint:disable-next-line:no-console
    console.error('Using IndexLink is deprecated. Please use Link or NavLink instead.');
  }

  return createComponentVNode(VNodeFlags.ComponentFunction, NavLink, props);
}
