/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode, Component } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import createHistory from "history/createHashHistory";
import Router from "./Router";
import { warning } from "./utils";

export interface IHashRouterProps {
  basename?: string;
  getUserConfirmation?: () => {};
  hashType?: string;
  children: Array<Component<any, any>>;
}

export default class HashRouter extends Component<IHashRouterProps, any> {
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
  HashRouter.prototype.componentWillMount = function() {
    warning(
      !this.props.history,
      "<HashRouter> ignores the history prop. To use a custom history, " +
        "use `import { Router }` instead of `import { HashRouter as Router }`."
    );
  };
}
