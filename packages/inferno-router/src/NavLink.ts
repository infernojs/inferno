import { createComponentVNode, type Inferno, type VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { Route } from './Route';
import { type ILinkProps, Link } from './Link';
import type { Location } from 'history';

function filter(i): any {
  return i;
}

interface NavLinkProps extends Omit<ILinkProps, 'className'> {
  to: string | Location;
  exact?: boolean;
  strict?: boolean;
  location?: any;
  activeClassName?: string;
  className?: string | ((isActive: boolean) => string);
  activeStyle?: any;
  style?: object | ((isActive: boolean) => string);
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
  className: classNameProp,
  activeStyle,
  style: styleProp,
  isActive: getIsActive,
  ariaCurrent = 'true',
  ...rest
}: NavLinkProps &
  Omit<
    Inferno.LinkHTMLAttributes<HTMLLinkElement>,
    'className' | 'style'
  >): any {
  function linkComponent({ location, match }): VNode {
    const isActive = Boolean(
      getIsActive ? getIsActive(match, location) : match,
    );

    const className =
      typeof classNameProp === 'function'
        ? classNameProp(isActive)
        : classNameProp;

    const style =
      typeof styleProp === 'function' ? styleProp(isActive) : styleProp;

    return createComponentVNode(VNodeFlags.ComponentFunction, Link, {
      'aria-current': ((isActive && ariaCurrent) || null) as any,
      className: isActive
        ? [className, activeClassName].filter(filter).join(' ')
        : className,
      onClick,
      style: isActive ? { ...style, ...activeStyle } : style,
      to,
      ...rest,
    });
  }

  return createComponentVNode(VNodeFlags.ComponentClass, Route, {
    children: linkComponent as any,
    exact,
    location: linkLocation,
    path: typeof to === 'object' ? to.pathname : to,
    strict,
  });
}
