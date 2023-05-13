import { createVNode, Inferno, InfernoMouseEvent, linkEvent, VNode } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { invariant } from './utils';
import { combineFrom, isString } from 'inferno-shared';
import type { Location } from 'history';
import { parsePath } from 'history';
import { normalizeToLocation, splitLocation } from './locationUtils';

const isModifiedEvent = (event: InfernoMouseEvent<any>): boolean => Boolean(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export interface ILinkProps {
  children?: any;
  onClick?: any;
  target?: string;
  className?: string;
  replace?: boolean;
  to?: string | Partial<Location>; // INVESTIGATE: Should Partial<Location> be Partial<Path> instead since this is what is returned by history.parsePath?
  innerRef?: any;
}

function handleClick({ props, context }, event: InfernoMouseEvent<any>) {
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
export function Link(props: ILinkProps & Inferno.LinkHTMLAttributes<HTMLLinkElement>, context): VNode {
  const { replace, children, className, to = '', innerRef, ...rest } = props;
  invariant(context.router, 'You should not use <Link> outside a <Router>');

  const href = context.router.history.createHref(isString(to) ? parsePath(to) : to);
  const newProps: any = combineFrom(rest, null);

  newProps.href = href;
  newProps.onClick = linkEvent(
    {
      context,
      props
    },
    handleClick
  );

  return createVNode(VNodeFlags.HtmlElement, 'a', className, children, ChildFlags.UnknownChildren, newProps, null, innerRef);
}
