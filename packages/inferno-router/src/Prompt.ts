/**
 * @module Inferno-Router
 */
/** TypeDoc Comment */

import Component from "inferno-component";
import { invariant } from "./utils";

export interface IPromptProps {
  when: any;
  message: string;
}

/**
 * The public API for matching a single path and rendering.
 */
class Prompt extends Component<IPromptProps, any> {

  public unblock;

  enable(message) {
    if (this.unblock)
      this.unblock();

    this.unblock = this.context.router.history.block(message);
  }

  disable() {
    if (this.unblock) {
      this.unblock();
      this.unblock = null;
    }
  }

  componentWillMount() {
    invariant(
      this.context.router,
      'You should not use <Prompt> outside a <Router>'
    );

    if (this.props.when) {
      this.enable(this.props.message);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.when) {
      if (!this.props.when || this.props.message !== nextProps.message) {
        this.enable(nextProps.message);
      }
    } else {
      this.disable();
    }
  }

  componentWillUnmount() {
    this.disable();
  }

  render() {
    return null;
  }
}

export default Prompt;
