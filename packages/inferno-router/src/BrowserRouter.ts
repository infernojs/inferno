import { Component, createComponentVNode, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { createBrowserHistory } from 'history';
import { Router, TLoaderData } from './Router';
import { warning } from './utils';

export interface IBrowserRouterProps {
  initialData?: Record<string, TLoaderData>;
  basename?: string;
  forceRefresh?: boolean;
  getUserConfirmation?: () => {};
  keyLength?: number;
  children: Component<any, any>[];
}

export class BrowserRouter extends Component<IBrowserRouterProps, any> {
  public history;

  constructor(props?: IBrowserRouterProps, context?: any) {
    super(props, context);
    this.history = createBrowserHistory();
  }

  public render(): VNode {
    return createComponentVNode(VNodeFlags.ComponentClass, Router, {
      children: this.props.children,
      history: this.history,
      initialData: this.props.initialData
    });
  }
}

if (process.env.NODE_ENV !== 'production') {
  BrowserRouter.prototype.componentWillMount = function () {
    warning(
      !this.props.history,
      '<BrowserRouter> ignores the history prop. To use a custom history, ' + 'use `import { Router }` instead of `import { BrowserRouter as Router }`.'
    );
  };
}
