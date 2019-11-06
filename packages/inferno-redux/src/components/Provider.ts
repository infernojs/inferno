import { Component, InfernoNode } from 'inferno';
import { Action, AnyAction, Store } from 'redux';
import { warning } from '../utils/warning';

let didWarnAboutReceivingStore = false;
const warnAboutReceivingStore = () => {
  if (didWarnAboutReceivingStore) {
    return;
  }

  didWarnAboutReceivingStore = true;

  warning('<Provider> does not support changing `store` on the fly.');
};

export interface Props<A extends Action = AnyAction> {
  store: Store<any, A>;
  children?: InfernoNode;
}

export class Provider<A extends Action = AnyAction> extends Component<Props<A>, null> {
  public static displayName = 'Provider';
  private readonly store: Store<any, A>;

  constructor(props: Props<A>, context: any) {
    super(props, context);
    this.store = props.store;
  }

  public getChildContext() {
    return { store: this.store, storeSubscription: null };
  }

  // Don't infer the return type. It may be expanded and cause reference errors
  // in the output.
  public render(): InfernoNode | undefined {
    return this.props.children;
  }

  public componentWillReceiveProps?(nextProps: Props<A>, nextContext: any): void;
}

if (process.env.NODE_ENV !== 'production') {
  Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    const { store } = this;
    const { store: nextStore } = nextProps;

    if (store !== nextStore) {
      warnAboutReceivingStore();
    }
  };
}
