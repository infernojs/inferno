import { Component, type InfernoNode } from 'inferno';
import { invariant } from './utils';

export interface IPromptProps {
  when?: boolean;
  message: string;
}

/**
 * The public API for matching a single path and rendering.
 */
export class Prompt extends Component<IPromptProps, any> {
  public unblock;

  public enable(message): void {
    if (this.unblock) {
      this.unblock();
    }

    this.unblock = this.context.router.history.block((tx) => {
      if (message && window.confirm(message)) {
        this.unblock();
        tx.retry();
      }
    });
  }

  public disable(): void {
    if (this.unblock) {
      this.unblock();
      this.unblock = null;
    }
  }

  public componentWillMount(): void {
    invariant(
      this.context.router,
      'You should not use <Prompt> outside a <Router>',
    );

    if (this.props.when) {
      this.enable(this.props.message);
    }
  }

  public componentWillReceiveProps(nextProps): void {
    if (nextProps.when) {
      if (!this.props.when || this.props.message !== nextProps.message) {
        this.enable(nextProps.message);
      }
    } else {
      this.disable();
    }
  }

  public componentWillUnmount(): void {
    this.disable();
  }

  public render(): InfernoNode {
    return null;
  }
}
