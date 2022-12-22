import { Component, createComponentVNode, VNode } from 'inferno';
import { matchPath } from './matchPath';
import { invariant, warning } from './utils';
import { combineFrom, isArray, isInvalid, isUndefined } from 'inferno-shared';
import { IRouteProps, Match } from './Route';
import { TLoader } from './Router';

function getMatch({ path, exact, strict, sensitive, loader, from }, route, location, router) {
  const pathProp = path || from;
  const { initialData } = router; // This is the parent route

  return pathProp ? matchPath(location.pathname, { path: pathProp, exact, strict, sensitive, loader, initialData }) : route.match;
}

function extractMatchFromChildren(children, route, location, router) {
  if (isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      const nestedMatch = extractMatchFromChildren(children[i], route, location, router);
      if (nestedMatch.match) return nestedMatch;
    }
    return {};
  }

  return {
    match: getMatch((children as any).props, route, location, router),
    _child: children
  }
}

type SwitchState = {
  match: Match<any>;
  _child: any;
}

export class Switch extends Component<IRouteProps, SwitchState> {
  constructor(props, context) {
    super(props);

    if (process.env.NODE_ENV !== 'production') {
      invariant(context.router, 'You should not use <Switch> outside a <Router>');
    }

    const { route } = context.router;
    const { location = route.location, children } = props;
    const { match, _child } = extractMatchFromChildren(children, route, location, context.router);

    this.state = {
      match,
      _child,
    }
  }

  private runLoader(loader: TLoader<any, any>, params, request, match, _child) {
    // TODO: Pass progress callback to loader
    loader({ params, request })
      .then((res) => {
        // TODO: should we parse json?
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

  public componentWillReceiveProps(nextProps, nextContext: any): void {
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

    const { route } = nextContext.router;
    const { location = route.location, children } = nextProps;

    // TODO: Check if location has updated?
    const { match, _child } = extractMatchFromChildren(children, route, location, nextContext.router);

    if (match?.loader) {
      const params = match.params;
      const request = undefined;
      this.runLoader(match.loader, params, request, match, _child);
      return;
    }

    this.setState({ match, _child })
  }

  // public componentWillUpdate(nextProps, nextState, nextContext: any): void {
  //   if (nextContext === this.context) return;

  // nextState;

  // }

  public render({ children, location }, { match, _child }, context): VNode | null {

    if (isInvalid(children)) {
      return null;
    }

    
    if (match) {
      location ??= context.router.location;
      return createComponentVNode(_child.flags, _child.type, combineFrom(_child.props, { location, computedMatch: match }));
    }

    return null;
  }
}

// if (process.env.NODE_ENV !== 'production') {
//   Switch.prototype.componentWillMount = function () {
//     invariant(this.context.router, 'You should not use <Switch> outside a <Router>');
//   };

//   Switch.prototype.componentWillReceiveProps = function (nextProps) {
//     warning(
//       !(nextProps.location && !this.props.location),
//       '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
//     );

//     warning(
//       !(!nextProps.location && this.props.location),
//       '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
//     );
//   };
// }
