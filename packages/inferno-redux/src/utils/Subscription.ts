/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { Store, Unsubscribe } from "redux";
export type Listener = () => void;

interface IListenerCollection {
  clear: () => void;
  notify: () => void;
  subscribe: (listener: Listener) => Unsubscribe;
}

const CLEARED = null;
// tslint:disable-next-line:no-empty
const nullSubscriptionHandler: Unsubscribe = () => {};
const nullListenerCollection: IListenerCollection = {
  // tslint:disable-next-line:no-empty
  clear: () => {},
  // tslint:disable-next-line:no-empty
  notify: () => {},
  subscribe: (_: Listener) => nullSubscriptionHandler
};

const createListenerCollection = (): IListenerCollection => {
  // the current/next pattern is copied from redux's createStore code.
  let current: Listener[] | null = [];
  let next: Listener[] | null = [];

  return {
    clear: () => {
      next = CLEARED;
      current = CLEARED;
    },

    notify: () => {
      const listeners = (current = next!);
      for (let i = 0; i < listeners.length; i++) {
        listeners[i]();
      }
    },

    subscribe: (listener: Listener) => {
      let isSubscribed = true;
      if (next === current) {
        next = current!.slice();
      }
      next!.push(listener);

      const unsubscribe = () => {
        if (!isSubscribed || current === null) {
          return;
        }

        isSubscribed = false;
        if (next === current) {
          next = current.slice();
        }
        next!.splice(next!.indexOf(listener), 1);
      };

      return unsubscribe;
    }
  };
};

export class Subscription {
  private store: Store<any>;
  private parentSub: Subscription | null;
  private onStateChange: () => void;
  private unsubscribe: Unsubscribe | null;
  private listeners: IListenerCollection;
  constructor(
    store: Store<any>,
    parentSub: Subscription | null,
    onStateChange: () => void
  ) {
    this.store = store;
    this.parentSub = parentSub;
    this.onStateChange = onStateChange;
    this.unsubscribe = null;
    this.listeners = nullListenerCollection;
  }

  public addNestedSub(listener) {
    this.trySubscribe();
    return this.listeners.subscribe(listener);
  }

  public notifyNestedSubs() {
    this.listeners.notify();
  }

  public isSubscribed() {
    return Boolean(this.unsubscribe);
  }

  public trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.onStateChange)
        : this.store.subscribe(this.onStateChange);

      this.listeners = createListenerCollection();
    }
  }

  public tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.listeners.clear();
      this.listeners = nullListenerCollection;
    }
  }
}
