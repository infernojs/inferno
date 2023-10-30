import {
  Component,
  createComponentVNode,
  type InfernoNode,
  type Props,
} from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { Action, type Location, parsePath, type Path } from 'history';
import { Router, type TLoaderData } from './Router';
import { combinePath, invariant, warning } from './utils';
import { isString } from 'inferno-shared';

function addLeadingSlash(path: string): string {
  return path.charAt(0) === '/' ? path : '/' + path;
}

const noop = (): void => {};

export interface IStaticRouterProps<T> extends Props<T> {
  initialData?: Record<string, TLoaderData>;
  basename?: string;
  context: any;
  location: any;
}

export class StaticRouter<P, S> extends Component<
  P & IStaticRouterProps<any>,
  S
> {
  public static defaultProps: {
    basename: string;
    location: Path | string;
  } = {
    basename: '',
    location: '/',
  };

  public getChildContext(): {
    router: {
      initialData?: Record<string, TLoaderData>;
      staticContext: Record<string, unknown>;
    };
  } {
    return {
      router: {
        initialData: this.props.initialData,
        staticContext: this.props.context,
      },
    };
  }

  public createHref = (path: string): string =>
    addLeadingSlash((this.props.basename || '') + createURL(path));

  public handlePush = (location): void => {
    const { basename, context } = this.props;
    context.action = 'PUSH';
    context.location = addBasename(
      basename,
      isString(location) ? parsePath(location) : location,
    );
    context.url = createURL(context.location);
  };

  public handleReplace = (location): void => {
    const { basename, context } = this.props;
    context.action = 'REPLACE';
    context.location = addBasename(
      basename,
      isString(location) ? parsePath(location) : location,
    );
    context.url = createURL(context.location);
  };

  public handleListen = (): (() => void) => noop;

  public handleBlock = (): (() => void) => noop;

  public render({
    basename,
    context,
    location,
    ...props
  }: Readonly<
    { children: InfernoNode } & P & IStaticRouterProps<any>
  >): InfernoNode {
    return createComponentVNode(VNodeFlags.ComponentClass, Router, {
      ...props,
      history: {
        action: Action.Pop,
        block: this.handleBlock,
        createHref: this.createHref,
        go: staticHandler('go'),
        back: staticHandler('goBack'),
        forward: staticHandler('goForward'),
        listen: this.handleListen,
        location: stripBasename(basename, createLocation(location)) as Location,
        push: this.handlePush,
        replace: this.handleReplace,
      },
    }) as InfernoNode;
  }
}

if (process.env.NODE_ENV !== 'production') {
  StaticRouter.prototype.componentWillMount = function () {
    warning(
      !this.props.history,
      '<StaticRouter> ignores the history prop. To use a custom history, ' +
        'use `import { Router }` instead of `import { StaticRouter as Router }`.',
    );
  };
}

function normalizeLocation({ pathname = '/', search, hash }): Path {
  return {
    hash: (hash || '') === '#' ? '' : hash,
    pathname,
    search: (search || '') === '?' ? '' : search,
  };
}

function addBasename(
  basename: string | null | undefined,
  location: Location,
): Location {
  if (!basename) {
    return location;
  }

  return {
    ...location,
    pathname: addLeadingSlash(basename) + location.pathname,
  };
}

function stripBasename(
  basename: string | undefined | null,
  location: Path,
): Path {
  if (!basename) {
    return location;
  }

  const base = addLeadingSlash(basename);

  if (location.pathname.startsWith(base)) {
    return {
      ...location,
      pathname: location.pathname.substring(base.length),
    };
  } else {
    return location;
  }
}

function createLocation(location): Path {
  return typeof location === 'string'
    ? (parsePath(location) as Path)
    : normalizeLocation(location);
}

function createURL(location): string {
  return typeof location === 'string' ? location : combinePath(location);
}

function staticHandler(methodName) {
  return () => {
    invariant(false, 'You cannot %s with <StaticRouter>', methodName);
  };
}
