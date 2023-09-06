import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps';

import { bindActionCreators } from 'redux';

export const whenMapDispatchToPropsIsFunction = (
  mapDispatchToProps,
): unknown =>
  typeof mapDispatchToProps === 'function'
    ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')
    : undefined;

export const whenMapDispatchToPropsIsMissing = (mapDispatchToProps): unknown =>
  !mapDispatchToProps
    ? wrapMapToPropsConstant((dispatch) => ({ dispatch }))
    : undefined;

export const whenMapDispatchToPropsIsObject = (mapDispatchToProps): unknown =>
  mapDispatchToProps && typeof mapDispatchToProps === 'object'
    ? wrapMapToPropsConstant((dispatch) =>
        bindActionCreators(mapDispatchToProps, dispatch),
      )
    : undefined;

export const defaultMapDispatchToPropsFactories = [
  whenMapDispatchToPropsIsFunction,
  whenMapDispatchToPropsIsMissing,
  whenMapDispatchToPropsIsObject,
];
