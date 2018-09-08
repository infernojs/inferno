import { verifyPlainObject } from '../utils/verifyPlainObject';
import { combineFrom } from 'inferno-shared';

export const defaultMergeProps = (stateProps, dispatchProps, ownProps) => {
  const merged = combineFrom(ownProps, stateProps);

  if (dispatchProps) {
    for (const key in dispatchProps) {
      merged[key] = dispatchProps[key];
    }
  }

  return merged;
};

export const wrapMergePropsFunc = mergeProps => {
  return (_dispatch, { displayName, pure, areMergedPropsEqual }) => {
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

        if (process.env.NODE_ENV !== 'production') {
          verifyPlainObject(mergedProps, displayName, 'mergeProps');
        }
      }

      return mergedProps;
    };
  };
};

export const whenMergePropsIsFunction = mergeProps => (typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined);

export const whenMergePropsIsOmitted = mergeProps => (!mergeProps ? () => defaultMergeProps : undefined);

export const defaultMergePropsFactories = [whenMergePropsIsFunction, whenMergePropsIsOmitted];
