import { Component, createComponentVNode, VNode } from 'inferno';
import { matchPath } from './matchPath';
import { invariant, warning } from './utils';
import { combineFrom, isArray, isInvalid, isUndefined } from 'inferno-shared';
import { IRouteProps, Match } from './Route';
import { RouterContext, TLoader } from './Router';

function getMatch(pathname: string, { path, exact, strict, sensitive, loader, from }, router: { route, initialData?: any }) {
  path ??= from;
  const { initialData, route } = router; // This is the parent route

  return path ? matchPath(pathname, { path, exact, strict, sensitive, loader, initialData }) : route.match;
}

function extractMatchFromChildren(pathname: string, children, router) {
  if (isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      const nestedMatch = extractMatchFromChildren(pathname, children[i], router);
      if (nestedMatch.match) return nestedMatch;
    }
    return {};
  }

  return {
    match: getMatch(pathname, (children as any).props, router),
    _child: children
  }
}

type SwitchState = {
  match: Match<any>;
  _child: any;
}

export class Switch extends Component<IRouteProps, SwitchState> {
  constructor(props, context: RouterContext) {
    super(props, context);

    if (process.env.NODE_ENV !== 'production') {
      invariant(context.router, 'You should not use <Switch> outside a <Router>');
    }

    const { router } = context;
    const { location, children } = props;
    const pathname = (location || router.route.location).pathname;
    const { match, _child } = extractMatchFromChildren(pathname, children, router);

    this.state = {
      match,
      _child,
    }
  }

  private runLoader(loader: TLoader<any, any>, params, request, match, _child) {
    // TODO: Pass progress callback to loader
    loader({ params, request })
      .then((res) => {
        // TODO: react-router parses json
        // NOTE: The route stores initialData in state
        match.initialData = { res };
        this.setState({ match, _child });
      })
      .catch((err) => {
        // Loaders should throw errors
        match.initialData = { err };
        this.setState({ match, _child })
      });
  }

  public componentDidMount(): void {
    const { match, _child } = this.state!;
    // QUESTION: Is there a better way to invoke this on/after first render?
    if (!isUndefined(match?.loader) && isUndefined(match?.initialData)) {
      const params = match.params;
      const request = undefined;
      this.runLoader(match.loader!, params, request, match, _child);
    }
  }

  public componentWillReceiveProps(nextProps: IRouteProps, nextContext: RouterContext): void {
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !(nextProps.location && !this.props.location),
        '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
      );

      warning(
        !(!nextProps.location && this.props.location),
        '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
      );
    }

    const { router } = nextContext;
    const { location, children } = nextProps;
    const pathname = (location || router.route.location).pathname;
    const { match, _child } = extractMatchFromChildren(pathname, children, router);

    if (match?.loader) {
      const params = match.params;
      const request = undefined;
      this.runLoader(match.loader, params, request, match, _child);
      return;
    }

    this.setState({ match, _child })
  }

  public render({ children, location }: IRouteProps, { match, _child }: SwitchState, context: RouterContext): VNode | null {

    if (isInvalid(children)) {
      return null;
    }

    
    if (match) {
      location ??= context.router.route.location;
      return createComponentVNode(_child.flags, _child.type, combineFrom(_child.props, { location, computedMatch: match }));
    }

    return null;
  }
}
