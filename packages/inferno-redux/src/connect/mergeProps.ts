import { verifyPlainObject } from '../utils/verifyPlainObject';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
});

export const wrapMergePropsFunc = (mergeProps) => {
  return (_dispatch, { displayName, pure, areMergedPropsEqual }) => {
    let hasRunOnce = false;
    let mergedProps;

    return function (stateProps, dispatchProps, ownProps) {
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

export const whenMergePropsIsFunction = (mergeProps): unknown =>
  typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;

export const whenMergePropsIsOmitted = (mergeProps): unknown =>
  !mergeProps ? () => defaultMergeProps : undefined;

export const defaultMergePropsFactories = [
  whenMergePropsIsFunction,
  whenMergePropsIsOmitted,
];
