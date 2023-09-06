import { type Store, type Unsubscribe } from 'redux';

export type Listener = () => void;

interface IListenerCollection {
  clear: () => void;
  notify: () => void;
  subscribe: (listener: Listener) => Unsubscribe;
}

const CLEARED = null;
const nullSubscriptionHandler: Unsubscribe = () => {};
const nullListenerCollection: IListenerCollection = {
  clear: () => {},
  notify: () => {},
  subscribe: (_: Listener) => nullSubscriptionHandler,
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
      for (let i = 0; i < listeners.length; ++i) {
        listeners[i]();
      }
    },

    subscribe: (listener: Listener) => {
      let isSubscribed = true;
      if (next === current) {
        next = current!.slice();
      }
      next!.push(listener);

      return () => {
        if (!isSubscribed || current === null) {
          return;
        }

        isSubscribed = false;
        if (next === current) {
          next = current.slice();
        }
        next!.splice(next!.indexOf(listener), 1);
      };
    },
  };
};

export class Subscription {
  private readonly store: Store<any>;
  private readonly parentSub: Subscription | null;
  private readonly onStateChange: () => void;
  private unsubscribe: Unsubscribe | null;
  private listeners: IListenerCollection;
  constructor(
    store: Store<any>,
    parentSub: Subscription | null,
    onStateChange: () => void,
  ) {
    this.store = store;
    this.parentSub = parentSub;
    this.onStateChange = onStateChange;
    this.unsubscribe = null;
    this.listeners = nullListenerCollection;
  }

  public addNestedSub(listener): Unsubscribe {
    this.trySubscribe();
    return this.listeners.subscribe(listener);
  }

  public notifyNestedSubs(): void {
    this.listeners.notify();
  }

  public isSubscribed(): boolean {
    return Boolean(this.unsubscribe);
  }

  public trySubscribe(): void {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.onStateChange)
        : this.store.subscribe(this.onStateChange);

      this.listeners = createListenerCollection();
    }
  }

  public tryUnsubscribe(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.listeners.clear();
      this.listeners = nullListenerCollection;
    }
  }
}
