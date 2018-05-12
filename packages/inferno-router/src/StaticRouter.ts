import { Component, createComponentVNode, VNode, Props } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { createPath, parsePath } from 'history';
import { Router } from './Router';
import { invariant, warning } from './utils';

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

// tslint:disable-next-line:no-empty
const noop = () => {};

export interface IStaticRouterProps<P, T> extends Props<P, T> {
  basename?: string;
  context: any;
  location: any;
}

export class StaticRouter<P, S> extends Component<IStaticRouterProps<P, any>, S> {
  public static defaultProps = {
    basename: '',
    location: '/'
  };

  public getChildContext() {
    return {
      router: {
        staticContext: this.props.context
      }
    };
  }

  public createHref = path => addLeadingSlash(this.props.basename + createURL(path));

  public handlePush = location => {
    const { basename, context } = this.props;
    context.action = 'PUSH';
    context.location = addBasename(basename, createLocation(location));
    context.url = createURL(context.location);
  };

  public handleReplace = location => {
    const { basename, context } = this.props;
    context.action = 'REPLACE';
    context.location = addBasename(basename, createLocation(location));
    context.url = createURL(context.location);
  };

  // tslint:disable-next-line:no-empty
  public handleListen = () => noop;

  // tslint:disable-next-line:no-empty
  public handleBlock = () => noop;

  public render(): VNode {
    const { basename, context, location, ...props } = this.props;

    const history = {
      action: 'POP',
      block: this.handleBlock,
      createHref: this.createHref,
      go: staticHandler('go'),
      goBack: staticHandler('goBack'),
      goForward: staticHandler('goForward'),
      listen: this.handleListen,
      location: stripBasename(basename, createLocation(location)),
      push: this.handlePush,
      replace: this.handleReplace
    };

    return createComponentVNode(VNodeFlags.ComponentClass, Router, {
      ...props,
      history
    } as any); // TODO: check these props types!
  }
}

if (process.env.NODE_ENV !== 'production') {
  StaticRouter.prototype.componentWillMount = function() {
    warning(
      !this.props.history,
      '<StaticRouter> ignores the history prop. To use a custom history, ' + 'use `import { Router }` instead of `import { StaticRouter as Router }`.'
    );
  };
}

function normalizeLocation({ pathname = '/', search, hash }) {
  return {
    hash: (hash || '') === '#' ? '' : hash,
    pathname,
    search: (search || '') === '?' ? '' : search
  };
}

function addBasename(basename, location) {
  if (!basename) {
    return location;
  }

  return {
    ...location,
    pathname: addLeadingSlash(basename) + location.pathname
  };
}

function stripBasename(basename, location) {
  if (!basename) {
    return location;
  }

  const base = addLeadingSlash(basename);

  if (location.pathname.indexOf(base) !== 0) {
    return location;
  }

  return {
    ...location,
    pathname: location.pathname.substr(base.length)
  };
}

function createLocation(location) {
  return typeof location === 'string' ? parsePath(location) : normalizeLocation(location);
}

function createURL(location) {
  return typeof location === 'string' ? location : createPath(location);
}

function staticHandler(methodName) {
  return () => {
    invariant(false, 'You cannot %s with <StaticRouter>', methodName);
  };
}
