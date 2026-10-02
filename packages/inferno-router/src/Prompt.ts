import { Component, type InfernoNode } from 'inferno';
import { Action, type Transition, type Update } from 'history';
import type { GetUserConfirmation, RouterContext } from './Router';
import { invariant } from './utils';

export interface IPromptProps {
  when?: boolean;
  message: string;
}

/**
 * Blocks navigation while enabled, using the router's confirmation handler.
 */
export class Prompt extends Component<IPromptProps, any> {
  public unblock: (() => void) | null = null;
  private unmounted = false;
  private active = false;
  private message = '';
  private getUserConfirmation?: GetUserConfirmation;
  private confirmation: { cleanup?: () => void } | null = null;
  private unlisten: (() => void) | null = null;
  private generation = 0;

  public enable(
    message: string,
    getUserConfirmation?: GetUserConfirmation,
  ): void {
    this.generation++;
    this.active = true;
    this.message = message;
    this.getUserConfirmation = getUserConfirmation;
    this.cancelConfirmation();
    if (this.unblock) {
      this.unblock();
      this.unblock = null;
    }

    // A browser POP retry is asynchronous. Prop/context updates must not
    // reinstall the blocker before that navigation has committed either.
    if (!this.unlisten) {
      this.unblock = this.context.router.history.block(this.confirm);
    }
  }

  private cancelConfirmation(): void {
    const confirmation = this.confirmation;
    this.confirmation = null;
    if (confirmation?.cleanup) {
      confirmation.cleanup();
    }
  }

  private confirm = (tx: Transition): void => {
    if (!this.active || this.confirmation || !this.message) {
      return;
    }

    const confirmation: { cleanup?: () => void } = {};
    const generation = this.generation;
    this.confirmation = confirmation;
    const resolve = (allow: boolean): void => {
      // Ignore duplicate replies and replies to a disabled or replaced prompt.
      if (this.confirmation !== confirmation) {
        return;
      }
      this.cancelConfirmation();
      if (allow && this.active && generation === this.generation) {
        this.retry(tx);
      }
    };

    try {
      const cleanup = this.getUserConfirmation
        ? this.getUserConfirmation(this.message, resolve)
        : resolve(window.confirm(this.message));

      if (typeof cleanup === 'function') {
        if (this.confirmation === confirmation) {
          confirmation.cleanup = cleanup;
        } else {
          // A handler may resolve (or disable the prompt) before returning.
          cleanup();
        }
      }
    } catch (error) {
      if (this.confirmation === confirmation) {
        this.cancelConfirmation();
      }
      throw error;
    }
  };

  private retry(tx: Transition): void {
    if (this.unblock) {
      this.unblock();
      this.unblock = null;
    }

    // Subscribe before retry: PUSH, REPLACE and memory POP can commit
    // synchronously, whereas browser/hash POP commits on a later popstate.
    const unlisten = this.context.router.history.listen((update: Update) => {
      if (this.unlisten !== unlisten) {
        return;
      }
      // Hash history can deliver the blocked transaction on hashchange before
      // its restoring POP arrives. Wait for the requested entry, not that POP.
      if (
        tx.action === Action.Pop &&
        update.action === Action.Pop &&
        update.location.key !== tx.location.key
      ) {
        return;
      }
      unlisten();
      this.unlisten = null;
      if (this.active && !this.unmounted) {
        this.enable(this.message, this.getUserConfirmation);
      }
    });
    this.unlisten = unlisten;

    try {
      tx.retry();
    } catch (error) {
      if (this.unlisten === unlisten) {
        unlisten();
        this.unlisten = null;
        if (this.active && !this.unmounted) {
          this.enable(this.message, this.getUserConfirmation);
        }
      }
      throw error;
    }
  }

  public disable(): void {
    this.generation++;
    this.active = false;
    this.cancelConfirmation();
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
      this.enable(this.props.message, this.context.router.getUserConfirmation);
    }
  }

  public componentWillReceiveProps(
    nextProps: IPromptProps,
    nextContext: RouterContext,
  ): void {
    if (nextProps.when) {
      if (
        !this.props.when ||
        this.props.message !== nextProps.message ||
        this.getUserConfirmation !== nextContext.router.getUserConfirmation
      ) {
        this.enable(nextProps.message, nextContext.router.getUserConfirmation);
      }
    } else {
      this.disable();
    }
  }

  public componentWillUnmount(): void {
    this.unmounted = true;
    this.disable();
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
  }

  public render(): InfernoNode {
    return null;
  }
}
