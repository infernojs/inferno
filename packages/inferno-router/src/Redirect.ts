import { Component } from 'inferno';
import { parsePath, Location, Path } from 'history';
import { combinePath, invariant } from './utils';
import { isString } from 'inferno-shared';

export interface RedirectProps {
  from?: string;
  to: string | Location;
  exact?: any;
  push?: boolean;
}

function getLocationTarget(to): Partial<Path> {
  if (!isString(to)) {
    to = combinePath(to);
  }

  return parsePath(to);
}

export class Redirect extends Component<RedirectProps, any> {
  public isStatic() {
    return this.context.router && this.context.router.staticContext;
  }

  public componentWillMount() {
    invariant(this.context.router, 'You should not use <Redirect> outside a <Router>');

    if (this.isStatic()) {
      this.perform();
    }
  }

  public componentDidMount() {
    if (!this.isStatic()) {
      this.perform();
    }
  }

  public componentDidUpdate(prevProps) {
    const prevTo = getLocationTarget(prevProps.to);
    const nextTo = getLocationTarget(this.props.to);

    if (prevTo.pathname === nextTo.pathname && prevTo.search === nextTo.search) {
      // tslint:disable-next-line:no-console
      console.error(`You tried to redirect to the same route you're currently on: "${nextTo.pathname}${nextTo.search}"`);
      return;
    }

    this.perform();
  }

  public perform() {
    const { history } = this.context.router;
    const { push = false, to } = this.props;

    if (push) {
      history.push(to);
    } else {
      history.replace(to);
    }
  }

  public render() {
    return null;
  }
}
