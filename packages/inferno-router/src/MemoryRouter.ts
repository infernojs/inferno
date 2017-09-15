/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode, Component } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import createHistory from "history/createMemoryHistory";
import Router from "./Router";
import { warning } from "./utils";

export interface IMemoryRouterProps {
  initialEntries: string[];
  initialIndex: number;
  getUserConfirmation: () => {};
  keyLength: number;
  children: Component<any, any>[];
}

const EMPTY_OBJ = {} as VNode;

export default class MemoryRouter extends Component<IMemoryRouterProps, any> {
  public history;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.history = createHistory(props);
  }

  public componentWillMount() {
    warning(
      !this.props.history,
      "<MemoryRouter> ignores the history prop. To use a custom history, " +
        "use `import { Router }` instead of `import { MemoryRouter as Router }`."
    );
  }

  public render(): VNode {
    return createVNode(VNodeFlags.ComponentClass, Router, null, null, {
      children: this.props.children || EMPTY_OBJ,
      history: this.history
    });
  }
}
