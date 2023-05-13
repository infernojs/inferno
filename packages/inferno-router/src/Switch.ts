import { Component, createComponentVNode, VNode } from 'inferno';
import { matchPath } from './matchPath';
import { invariant, warning } from './utils';
import { combineFrom, isArray, isInvalid } from 'inferno-shared';
import { IRouteProps, Match } from './Route';
import { RouterContext } from './Router';

function getMatch(pathname: string, { path, exact, strict, sensitive, loader, from }, router: { route, initialData?: any }) {
  path ??= from;
  const { initialData, route } = router; // This is the parent route

  return path ? matchPath(pathname, { path, exact, strict, sensitive, loader, initialData }) : route.match;
}

function extractFirstMatchFromChildren(pathname: string, children, router) {
  if (isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      const nestedMatch = extractFirstMatchFromChildren(pathname, children[i], router);
      if (nestedMatch.match) return nestedMatch;
    }
    return {};
  }

  return {
    _child: children,
    match: getMatch(pathname, (children as any).props, router),
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
    const { match, _child } = extractFirstMatchFromChildren(pathname, children, router);

    this.state = {
      _child,
      match,
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
    const { match, _child } = extractFirstMatchFromChildren(pathname, children, router);

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
