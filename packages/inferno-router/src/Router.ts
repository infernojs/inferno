/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode } from "inferno";
import { Component } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import match, { matchPath } from "./match";
import RouterContext from "./RouterContext";
import { IRouterProps } from "./routerprops";

function createrRouter(history) {
  if (!history) {
    throw new TypeError(
      'Inferno: Error "inferno-router" requires a history prop passed'
    );
  }
  return {
    createHref: history.createHref,
    listen: history.listen,
    push: history.push,
    replace: history.replace,
    isActive(url) {
      return matchPath(true, url, this.url);
    },
    get location() {
      return history.location.pathname !== "blank"
        ? history.location
        : {
            pathname: "/",
            search: ""
          };
    },
    get url() {
      return this.location.pathname + this.location.search;
    }
  };
}

export default class Router extends Component<IRouterProps, any> {
  public router: any;
  public unlisten: any;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.router = createrRouter(props.history);
    this.state = {
      url: props.url || this.router.url
    };
  }

  public componentWillMount() {
    if (this.router) {
      this.unlisten = this.router.listen(() => {
        if (typeof this.props.asyncBefore === "function") {
          const self = this;
          this.props.asyncBefore(this.router.url).then(() => {
            self.routeTo(self.router.url);
          });
        } else {
          this.routeTo(this.router.url);
        }
      });
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.url) {
      this.routeTo(nextProps.url);
    }
  }

  public componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  public routeTo(url) {
    this.setState(
      { url },
      this.props.onUpdate ? () => this.props.onUpdate() : void 0
    );
  }

  public render(props): VNode | null {
    const hit = match(props.children, this.state.url);

    if (hit.redirect) {
      setTimeout(() => {
        this.router.replace(hit.redirect);
      }, 0);
      return null;
    }

    return createVNode(VNodeFlags.ComponentClass, RouterContext, null, null, {
      location: this.state.url,
      matched: hit.matched,
      router: this.router
    });
  }
}
