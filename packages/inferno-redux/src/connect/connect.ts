import {
  connectAdvanced,
  type IConnectOptions,
} from '../components/connectAdvanced';
import { type Dispatch } from 'redux';
import { shallowEqual } from '../utils/shallowEqual';
import { defaultMapDispatchToPropsFactories } from './mapDispatchToProps';
import { defaultMapStateToPropsFactories } from './mapStateToProps';
import { defaultMergePropsFactories } from './mergeProps';
import { defaultSelectorFactory } from './selectorFactory';

const match = (arg, factories, name): any => {
  for (let i = factories.length - 1; i >= 0; i--) {
    const result = factories[i](arg);
    if (result) {
      return result;
    }
  }

  return (_dispatch: Dispatch<any>, options: IConnectOptions) => {
    throw new Error(
      `Invalid value of type ${typeof arg} for ${name} argument when connecting component ${
        (options as any).wrappedComponentName
      }.`,
    );
  };
};

const strictEqual = (a, b): boolean => a === b;

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
export const createConnect =
  ({
    connectHOC = connectAdvanced,
    mapStateToPropsFactories = defaultMapStateToPropsFactories,
    mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
    mergePropsFactories = defaultMergePropsFactories,
    selectorFactory = defaultSelectorFactory,
  } = {}) =>
  (
    mapStateToProps?,
    mapDispatchToProps?,
    mergeProps?,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {},
  ) => {
    const initMapStateToProps = match(
      mapStateToProps,
      mapStateToPropsFactories,
      'mapStateToProps',
    );
    const initMapDispatchToProps = match(
      mapDispatchToProps,
      mapDispatchToPropsFactories,
      'mapDispatchToProps',
    );
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

    return connectHOC(selectorFactory as any, {
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: (name) => `Connect(${name})`,

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: !!mapStateToProps,

      // passed through to selectorFactory
      areMergedPropsEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areStatesEqual,
      initMapDispatchToProps,
      initMapStateToProps,
      initMergeProps,
      pure,
      ...extraOptions /* any extra options args can override defaults of connect or connectAdvanced */,
    });
  };

export const connect = createConnect();
