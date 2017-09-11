/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import { verifyPlainObject } from "../utils/verifyPlainObject";

export const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps
});

export const wrapMergePropsFunc = mergeProps => {
  return (dispatch, { displayName, pure, areMergedPropsEqual }) => {
    let hasRunOnce = false;
    let mergedProps;

    return function(stateProps, dispatchProps, ownProps) {
      const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

      if (hasRunOnce) {
        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) {
          mergedProps = nextMergedProps;
        }
      } else {
        hasRunOnce = true;
        mergedProps = nextMergedProps;

        if (process.env.NODE_ENV !== "production") {
          verifyPlainObject(mergedProps, displayName, "mergeProps");
        }
      }

      return mergedProps;
    };
  };
};

export const whenMergePropsIsFunction = mergeProps =>
  typeof mergeProps === "function" ? wrapMergePropsFunc(mergeProps) : undefined;

export const whenMergePropsIsOmitted = mergeProps =>
  !mergeProps ? () => defaultMergeProps : undefined;

export const defaultMergePropsFactories = [
  whenMergePropsIsFunction,
  whenMergePropsIsOmitted
];
