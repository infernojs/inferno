import { createComponentVNode, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { Route } from './Route';
import { Link } from './Link';
import { combineFrom } from 'inferno-shared';

function filter(i) {
  return i;
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
}): any {
  function linkComponent({ location, match }): VNode {
    const isActive = !!(getIsActive ? getIsActive(match, location) : match);

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
