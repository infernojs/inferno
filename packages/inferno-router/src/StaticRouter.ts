import { Component, createComponentVNode, Props, VNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { parsePath } from 'history';
import { Router, TLoaderData } from './Router';
import { combinePath, invariant, warning } from './utils';
import { combineFrom, isString } from 'inferno-shared';

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

// tslint:disable-next-line:no-empty
const noop = () => {};

export interface IStaticRouterProps<T> extends Props<T> {
  initialData?: Record<string, TLoaderData>;
  basename?: string;
  context: any;
  location: any;
}

export class StaticRouter<S> extends Component<IStaticRouterProps<any>, S> {
  public static defaultProps = {
    basename: '',
    location: '/'
  };

  public getChildContext() {
    return {
      router: {
        initialData: this.props.initialData,
        staticContext: this.props.context,
      }
    };
  }

  public createHref = (path) => addLeadingSlash((this.props.basename || '') + createURL(path));

  public handlePush = (location) => {
    const { basename, context } = this.props;
    context.action = 'PUSH';
    context.location = addBasename(basename, isString(location) ? parsePath(location) : location);
    context.url = createURL(context.location);
  };

  public handleReplace = (location) => {
    const { basename, context } = this.props;
    context.action = 'REPLACE';
    context.location = addBasename(basename, isString(location) ? parsePath(location) : location);
    context.url = createURL(context.location);
  };

  // tslint:disable-next-line:no-empty
  public handleListen = () => noop;

  // tslint:disable-next-line:no-empty
  public handleBlock = () => noop;

  public render({ basename, context, location, ...props }): VNode {
    return createComponentVNode(
      VNodeFlags.ComponentClass,
      Router,
      combineFrom(props, {
        history: {
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
        },
      }) as any
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  StaticRouter.prototype.componentWillMount = function () {
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

  return combineFrom(location, { pathname: addLeadingSlash(basename) + location.pathname });
}

function stripBasename(basename: string, location) {
  if (!basename) {
    return location;
  }

  const base = addLeadingSlash(basename);

  if (location.pathname.indexOf(base) !== 0) {
    return location;
  }

  return combineFrom(location, { pathname: location.pathname.substring(base.length) });
}

function createLocation(location) {
  return typeof location === 'string' ? parsePath(location) : normalizeLocation(location);
}

function createURL(location) {
  return typeof location === 'string' ? location : combinePath(location);
}

function staticHandler(methodName) {
  return () => {
    invariant(false, 'You cannot %s with <StaticRouter>', methodName);
  };
}
