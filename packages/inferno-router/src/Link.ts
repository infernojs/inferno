import {
  createVNode,
  type Inferno,
  type InfernoMouseEvent,
  linkEvent,
  type VNode,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { invariant } from './utils';
import { isString } from 'inferno-shared';
import type { Location } from 'history';
import { parsePath } from 'history';
import { normalizeToLocation, splitLocation } from './locationUtils';

const isModifiedEvent = (event: InfernoMouseEvent<any>): boolean =>
  Boolean(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export interface ILinkProps {
  children?: any;
  onClick?: any;
  target?: string;
  className?: string;
  replace?: boolean;
  to?: string | Partial<Location>; // INVESTIGATE: Should Partial<Location> be Partial<Path> instead since this is what is returned by history.parsePath?
  innerRef?: any;
}

function handleClick({ props, context }, event: InfernoMouseEvent<any>): void {
  if (props.onClick) {
    props.onClick(event);
  }

  if (
    !event.defaultPrevented && // onClick prevented default
    event.button === 0 && // ignore everything but left clicks
    !props.target && // let browser handle "target=_blank" etc.
    !isModifiedEvent(event) // ignore clicks with modifier keys
  ) {
    event.preventDefault();

    const { history } = context.router;
    const { replace = false, to: toPropIn } = props;
    const { to, state } = splitLocation(normalizeToLocation(toPropIn));

    if (replace) {
      history.replace(to, state);
    } else {
      history.push(to, state);
    }
  }
}

/**
 * The public API for rendering a history-aware <a>.
 */
export function Link(
  props: ILinkProps & Inferno.LinkHTMLAttributes<HTMLLinkElement>,
  context,
): VNode {
  // "replace" is not purpose left out by spreading the properties
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { replace, children, className, to = '', innerRef, ...rest } = props;
  invariant(context.router, 'You should not use <Link> outside a <Router>');

  const href = context.router.history.createHref(
    isString(to) ? parsePath(to) : to,
  );
  const newProps: any = { ...rest };

  newProps.href = href;
  newProps.onClick = linkEvent(
    {
      context,
      props,
    },
    handleClick,
  );

  return createVNode(
    VNodeFlags.HtmlElement,
    'a',
    className,
    children,
    ChildFlags.UnknownChildren,
    newProps,
    null,
    innerRef,
  );
}
