import { createComponentVNode, Inferno, VNode } from "inferno";
import { VNodeFlags } from 'inferno-vnode-flags';
import { Route } from './Route';
import { ILinkProps, Link } from './Link';
import { combineFrom } from 'inferno-shared';
import type { Location } from 'history';

function filter(i) {
  return i;
}

interface NavLinkProps extends ILinkProps {
  to: string | Location;
  exact?: boolean;
  strict?: boolean;
  location?: any;
  activeClassName?: string;
  activeStyle?: any;
  style?: any;
  isActive?: (match, location) => boolean;
  ariaCurrent?: string;
}

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
}: NavLinkProps & Inferno.LinkHTMLAttributes<HTMLLinkElement>): any {
  function linkComponent({ location, match }): VNode {
    const isActive = Boolean(getIsActive ? getIsActive(match, location) : match);

    return createComponentVNode(
      VNodeFlags.ComponentFunction,
      Link,
      combineFrom(
        {
          'aria-current': isActive && ariaCurrent,
          className: isActive ? [className, activeClassName].filter(filter).join(' ') : className,
          onClick,
          style: isActive ? combineFrom(style, activeStyle) : style,
          to
        },
        rest
      )
    );
  }

  return createComponentVNode(VNodeFlags.ComponentClass, Route, {
    children: linkComponent as any,
    exact,
    location: linkLocation,
    path: typeof to === 'object' ? to.pathname : to,
    strict
  });
}
