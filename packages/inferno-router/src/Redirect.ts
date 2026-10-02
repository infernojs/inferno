import { Component, type InfernoNode } from 'inferno';
import { type Location, parsePath, type Path } from 'history';
import { combinePath, invariant } from './utils';
import { normalizeToLocation, splitLocation } from './locationUtils';
import { generatePath } from './matchPath';
import { type Match } from './Route';
import { isString } from 'inferno-shared';

export interface RedirectProps {
  from?: string;
  to: string | Partial<Location>;
  exact?: any;
  push?: boolean;
  computedMatch?: Match<any>;
}

function getLocationTarget(to): Partial<Path> {
  if (!isString(to)) {
    to = combinePath(to);
  }

  return parsePath(to);
}

export class Redirect extends Component<RedirectProps, any> {
  public isStatic(): boolean {
    return Boolean(this.context.router?.staticContext);
  }

  public componentWillMount(): void {
    invariant(
      this.context.router,
      'You should not use <Redirect> outside a <Router>',
    );

    if (this.isStatic()) {
      this.perform();
    }
  }

  public componentDidMount(): void {
    if (!this.isStatic()) {
      this.perform();
    }
  }

  public componentDidUpdate(prevProps): void {
    const prevTo = getLocationTarget(prevProps.to);
    const nextTo = getLocationTarget(this.props.to);

    if (
      prevTo.pathname === nextTo.pathname &&
      prevTo.search === nextTo.search
    ) {
      console.error(
        `You tried to redirect to the same route you're currently on: "${nextTo.pathname}${nextTo.search}"`,
      );
      return;
    }

    this.perform();
  }

  public perform(): void {
    const { history } = this.context.router;
    const { push = false, to: toProp, computedMatch } = this.props;
    let location = normalizeToLocation(toProp);

    // In a Switch, the params of the matched from path fill the to path
    if (computedMatch && location.pathname) {
      location = {
        ...location,
        pathname: generatePath(location.pathname, computedMatch.params),
      };
    }
    // history v5 takes the state as its own argument, as in Link
    const { to, state } = splitLocation(location);

    if (push) {
      history.push(to, state);
    } else {
      history.replace(to, state);
    }
  }

  public render(): InfernoNode {
    return null;
  }
}
