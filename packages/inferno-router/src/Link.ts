import { linkEvent, createVNode, VNode, MouseEvent } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { invariant } from './utils';

const isModifiedEvent = (event: MouseEvent<any>): boolean => Boolean(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export interface ILinkProps {
  children: any;
  onClick?: any;
  target?: string;
  className?: string;
  replace?: boolean;
  to?: string | {};
  innerRef?: any;
}

function handleClick({ props, context }, event: MouseEvent<any>) {
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
    const { replace = false, to } = props;

    if (replace) {
      history.replace(to);
    } else {
      history.push(to);
    }
  }
}

/**
 * The public API for rendering a history-aware <a>.
 */
export function Link(props: ILinkProps, context): VNode {
  const { replace, children, className, to = '', innerRef, ...rest } = props;
  invariant(context.router, 'You should not use <Link> outside a <Router>');

  const href = context.router.history.createHref(typeof to === 'string' ? { pathname: to } : to);

  return createVNode(
    VNodeFlags.HtmlElement,
    'a',
    className,
    children,
    ChildFlags.UnknownChildren,
    {
      ...rest,
      href,
      onClick: linkEvent(
        {
          context,
          props
        },
        handleClick
      )
    },
    null,
    innerRef ? x => innerRef(x) : null
  );
}
