/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { cloneVNode, VNode, Component } from "inferno";
import matchPath from "./matchPath";
import { Children, isValidElement, warning, invariant } from "./utils";

export interface ISwitchProps {
  router: any;
  children: Array<Component<any, any>>;
}

/**
 * The public API for rendering the first <Route> that matches.
 */
export default class Switch extends Component<ISwitchProps, any> {
  componentWillMount() {
    invariant(
      this.context.router,
      "You should not use <Switch> outside a <Router>"
    );
  }

  componentWillReceiveProps(nextProps) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  }

  render(): VNode | null {
    const { route } = this.context.router;
    const { children } = this.props;
    const location = this.props.location || route.location;

    let match, child;
    Children.forEach(children, element => {
      if (!isValidElement(element)) return;

      const { path: pathProp, exact, strict, sensitive, from } = element.props;
      const path = pathProp || from;

      if (match == null) {
        child = element;
        match = path
          ? matchPath(location.pathname, { path, exact, strict, sensitive })
          : route.match;
      }
    });

    return match ? cloneVNode(child, { location, computedMatch: match }) : null;
  }
}
