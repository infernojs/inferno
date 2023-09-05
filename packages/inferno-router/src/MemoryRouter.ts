import { Component, createComponentVNode, type VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { createMemoryHistory } from 'history';
import { Router, type TLoaderData } from './Router';
import { warning } from './utils';

export interface IMemoryRouterProps {
  initialEntries?: string[];
  initialIndex?: number;
  initialData?: Record<string, TLoaderData>;
  keyLength?: number;
  children: Array<Component<any, any>>;
}

export class MemoryRouter extends Component<IMemoryRouterProps, any> {
  public history;

  constructor(props?: IMemoryRouterProps, context?: any) {
    super(props, context);
    this.history = createMemoryHistory(props);
  }

  public render(): VNode {
    return createComponentVNode(VNodeFlags.ComponentClass, Router, {
      children: this.props.children,
      history: this.history,
      initialData: this.props.initialData,
    });
  }
}

if (process.env.NODE_ENV !== 'production') {
  MemoryRouter.prototype.componentWillMount = function () {
    warning(
      !this.props.history,
      '<MemoryRouter> ignores the history prop. To use a custom history, ' +
        'use `import { Router }` instead of `import { MemoryRouter as Router }`.',
    );
  };
}
