import { Component, VNode } from 'inferno';
import { Store, AnyAction } from 'redux';
import { warning } from '../utils/warning';

let didWarnAboutReceivingStore = false;
const warnAboutReceivingStore = () => {
  if (didWarnAboutReceivingStore) {
    return;
  }

  didWarnAboutReceivingStore = true;

  warning('<Provider> does not support changing `store` on the fly.');
};

export interface Props {
  store: Store<any>;
  children?: VNode | null | undefined;
}

export class Provider extends Component<Props, null> {
  public static displayName = 'Provider';
  private readonly store: Store<any, AnyAction | any>;

  constructor(props: Props, context: any) {
    super(props, context);
    this.store = props.store;
  }

  public getChildContext() {
    return { store: this.store, storeSubscription: null };
  }

  public render() {
    return this.props.children;
  }

  public componentWillReceiveProps?(nextProps: Props, nextContext: any): void;
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
