/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { Component, createComponentVNode, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { createBrowserHistory } from 'history';
import { Router } from './Router';
import { warning } from './utils';

export interface IBrowserRouterProps {
  basename?: string;
  forceRefresh?: boolean;
  getUserConfirmation?: () => {};
  keyLength?: number;
  children: Array<Component<any, any>>;
}

export class BrowserRouter extends Component<IBrowserRouterProps, any> {
  public history;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.history = createBrowserHistory(props);
  }

  public render(): VNode {
    return createComponentVNode(VNodeFlags.ComponentClass, Router, {
      children: this.props.children,
      history: this.history
    });
  }
}

if (process.env.NODE_ENV !== 'production') {
  BrowserRouter.prototype.componentWillMount = function() {
    warning(
      !this.props.history,
      '<BrowserRouter> ignores the history prop. To use a custom history, ' +
        'use `import { Router }` instead of `import { BrowserRouter as Router }`.'
    );
  };
}
