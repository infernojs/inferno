/**
 * @module Inferno-Router
 */
/** TypeDoc Comment */

import { Component } from 'inferno';
import { invariant } from './utils';

export interface IPromptProps {
  when: any;
  message: string;
}

/**
 * The public API for matching a single path and rendering.
 */
export class Prompt extends Component<IPromptProps, any> {
  public unblock;

  public enable(message) {
    if (this.unblock) {
      this.unblock();
    }

    this.unblock = this.context.router.history.block(message);
  }

  public disable() {
    if (this.unblock) {
      this.unblock();
      this.unblock = null;
    }
  }

  public componentWillMount() {
    invariant(this.context.router, 'You should not use <Prompt> outside a <Router>');

    if (this.props.when) {
      this.enable(this.props.message);
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.when) {
      if (!this.props.when || this.props.message !== nextProps.message) {
        this.enable(nextProps.message);
      }
    } else {
      this.disable();
    }
  }

  public componentWillUnmount() {
    this.disable();
  }

  public render() {
    return null;
  }
}
