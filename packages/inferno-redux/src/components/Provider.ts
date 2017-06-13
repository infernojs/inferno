/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { isNullOrUndef, toArray } from "inferno-shared";

import Component from "inferno-component";
import { Store } from "redux";
import { warning } from "../utils/warning";

let didWarnAboutReceivingStore = false;
const warnAboutReceivingStore = () => {
  if (didWarnAboutReceivingStore) {
    return;
  }

  didWarnAboutReceivingStore = true;

  warning("<Provider> does not support changing `store` on the fly.");
};

export interface Props {
  store: Store<any>;
  children: any;
}

export class Provider extends Component<Props, any> {
  public static displayName = "Provider";
  private store: Store<any>;

  constructor(props: Props, context: any) {
    super(props, context);
    this.store = props.store;
  }

  public getChildContext() {
    return { store: this.store, storeSubscription: null };
  }

  public render() {
    // TODO: Maybe not allocate an array here for no reason?
    if (
      isNullOrUndef(this.props.children) ||
      toArray(this.props.children).length !== 1
    ) {
      throw Error(
        "Inferno Error: Only one child is allowed within the `Provider` component"
      );
    }

    return this.props.children;
  }
}

if (process.env.NODE_ENV !== "production") {
  Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(
    nextProps
  ) {
    const { store } = this;
    const { store: nextStore } = nextProps;

    if (store !== nextStore) {
      warnAboutReceivingStore();
    }
  };
}
