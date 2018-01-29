/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

import { Component } from 'inferno';
import { warning } from 'inferno-shared';

const specialKeys = {
  children: true,
  key: true,
  ref: true
};

export class Provider<P, S> extends Component<P, S> {
  public render(props) {
    return props.children;
  }

  public getChildContext() {
    const stores = {} as any;
    // inherit stores
    const props = this.props;
    const baseStores = this.context.mobxStores;

    if (baseStores) {
      for (const key in baseStores) {
        stores[key] = baseStores[key];
      }
    }
    // add own stores
    for (const key in props) {
      if ((specialKeys as any)[key] === void 0 && key !== 'suppressChangedStoreWarning') {
        stores[key] = props[key];
      }
    }

    return {
      mobxStores: stores
    };
  }
}

// Development warning
if (process.env.NODE_ENV !== 'production') {
  Provider.prototype.componentWillReceiveProps = function(nextProps) {
    // Maybe this warning is too aggressive?
    if (Object.keys(nextProps).length !== Object.keys(this.props).length) {
      warning('MobX Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children');
    }

    if (!nextProps.suppressChangedStoreWarning) {
      for (const key in nextProps) {
        if ((specialKeys as any)[key] === void 0 && this.props[key] !== nextProps[key]) {
          warning("MobX Provider: Provided store '" + key + "' has changed. Please avoid replacing stores as the change might not propagate to all children");
        }
      }
    }
  };
}
