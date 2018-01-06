/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { Component, createVNode, normalizeChildren, VNode } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { invariant } from './utils';

const isModifiedEvent = (event): boolean =>
  Boolean(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export interface ILinkProps {
  onClick?: any;
  target?: string;
  className?: string;
  replace: boolean;
  to?: string | {};
  innerRef: any;
}

/**
 * The public API for rendering a history-aware <a>.
 */
export class Link extends Component<ILinkProps, any> {
  public handleClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      const { history } = this.context.router;
      const { replace = false, to } = this.props;

      if (replace) {
        history.replace(to);
      } else {
        history.push(to);
      }
    }
  };

  public render({
    replace,
    children,
    className,
    to = '',
    innerRef,
    ...rest
  }): VNode {
    invariant(
      this.context.router,
      'You should not use <Link> outside a <Router>'
    );

    const href = this.context.router.history.createHref(
      typeof to === 'string' ? { pathname: to } : to
    );

    return normalizeChildren(
      createVNode(
        VNodeFlags.HtmlElement,
        'a',
        className,
        null,
        ChildFlags.HasInvalidChildren,
        {
          ...rest,
          href,
          onClick: this.handleClick
        },
        null,
        innerRef ? x => innerRef(x) : null
      ),
      children
    );
  }
}
