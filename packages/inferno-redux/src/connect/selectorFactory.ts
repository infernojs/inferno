/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { verifySubselectors } from "./verifySubselectors";

export const impureFinalPropsSelectorFactory = (
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  dispatch
) => {
  const impureFinalPropsSelector = (state, ownProps) => {
    return mergeProps(
      mapStateToProps(state, ownProps),
      mapDispatchToProps(dispatch, ownProps),
      ownProps
    );
  };

  return impureFinalPropsSelector;
};

export const pureFinalPropsSelectorFactory = (
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  dispatch,
  { areStatesEqual, areOwnPropsEqual, areStatePropsEqual }
) => {
  let hasRunAtLeastOnce = false;
  let state;
  let ownProps;
  let stateProps;
  let dispatchProps;
  let mergedProps;

  const handleFirstCall = (firstState, firstOwnProps) => {
    state = firstState;
    ownProps = firstOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    return mergedProps;
  };

  const handleNewPropsAndNewState = () => {
    stateProps = mapStateToProps(state, ownProps);

    if (mapDispatchToProps.dependsOnOwnProps) {
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
    }

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  };

  const handleNewProps = () => {
    if (mapStateToProps.dependsOnOwnProps) {
      stateProps = mapStateToProps(state, ownProps);
    }

    if (mapDispatchToProps.dependsOnOwnProps) {
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
    }

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  };

  const handleNewState = () => {
    const nextStateProps = mapStateToProps(state, ownProps);
    const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;

    if (statePropsChanged) {
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    }

    return mergedProps;
  };

  const handleSubsequentCalls = (nextState, nextOwnProps) => {
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
    const stateChanged = !areStatesEqual(nextState, state);
    state = nextState;
    ownProps = nextOwnProps;

    if (propsChanged && stateChanged) {
      return handleNewPropsAndNewState();
    }
    if (propsChanged) {
      return handleNewProps();
    }
    if (stateChanged) {
      return handleNewState();
    }
    return mergedProps;
  };

  const pureFinalPropsSelector = (nextState, nextOwnProps) =>
    hasRunAtLeastOnce
      ? handleSubsequentCalls(nextState, nextOwnProps)
      : handleFirstCall(nextState, nextOwnProps);

  return pureFinalPropsSelector;
};

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.
export const defaultSelectorFactory = (
  dispatch,
  { initMapStateToProps, initMapDispatchToProps, initMergeProps, ...opts }
) => {
  const options: any = opts; // trick typescript
  const mapStateToProps = initMapStateToProps(dispatch, options);
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  const mergeProps = initMergeProps(dispatch, options);

  if (process.env.NODE_ENV !== "production") {
    verifySubselectors(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options.displayName
    );
  }

  const selectorFactory = options.pure
    ? pureFinalPropsSelectorFactory
    : impureFinalPropsSelectorFactory;

  return selectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
    options
  );
};
