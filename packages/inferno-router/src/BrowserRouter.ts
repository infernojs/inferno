/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode, Component } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import createHistory from "history/createBrowserHistory";
import Router from "./Router";
import { warning } from "./utils";

export interface IBrowserRouterProps {
  basename?: string;
  forceRefresh?: boolean;
  getUserConfirmation?: () => {};
  keyLength?: number;
  children: Array<Component<any, any>>;
}

export default class BrowserRouter extends Component<IBrowserRouterProps, any> {
  public history;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.history = createHistory(props);
  }

  public render(): VNode {
    return createVNode(VNodeFlags.ComponentClass, Router, null, null, {
      children: this.props.children,
      history: this.history
    });
  }
}

if (process.env.NODE_ENV !== "production") {
  BrowserRouter.prototype.componentWillMount = function() {
    warning(
      !this.props.history,
      "<BrowserRouter> ignores the history prop. To use a custom history, " +
        "use `import { Router }` instead of `import { BrowserRouter as Router }`."
    );
  };
}
