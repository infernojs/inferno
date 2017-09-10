/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { createVNode, VNode, Component } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import { addLeadingSlash, createPath, parsePath } from "history/PathUtils";
import Router from "./Router";
import { warning, invariant } from "./utils";

const noop = () => {};
const EMPTY_OBJ = {} as VNode;

export interface IStaticRouterProps {
  basename?: string;
  context: any;
  location: any;
}

export default class StaticRouter extends Component<IStaticRouterProps, any> {
  static defaultProps = {
    basename: "",
    location: "/"
  };

  getChildContext() {
    return {
      router: {
        staticContext: this.props.context
      }
    };
  }

  createHref = path => addLeadingSlash(this.props.basename + createURL(path));

  handlePush = location => {
    const { basename, context } = this.props;
    context.action = "PUSH";
    context.location = addBasename(basename, createLocation(location));
    context.url = createURL(context.location);
  };

  handleReplace = location => {
    const { basename, context } = this.props;
    context.action = "REPLACE";
    context.location = addBasename(basename, createLocation(location));
    context.url = createURL(context.location);
  };

  handleListen = () => noop;

  handleBlock = () => noop;

  componentWillMount() {
    warning(
      !this.props.history,
      "<StaticRouter> ignores the history prop. To use a custom history, " +
        "use `import { Router }` instead of `import { StaticRouter as Router }`."
    );
  }

  render() {
    const { basename, context, location, ...props } = this.props;

    const history = {
      createHref: this.createHref,
      action: "POP",
      location: stripBasename(basename, createLocation(location)),
      push: this.handlePush,
      replace: this.handleReplace,
      go: staticHandler("go"),
      goBack: staticHandler("goBack"),
      goForward: staticHandler("goForward"),
      listen: this.handleListen,
      block: this.handleBlock
    };

    props.children = props.children || EMPTY_OBJ;

    return createVNode(VNodeFlags.ComponentClass, Router, null, null, {
      ...props,
      history: history
    });
  }
}

function normalizeLocation({ pathname = "/", search, hash }) {
  return {
    pathname,
    search: (search || "") === "?" ? "" : search,
    hash: (hash || "") === "#" ? "" : hash
  };
}

function addBasename(basename, location) {
  if (!basename) return location;

  return {
    ...location,
    pathname: addLeadingSlash(basename) + location.pathname
  };
}

function stripBasename(basename, location) {
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location.pathname.indexOf(base) !== 0) return location;

  return {
    ...location,
    pathname: location.pathname.substr(base.length)
  };
}

function createLocation(location) {
  return typeof location === "string"
    ? parsePath(location)
    : normalizeLocation(location);
}

function createURL(location) {
  return typeof location === "string" ? location : createPath(location);
}

function staticHandler(methodName) {
  return () => {
    invariant(false, "You cannot %s with <StaticRouter>", methodName);
  };
}
