/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { Route } from './Route';
import { Link } from './Link';

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
export function NavLink({
  to,
  exact,
  strict,
  onClick,
  location: linkLocation,
  activeClassName = 'active',
  className,
  activeStyle,
  style,
  isActive: getIsActive,
  ariaCurrent = 'true',
  ...rest
}): any {
  function linkComponent({ location, match }): VNode {
    const isActive = !!(getIsActive ? getIsActive(match, location) : match);
    return createVNode(VNodeFlags.ComponentClass, Link, null, null, {
      'aria-current': isActive && ariaCurrent,
      className: isActive
        ? [className, activeClassName].filter(i => i).join(' ')
        : className,
      exact,
      onClick,
      style: isActive ? { ...style, ...activeStyle } : style,
      to,
      ...rest
    });
  }

  return createVNode(VNodeFlags.ComponentClass, Route, null, null, {
    children: linkComponent as any,
    exact,
    location: linkLocation,
    path: typeof to === 'object' ? to.pathname : to,
    strict
  });
}
