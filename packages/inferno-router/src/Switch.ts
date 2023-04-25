import { Component, createComponentVNode, VNode } from 'inferno';
import { matchPath } from './matchPath';
import { invariant, warning } from './utils';
import { combineFrom, isArray, isInvalid } from 'inferno-shared';
import { IRouteProps } from './Route';

function getMatch({ path, exact, strict, sensitive, from }, route, location) {
  const pathProp = path || from;

  return pathProp ? matchPath(location.pathname, { path: pathProp, exact, strict, sensitive }) : route.match;
}

function extractMatchFromChildren(children, route, location, router) {
  if (isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      const nestedMatch = extractMatchFromChildren(children[i], route, location, router);
      if (nestedMatch.match) return nestedMatch;
    }
  }

  return {
    match: getMatch((children as any).props, route, location, router),
    _child: children
  }
}
}

export class Switch extends Component<IRouteProps, any> {
  public render(): VNode | null {
    const { route } = this.context.router;
    const { children } = this.props;
    const location = this.props.location || route.location;

    if (isInvalid(children)) {
      return null;
    }

    const { match, _child } = extractMatchFromChildren(children, route, location);

    if (match) {
      return createComponentVNode(_child.flags, _child.type, combineFrom(_child.props, { location, computedMatch: match }));
    }

    return null;
  }
}

if (process.env.NODE_ENV !== 'production') {
  Switch.prototype.componentWillMount = function () {
    invariant(this.context.router, 'You should not use <Switch> outside a <Router>');
  };

  Switch.prototype.componentWillReceiveProps = function (nextProps) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}
