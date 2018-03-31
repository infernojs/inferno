import { Component, createComponentVNode, VNode } from 'inferno';
import { matchPath } from './matchPath';
import { Children, invariant, isValidElement, warning } from './utils';
import { combineFrom } from 'inferno-shared';
import { IRouteProps } from './Route';

/**
 * The public API for rendering the first <Route> that matches.
 */
export class Switch extends Component<IRouteProps, any> {
  public componentWillMount() {
    invariant(this.context.router, 'You should not use <Switch> outside a <Router>');
  }

  public componentWillReceiveProps(nextProps) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  }

  public render(): VNode | null {
    const { route } = this.context.router;
    const { children } = this.props;
    const location = this.props.location || route.location;

    let match;
    let child;

    // optimization: Better to use for loop here so we can return when match found, instead looping through everything
    Children.forEach(children, element => {
      if (!isValidElement(element)) {
        return;
      }

      const { path: pathProp, exact, strict, sensitive, from } = element.props;
      const path = pathProp || from;

      if (match == null) {
        child = element;
        match = path ? matchPath(location.pathname, { path, exact, strict, sensitive }) : route.match;
      }
    });

    return match ? createComponentVNode(child.flags, child.type, combineFrom(child.props, { location, computedMatch: match }), null, child.ref) : null;
  }
}
