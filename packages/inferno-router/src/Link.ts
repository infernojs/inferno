/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode, Component } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import { invariant } from "./utils";

const isModifiedEvent = (event): boolean =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export interface ILinkProps {
  onClick?: any;
  target: string;
  className?: string;
  replace: boolean;
  to: string | {};
  innerRef: any;
}

/**
 * The public API for rendering a history-aware <a>.
 */
export default class Link extends Component<ILinkProps, any> {
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

  public render(): VNode {
    const { replace, className, to, innerRef, ...props } = this.props;

    invariant(
      this.context.router,
      "You should not use <Link> outside a <Router>"
    );

    const href = this.context.router.history.createHref(
      typeof to === "string" ? { pathname: to } : to
    );

    return createVNode(
      VNodeFlags.HtmlElement,
      "a",
      className,
      null,
      {
        ...props,
        href,
        onClick: this.handleClick
      },
      null,
      x => x && innerRef && innerRef(x)
    );
  }
}
