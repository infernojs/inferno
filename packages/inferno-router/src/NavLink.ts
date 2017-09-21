/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import Route from "./Route";
import Link from "./Link";

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
export default function(props): any {
  const {
    to,
    exact,
    strict,
    location: linkLocation,
    activeClassName = "active",
    className,
    activeStyle,
    style,
    isActive: getIsActive,
    ariaCurrent = "true",
    children
  } = props;

  const linkComponent = ({ location, match }) => {
    const isActive = !!(getIsActive ? getIsActive(match, location) : match);
    return createVNode(VNodeFlags.ComponentClass, Link, null, null, {
      "aria-current": isActive && ariaCurrent,
      children,
      className: isActive
        ? [className, activeClassName].filter(i => i).join(" ")
        : className,
      exact,
      style: isActive ? { ...style, ...activeStyle } : style,
      to
    });
  };

  return createVNode(VNodeFlags.ComponentClass, Route, null, null, {
    children: linkComponent as any,
    exact,
    location: linkLocation,
    path: typeof to === "object" ? to.pathname : to,
    strict
  });
}
